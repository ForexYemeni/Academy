"use server";

import { db } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  signToken,
  setAuthCookie,
  clearAuthCookie,
  normalizeYemeniPhone,
} from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function registerAction(formData: FormData): Promise<AuthResult> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const phoneRaw = (formData.get("phone") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  const referralCode = (formData.get("referralCode") as string | null)?.trim() || null;

  if (!fullName || fullName.length < 3) return { ok: false, error: "auth.name.min" };
  if (!password || password.length < 6) return { ok: false, error: "auth.password.min" };
  const phone = normalizeYemeniPhone(phoneRaw || "");
  if (!phone) return { ok: false, error: "auth.phone.hint" };

  const exists = await db.user.findUnique({ where: { phone } });
  if (exists) return { ok: false, error: "auth.phone.exists" };

  // Resolve referrer (if any)
  let referredById: string | null = null;
  if (referralCode) {
    const ref = await db.user.findUnique({ where: { referralCode } });
    if (ref) referredById = ref.id;
  }

  // First user becomes ADMIN
  const userCount = await db.user.count();
  const role = userCount === 0 ? "ADMIN" : "STUDENT";

  const user = await db.user.create({
    data: {
      fullName,
      phone,
      passwordHash: hashPassword(password),
      role,
      referredById,
    },
  });

  // If referred, give the referrer a tiny reward token (just a counter)
  if (referredById) {
    await db.user.update({
      where: { id: referredById },
      data: { referralRewards: { increment: 1 } },
    });
  }

  const token = signToken({
    sub: user.id,
    role: user.role as "ADMIN" | "MODERATOR" | "STUDENT",
    phone: user.phone,
    name: user.fullName,
  });
  await setAuthCookie(token);
  revalidatePath("/");
  return { ok: true };
}

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const phoneRaw = (formData.get("phone") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  const phone = normalizeYemeniPhone(phoneRaw || "");
  if (!phone || !password) return { ok: false, error: "auth.invalid" };

  const user = await db.user.findUnique({ where: { phone } });
  if (!user) return { ok: false, error: "auth.invalid" };
  if (!verifyPassword(password, user.passwordHash))
    return { ok: false, error: "auth.invalid" };

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = signToken({
    sub: user.id,
    role: user.role as "ADMIN" | "MODERATOR" | "STUDENT",
    phone: user.phone,
    name: user.fullName,
  });
  await setAuthCookie(token);
  revalidatePath("/");
  return { ok: true };
}

export async function logoutAction() {
  await clearAuthCookie();
  revalidatePath("/");
  redirect("/");
}

export async function changePasswordAction(formData: FormData): Promise<AuthResult> {
  const { getCurrentUser } = await import("@/lib/auth");
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  const current = (formData.get("current") as string)?.trim();
  const next = (formData.get("next") as string)?.trim();
  if (!verifyPassword(current || "", user.passwordHash))
    return { ok: false, error: "auth.invalid" };
  if (!next || next.length < 6) return { ok: false, error: "auth.password.min" };

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(next) },
  });
  return { ok: true };
}

export async function updateProfileAction(formData: FormData): Promise<AuthResult> {
  const { getCurrentUser } = await import("@/lib/auth");
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };

  const fullName = (formData.get("fullName") as string)?.trim();
  const avatar = (formData.get("avatar") as string | null) || null;

  if (!fullName || fullName.length < 3) return { ok: false, error: "auth.name.min" };

  await db.user.update({
    where: { id: user.id },
    data: { fullName, ...(avatar ? { avatar } : {}) },
  });
  revalidatePath("/");
  return { ok: true };
}
