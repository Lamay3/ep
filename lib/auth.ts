import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE = "ep_admin";
const MAX_AGE = 60 * 60 * 12; // 12 ore

export interface AdminUser { username: string; displayName: string }
interface Account extends AdminUser { password: string }

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET lipsește sau e prea scurt.");
  return "dev-only-secret-change-me";
}

export function accounts(): Account[] {
  try {
    const list = JSON.parse(process.env.ADMIN_USERS ?? "[]") as Partial<Account>[];
    return list
      .filter((a): a is Account => Boolean(a.username && a.password))
      .map((a) => ({ username: a.username, password: a.password, displayName: a.displayName || a.username }));
  } catch { return []; }
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");
const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export function checkLogin(username: string, password: string): AdminUser | null {
  // parcurgem mereu toate conturile, ca timpul de răspuns să nu trădeze dacă userul există
  let found: Account | null = null;
  for (const a of accounts()) {
    const okUser = same(a.username.toLowerCase(), username.toLowerCase());
    const okPass = same(createHmac("sha256", "p").update(a.password).digest("hex"), createHmac("sha256", "p").update(password).digest("hex"));
    if (okUser && okPass) found = a;
  }
  return found ? { username: found.username, displayName: found.displayName } : null;
}

export function makeToken(user: AdminUser): string {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readToken(token?: string): AdminUser | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !same(sig, sign(payload))) return null;
  try {
    const d = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof d.exp !== "number" || d.exp < Date.now()) return null;
    // contul trebuie să existe în continuare în configurație
    if (!accounts().some((a) => a.username === d.username)) return null;
    return { username: d.username, displayName: d.displayName };
  } catch { return null; }
}

export async function getSession(): Promise<AdminUser | null> {
  return readToken((await cookies()).get(COOKIE)?.value);
}

export const cookieOptions = {
  httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE,
};
