import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import {
  normalizeConfig,
  type AvailabilityConfig,
  type BusyInterval,
} from "@/lib/availability";
import { RELEASED_STATUSES } from "@/lib/booking-types";

const CONFIG_COLLECTION = "config";
const AVAILABILITY_DOC = "availability";

/**
 * Load the practice's availability config, falling back to the built-in
 * defaults (Sun-Fri 10:00-14:00 IST, 1h gap, 24h notice) when the admin has
 * never saved one. Never throws — availability must still render if Firestore
 * hiccups, and the defaults are the documented behaviour.
 */
export async function getAvailabilityConfig(): Promise<AvailabilityConfig> {
  try {
    const snap = await adminDb
      .collection(CONFIG_COLLECTION)
      .doc(AVAILABILITY_DOC)
      .get();
    if (!snap.exists) return normalizeConfig(null);
    return normalizeConfig(snap.data() as Partial<AvailabilityConfig>);
  } catch (error) {
    console.error("availability: failed to load config, using defaults", error);
    return normalizeConfig(null);
  }
}

export async function saveAvailabilityConfig(
  config: AvailabilityConfig,
  updatedBy: string
): Promise<void> {
  await adminDb
    .collection(CONFIG_COLLECTION)
    .doc(AVAILABILITY_DOC)
    .set(
      {
        ...config,
        updatedAt: new Date().toISOString(),
        updatedBy,
      },
      { merge: true }
    );
}

/**
 * Sessions starting just outside the requested range can still block slots
 * inside it via the inter-session buffer, so widen the query generously.
 */
const EDGE_PAD_MS = 6 * 60 * 60 * 1000;

/**
 * Every booked interval overlapping the range. Cancelled bookings are skipped
 * so their time returns to the pool. Pass `excludeBookingId` when rescheduling
 * so a booking doesn't block itself.
 */
export async function getBusyIntervals(
  fromMs: number,
  toMs: number,
  excludeBookingId?: string
): Promise<BusyInterval[]> {
  const snap = await adminDb
    .collection("bookings")
    .where("slot.startMs", ">=", fromMs - EDGE_PAD_MS)
    .where("slot.startMs", "<=", toMs + EDGE_PAD_MS)
    .get();

  const busy: BusyInterval[] = [];
  for (const doc of snap.docs) {
    if (excludeBookingId && doc.id === excludeBookingId) continue;

    const data = doc.data() as {
      status?: unknown;
      slot?: { startMs?: unknown; endMs?: unknown };
    };

    const status = typeof data.status === "string" ? data.status : "";
    if (RELEASED_STATUSES.has(status)) continue;

    const startMs = data.slot?.startMs;
    const endMs = data.slot?.endMs;
    if (typeof startMs === "number" && typeof endMs === "number") {
      busy.push({ startMs, endMs });
    }
  }

  return busy;
}
