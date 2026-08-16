import { NextRequest, NextResponse } from "next/server";

const COOKIE_PREFIX = "better-auth";
const COOKIE_NAME = "session_token";
const isProduction = process.env.NODE_ENV === "production";

/**
 * Mirrors the Better Auth session cookie onto the frontend's own domain.
 *
 * The real session cookie lives on the backend (Render) because all auth
 * calls go cross-site. The frontend domain (Vercel) never sees it, so this
 * route stores the raw session token in a same-site HttpOnly cookie that
 * `src/proxy.ts` can forward to the backend for route-level gating.
 *
 * - POST   stores the token (called after a successful sign-in).
 * - GET    returns the token (fallback source for Socket.IO auth).
 * - DELETE expires the token (called after sign-out).
 */
const sessionCookieName = isProduction
  ? `__Secure-${COOKIE_PREFIX}.${COOKIE_NAME}`
  : `${COOKIE_PREFIX}.${COOKIE_NAME}`;

const sessionCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      token?: string;
      maxAge?: number;
    };

    if (!body.token || typeof body.token !== "string") {
      return NextResponse.json(
        { success: false, error: "Token is required." },
        { status: 400 },
      );
    }

    const maxAge =
      typeof body.maxAge === "number" && body.maxAge > 0 ? body.maxAge : undefined;

    const response = NextResponse.json({ success: true });
    response.cookies.set(sessionCookieName, body.token, {
      ...sessionCookieOptions,
      ...(maxAge ? { maxAge } : {}),
    });
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(sessionCookieName)?.value ?? null;
  return NextResponse.json({ token });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(sessionCookieName, "", {
    ...sessionCookieOptions,
    maxAge: 0,
  });
  return response;
}
