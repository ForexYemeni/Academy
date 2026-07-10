import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "sonic-academy-super-secret-2026-change-me";
const TOKEN_COOKIE = "sa_token";
const TOKEN_TTL_DAYS = 30;

export interface JwtPayload {
  sub: string; // user id
  role: "ADMIN" | "MODERATOR" | "STUDENT";
  phone: string;
  name: string;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${TOKEN_TTL_DAYS}d` } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const c = await cookies();
  c.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * TOKEN_TTL_DAYS,
  });
}

export async function clearAuthCookie() {
  const c = await cookies();
  c.delete(TOKEN_COOKIE);
}

export async function getToken(): Promise<string | undefined> {
  const c = await cookies();
  return c.get(TOKEN_COOKIE)?.value;
}

export async function getCurrentUser() {
  const token = await getToken();
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = await db.user.findUnique({
    where: { id: payload.sub },
    include: { moderator: true },
  });
  if (!user) return null;
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireModeratorOrAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

// Phone validation: +9677XXXXXXXX or 7XXXXXXXX
export function normalizeYemeniPhone(raw: string): string | null {
  if (!raw) return null;
  let phone = raw.replace(/[\s\-()]/g, "");
  // +9677XXXXXXXX
  if (/^\+9677\d{8}$/.test(phone)) return phone;
  // 9677XXXXXXXX
  if (/^9677\d{8}$/.test(phone)) return "+" + phone;
  // 7XXXXXXXX (9 digits total starting with 7)
  if (/^7\d{8}$/.test(phone)) return "+967" + phone;
  return null;
}
