import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { rateLimits } from "@/lib/rate-limit";
import {
  KNOWN_EVENTS,
  dayKey,
  deviceOf,
  isBot,
  normalizePath,
  referrerHost,
  visitorHash,
  type KnownEvent,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

/**
 * Collect one first-party analytics event.
 *
 * Deliberately writes nothing that identifies a person: no cookie is set or
 * read, the IP is used only to derive a daily-rotating salted hash and is
 * never stored, and the payload is restricted to a path, a referrer host and
 * a name from a fixed list. Failures are swallowed — measurement must never
 * break a page for a visitor.
 */
export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (rateLimits.track(ip).limited) {
      return new NextResponse(null, { status: 204 });
    }

    const userAgent = request.headers.get("user-agent") ?? "";
    if (isBot(userAgent)) return new NextResponse(null, { status: 204 });

    const body = (await request.json()) as {
      path?: unknown;
      referrer?: unknown;
      event?: unknown;
      title?: unknown;
    };

    const type = body.event ? "event" : "pageview";
    let name: KnownEvent | null = null;
    if (type === "event") {
      const candidate = String(body.event);
      if (!KNOWN_EVENTS.includes(candidate as KnownEvent)) {
        // Unknown event names are dropped rather than stored, so this endpoint
        // can never be used to write arbitrary strings into the database.
        return new NextResponse(null, { status: 204 });
      }
      name = candidate as KnownEvent;
    }

    const day = dayKey();
    const host = request.headers.get("host") ?? "echoesofbeing.co.in";

    await adminDb.collection("analytics_events").add({
      day,
      ts: Date.now(),
      type,
      name,
      path: normalizePath(String(body.path ?? "/")),
      referrer: referrerHost(String(body.referrer ?? ""), host),
      device: deviceOf(userAgent),
      // Rotates daily and cannot be reversed — enough to count uniques,
      // not enough to follow anybody.
      visitor: visitorHash(ip, userAgent, day),
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("track: failed to record event", error);
    return new NextResponse(null, { status: 204 });
  }
}
