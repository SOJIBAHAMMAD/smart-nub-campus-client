/**
 * Client-side helpers for the session mirror API route (/api/auth/session).
 *
 * The real Better Auth session cookie lives on the backend domain, so this
 * route stores the raw session token in a same-site cookie on the frontend
 * domain, which is what src/proxy.ts needs for route-level gating.
 */

const SESSION_SYNC_URL = "/api/auth/session";

export async function syncSessionCookie(
  token: string,
  maxAge?: number,
): Promise<void> {
  await fetch(SESSION_SYNC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, maxAge }),
  });
}

export async function clearSessionCookie(): Promise<void> {
  await fetch(SESSION_SYNC_URL, { method: "DELETE" });
}

export async function getMirroredSessionToken(): Promise<string | null> {
  try {
    const response = await fetch(SESSION_SYNC_URL);
    if (!response.ok) return null;
    const body = (await response.json()) as { token: string | null };
    return body.token ?? null;
  } catch {
    return null;
  }
}
