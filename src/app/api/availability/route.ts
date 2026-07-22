import { NextRequest, NextResponse } from "next/server";
import {
  getAvailabilityConfig,
  getBusyIntervals,
} from "@/lib/availability-server";
import {
  addDays,
  formatDateInZone,
  generateSlots,
  getSessionType,
  parseDateStr,
  zonedToUtcMs,
} from "@/lib/availability";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Hard cap on how much can be asked for in one request. */
const MAX_RANGE_DAYS = 62;

function isValidDate(value: string): boolean {
  try {
    parseDateStr(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * GET /api/availability?type=intro&from=2026-07-02&to=2026-07-31
 *
 * Public on purpose — visitors can see open times before creating an account.
 * It only ever exposes free/busy derived data, never booking details.
 */
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limit = rateLimit(`availability:${ip}`, 60, 60_000);
  if (limit.limited) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const config = await getAvailabilityConfig();
    const tz = config.timezone;
    const nowMs = Date.now();
    const today = formatDateInZone(nowMs, tz);

    const sessionTypeId = searchParams.get("type") ?? "";
    // Always expose the bookable session types so the picker can render.
    const sessionTypes = config.sessionTypes.filter((s) => s.enabled);

    if (!sessionTypeId) {
      return NextResponse.json({ timezone: tz, sessionTypes, days: [] });
    }

    const sessionType = getSessionType(config, sessionTypeId);
    if (!sessionType || !sessionType.enabled) {
      return NextResponse.json(
        { error: "Unknown session type." },
        { status: 400 }
      );
    }

    const rawFrom = searchParams.get("from") ?? today;
    const rawTo =
      searchParams.get("to") ??
      addDays(today, Math.min(config.maxAdvanceDays, MAX_RANGE_DAYS));

    if (!isValidDate(rawFrom) || !isValidDate(rawTo)) {
      return NextResponse.json(
        { error: "Invalid date range. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }

    // Never look into the past, and clamp the window size.
    const from = rawFrom < today ? today : rawFrom;
    const maxTo = addDays(from, MAX_RANGE_DAYS);
    const to = rawTo > maxTo ? maxTo : rawTo;

    if (to < from) {
      return NextResponse.json({ timezone: tz, sessionTypes, days: [] });
    }

    const f = parseDateStr(from);
    const t = parseDateStr(to);
    const fromMs = zonedToUtcMs(f.year, f.month, f.day, 0, 0, tz);
    const toMs = zonedToUtcMs(t.year, t.month, t.day, 23, 59, tz);

    const busy = await getBusyIntervals(fromMs, toMs);

    const days = generateSlots({
      config,
      sessionTypeId,
      fromDate: from,
      toDate: to,
      busy,
      nowMs,
    });

    return NextResponse.json({
      timezone: tz,
      sessionTypes,
      sessionType,
      minNoticeHours: config.minNoticeHours,
      days,
    });
  } catch (error) {
    console.error("availability API error:", error);
    return NextResponse.json(
      { error: "Could not load availability." },
      { status: 500 }
    );
  }
}
