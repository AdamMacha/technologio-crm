import { cookies } from "next/headers";

const COOKIE_NAME = "technologio_session";

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getAppPassword(): string {
  return process.env.APP_PASSWORD || "technologio2026";
}

export async function getExpectedToken(): Promise<string> {
  const password = getAppPassword();
  const secret = process.env.CRON_SECRET || "technologio-auth-salt";
  return sha256(`${password}:${secret}`);
}

export async function verifyPassword(inputPassword: string): Promise<boolean> {
  const expected = getAppPassword();
  return inputPassword.trim() === expected.trim();
}

export async function createSession(): Promise<void> {
  const token = await getExpectedToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dní
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return false;

  const expected = await getExpectedToken();
  return cookie.value === expected;
}

export async function isTokenValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await getExpectedToken();
  return token === expected;
}
