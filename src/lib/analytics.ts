import crypto from "crypto";

/**
 * First-party, cookieless analytics.
 *
 * Nothing is stored on the visitor's device, so there is no consent banner to
 * show, and no third party ever receives a request — the data goes straight to
 * our own Firestore. That matters more than usual here: visitors to a therapy
 * practice are reading about their own anxiety, trauma or depression, and that
 * browsing should not be handed to an ad company.
 *
 * Visitors are counted with a hash that rotates every day and is salted with a
 * server-side secret. The raw IP is never stored, the hash cannot be reversed,
 * and because it changes at midnight the same person cannot be followed from
 * one day to the next. That gives an honest "visitors today" number without
 * building a profile of anybody.
 */

export type EventType = "pageview" | "event";

/** Events the site reports, kept as a closed list so nothing arbitrary lands. */
export const KNOWN_EVENTS = [
  "book_viewed",
  "book_type_selected",
  "book_slot_selected",
  "book_submitted",
  "book_completed",
  "blog_read",
  "contact_clicked",
] as const;

export type KnownEvent = (typeof KNOWN_EVENTS)[number];

/**
 * Daily-rotating visitor hash. Salted with SESSION_SECRET so it cannot be
 * recomputed by anyone without server access, and truncated because we only
 * need enough bits to count uniques, not to identify anyone.
 */
export function visitorHash(
  ip: string,
  userAgent: string,
  day: string
): string {
  const salt = process.env.SESSION_SECRET ?? "eob";
  return crypto
    .createHash("sha256")
    .update(`${ip}|${userAgent}|${day}|${salt}`)
    .digest("hex")
    .slice(0, 16);
}

/** "YYYY-MM-DD" in the practice's timezone, so days line up with the calendar. */
export function dayKey(ms: number = Date.now()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

const BOT_PATTERN =
  /bot|crawler|spider|crawling|slurp|bingpreview|headless|lighthouse|pingdom|uptime|curl|wget|python-requests|axios|postman|semrush|ahrefs|dataprovider|scrapy/i;

export function isBot(userAgent: string): boolean {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

/** Bare hostname of the referrer, or "direct". Query strings are discarded. */
export function referrerHost(referrer: string, ownHost: string): string {
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (!host || host === ownHost.replace(/^www\./, "")) return "direct";
    return host;
  } catch {
    return "direct";
  }
}

/** Coarse device class — enough to answer "is this mostly phones?". */
export function deviceOf(userAgent: string): "mobile" | "tablet" | "desktop" {
  if (/iPad|Tablet|PlayBook|Silk/i.test(userAgent)) return "tablet";
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(userAgent)) return "mobile";
  return "desktop";
}

/**
 * Keep paths tidy and bounded: strip query strings and hashes, drop trailing
 * slashes, and cap length so a hostile caller can't write huge documents.
 */
export function normalizePath(path: string): string {
  if (!path.startsWith("/")) return "/";
  const clean = path.split("?")[0].split("#")[0];
  const trimmed =
    clean.length > 1 && clean.endsWith("/") ? clean.slice(0, -1) : clean;
  return trimmed.slice(0, 200);
}
