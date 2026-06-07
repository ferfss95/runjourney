import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { JWT_COOKIE_NAME, SESSION_DURATION_DAYS } from "./constants";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
};

export async function createSession(username: string): Promise<string> {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(getSecret());
  return token;
}

export async function verifySession(
  token: string
): Promise<{ username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.username !== "string") return null;
    return { username: payload.username };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(JWT_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function validateCredentials(
  username: string,
  password: string
): boolean {
  const appUser = process.env.APP_USERNAME;
  const appPass = process.env.APP_PASSWORD;
  if (!appUser || !appPass) return false;
  return username === appUser && password === appPass;
}

export function getSessionCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAge ?? SESSION_DURATION_DAYS * 24 * 60 * 60,
  };
}
