import "server-only";
import { adminDb } from "@/lib/firebase-admin";

/**
 * Activity feed shared with the admin dashboard.
 *
 * Both apps append to the same `activity` collection so the therapist sees a
 * single timeline of everything that happens — bookings made on the website,
 * cancellations, status changes, settings edits — rather than only what she
 * did herself.
 *
 * Never throws: logging must not be able to fail a real operation.
 */

export type ActivityType =
  | "booking_created"
  | "booking_cancelled"
  | "booking_status_changed"
  | "booking_deleted"
  | "client_created"
  | "account_deleted"
  | "settings_updated"
  | "google_connected"
  | "google_disconnected";

export interface ActivityInput {
  type: ActivityType;
  /** One-line human summary, e.g. "New booking — Aman, Thu 23 Jul 12:30". */
  message: string;
  /** Who caused it: a client's name, an admin username, or "system". */
  actor: string;
  source: "website" | "dashboard";
  bookingId?: string;
  clientId?: string;
}

export async function logActivity(input: ActivityInput): Promise<void> {
  try {
    await adminDb.collection("activity").add({
      ...input,
      bookingId: input.bookingId ?? null,
      clientId: input.clientId ?? null,
      read: false,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("activity: failed to log", input.type, error);
  }
}
