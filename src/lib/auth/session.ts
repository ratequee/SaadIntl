import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "sip_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

type SessionPayload = {
  email: string;
  exp: number;
};

function secret() {
  return process.env.AUTH_SECRET || "dev-only-change-me";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function encode(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return decode(token);
}

export async function createAdminSession(email: string) {
  const jar = await cookies();
  jar.set(COOKIE, encode({ email, exp: Date.now() + MAX_AGE * 1000 }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

function safeEqual(a: string, b: string) {
  const left = createHmac("sha256", secret()).update(a).digest();
  const right = createHmac("sha256", secret()).update(b).digest();
  return timingSafeEqual(left, right);
}

export function verifyLocalAdmin(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL || "";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  if (!expectedEmail || !expectedPassword) return false;
  return safeEqual(email, expectedEmail) && safeEqual(password, expectedPassword);
}
