import "server-only";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/session";

/**
 * Authoritative session check for protected pages.
 *
 * Runs in the Node runtime, where SESSION_SECRET is reliably available, so
 * unlike the optimistic cookie-presence check in proxy.ts this actually
 * verifies the JWT signature and expiry. Call it from the layout of every
 * protected route.
 */
export async function requireSession(pathname: string): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
  }
  return session;
}
