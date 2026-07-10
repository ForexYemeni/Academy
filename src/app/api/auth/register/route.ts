import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  hashPassword,
  signToken,
  setAuthCookie,
  normalizeYemeniPhone,
} from "@/lib/auth";

// POST /api/auth/register
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fullName = (body.fullName || "").toString().trim();
    const phoneRaw = (body.phone || "").toString().trim();
    const password = (body.password || "").toString().trim();
    const referralCode = (body.referralCode || "").toString().trim() || null;

    if (!fullName || fullName.length < 3) {
      return NextResponse.json({ ok: false, error: "auth.name.min" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ ok: false, error: "auth.password.min" }, { status: 400 });
    }
    const phone = normalizeYemeniPhone(phoneRaw);
    if (!phone) {
      return NextResponse.json({ ok: false, error: "auth.phone.hint" }, { status: 400 });
    }

    const exists = await db.user.findUnique({ where: { phone } });
    if (exists) {
      return NextResponse.json({ ok: false, error: "auth.phone.exists" }, { status: 409 });
    }

    // Resolve referrer
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

    return NextResponse.json({
      ok: true,
      user: { id: user.id, role: user.role, name: user.fullName },
    });
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
