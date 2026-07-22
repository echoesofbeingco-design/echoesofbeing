import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { COMMUNITY_ENABLED } from "@/lib/features";

const SESSION_SECRET = process.env.SESSION_SECRET;
const key = SESSION_SECRET ? new TextEncoder().encode(SESSION_SECRET) : null;

// ── DDoS / global rate limit (per IP) ──────────────────────────────────────
// Simple in-memory global limiter: 200 requests/minute per IP
const globalHits = new Map<string, { count: number; resetAt: number }>();

function globalRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = globalHits.get(ip);

  if (!entry || now > entry.resetAt) {
    globalHits.set(ip, { count: 1, resetAt: now + 60_000 });
    return false; // not limited
  }

  entry.count++;
  if (entry.count > 200) return true; // limited
  return false;
}

// Clean up every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of globalHits.entries()) {
    if (now > entry.resetAt) globalHits.delete(ip);
  }
}, 120_000);

// ── Routes that require authentication ─────────────────────────────────────
// Booking requires an account so that terms/consent are accepted once at
// sign-up rather than at every booking.
const PROTECTED_PATHS = [
  "/book",
  "/profile",
  "/community/new",
  "/community/profile",
];

// Auth pages — redirect away if already logged in
const AUTH_PATHS = ["/auth/login", "/auth/signup"];

/**
 * This is an optimistic gate. The authoritative session check lives in the
 * Node runtime — `requireSession()` in the /book and /profile layouts, plus
 * the checks each API route performs. See the Next.js docs: proxy "should not
 * be used as a full session management or authorization solution".
 */
export async function proxy(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Global DDoS rate limit
  if (globalRateLimit(ip)) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  const { pathname } = request.nextUrl;

  // While the community feature is hidden, 301-redirect its public pages and
  // the community-only auth pages to the homepage so search engines consolidate
  // link equity to home and nothing dangles. API routes (/api/community,
  // /api/auth) are left untouched. Flip COMMUNITY_ENABLED to restore the pages.
  // NOTE: /auth is deliberately NOT redirected any more. Accounts are now used
  // for booking (so consent is captured once), independently of the community
  // feature. Only the community's own pages stay hidden behind the flag.
  if (!COMMUNITY_ENABLED && pathname.startsWith("/community")) {
    return NextResponse.redirect(new URL("/", request.url), 301);
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Check if path requires auth
  const needsAuth = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isAuthPage = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!needsAuth && !isAuthPage) return response;

  // A missing secret would make every visitor look logged out, which silently
  // bounces them between /book and /auth/login with nothing in the logs. Say
  // so loudly and defer to the layout guard rather than locking everyone out.
  if (!key) {
    console.error(
      "proxy: SESSION_SECRET is not available in the proxy bundle — " +
        "skipping the optimistic auth check. Protected routes still enforce " +
        "the session server-side via requireSession()."
    );
    return response;
  }

  // Verify session
  const sessionCookie = request.cookies.get("eob_session")?.value;
  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      await jwtVerify(sessionCookie, key, { algorithms: ["HS256"] });
      isAuthenticated = true;
    } catch {
      // Invalid or expired token
    }
  }

  // Redirect unauthenticated users from protected pages to login
  if (needsAuth && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages, honouring ?redirect=
  if (isAuthPage && isAuthenticated) {
    const target = request.nextUrl.searchParams.get("redirect");
    const safeTarget = target && target.startsWith("/") ? target : "/profile";
    return NextResponse.redirect(new URL(safeTarget, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/book/:path*",
    "/book",
    "/profile/:path*",
    "/profile",
    "/community/:path*",
    "/auth/:path*",
    "/api/community/:path*",
    "/api/auth/:path*",
  ],
};
