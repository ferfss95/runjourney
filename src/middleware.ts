import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { JWT_COOKIE_NAME } from "./lib/constants";

let _secret: Uint8Array | null = null;
function getSecret(): Uint8Array | null {
  if (_secret) return _secret;
  const raw = process.env.JWT_SECRET;
  if (!raw || raw.length < 32) return null;
  _secret = new TextEncoder().encode(raw);
  return _secret;
}

const verifiedTokens = new Map<string, { valid: boolean; expiresAt: number }>();
const CACHE_TTL_MS = 60_000;

async function isValidToken(token: string): Promise<boolean> {
  const cached = verifiedTokens.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.valid;
  }

  const secret = getSecret();
  if (!secret) return false;

  try {
    await jwtVerify(token, secret);
    verifiedTokens.set(token, {
      valid: true,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return true;
  } catch {
    verifiedTokens.set(token, {
      valid: false,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/login" ||
    pathname === "/manifest.json" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/gamification") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".webmanifest")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(JWT_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!(await isValidToken(token))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Exclui arquivos estáticos e imagens processadas pelo Next.js
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
