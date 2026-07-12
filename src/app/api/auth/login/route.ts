import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifyPassword,
  signToken,
  setAuthCookie,
  normalizeYemeniPhone,
} from "@/lib/auth";

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phoneRaw = (body.phone || "").toString().trim();
    const password = (body.password || "").toString().trim();
    const phone = normalizeYemeniPhone(phoneRaw);

    if (!phone || !password) {
      return NextResponse.json(
        { ok: false, error: "auth.invalid" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { phone } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { ok: false, error: "auth.invalid" },
        { status: 401 }
      );
    }

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

    return NextResponse.json({
      ok: true,
      user: { id: user.id, role: user.role, name: user.fullName },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
