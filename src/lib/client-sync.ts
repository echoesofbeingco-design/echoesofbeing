import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { ageFromDateOfBirth, type CommunityUser } from "@/lib/auth";

/**
 * Keeps the clinical `clients` record aligned with the person's account.
 *
 * The two are separate on purpose — the client record carries the therapist's
 * clinical notes and outlives the account — but the demographic fields on it
 * should always reflect what the person last told us. This runs on sign-in and
 * whenever they edit their profile, so older accounts self-heal rather than
 * showing stale (or missing) details in the dashboard.
 *
 * Never throws: a sync problem must not block signing in or booking.
 */

function normalisePhone(raw: string | undefined): string {
  return String(raw ?? "")
    .replace(/[\s\-().]/g, "")
    .replace(/^(\+91|91|0)/, "");
}

export interface SyncResult {
  clientId: string | null;
  created: boolean;
  updatedFields: string[];
}

/** Find this user's client record by email, then phone. */
async function findClientId(
  email: string,
  phone: string
): Promise<string | null> {
  if (email) {
    const byEmail = await adminDb
      .collection("clients")
      .where("email", "==", email)
      .limit(1)
      .get();
    if (!byEmail.empty) return byEmail.docs[0].id;
  }
  if (phone.length >= 6) {
    const byPhone = await adminDb
      .collection("clients")
      .where("whatsapp", "==", phone)
      .limit(1)
      .get();
    if (!byPhone.empty) return byPhone.docs[0].id;
  }
  return null;
}

/**
 * Push the account's current details onto the client record.
 * `createIfMissing` is false on sign-in (don't create clinical records for
 * people who have never booked) and true when a booking is made.
 */
export async function syncClientFromUser(
  user: CommunityUser,
  options: { createIfMissing?: boolean; bookingId?: string } = {}
): Promise<SyncResult> {
  const result: SyncResult = {
    clientId: null,
    created: false,
    updatedFields: [],
  };

  try {
    const email = user.email.toLowerCase().trim();
    const phone = normalisePhone(user.phone);
    const age = user.dateOfBirth ? ageFromDateOfBirth(user.dateOfBirth) : null;

    const clientId = await findClientId(email, phone);

    if (!clientId) {
      if (!options.createIfMissing) return result;

      const now = FieldValue.serverTimestamp();
      const ref = await adminDb.collection("clients").add({
        name: user.displayName,
        email,
        whatsapp: phone,
        dateOfBirth: user.dateOfBirth ?? "",
        age: age === null ? "" : String(age),
        gender: user.gender ?? "",
        pronouns: user.pronouns ?? "",
        occupation: "",
        desiredOutcomes: "",
        status: "active",
        userId: user._id,
        ...(options.bookingId ? { bookingId: options.bookingId } : {}),
        createdAt: now,
        updatedAt: now,
      });
      result.clientId = ref.id;
      result.created = true;
      return result;
    }

    result.clientId = clientId;

    // Only write fields that actually differ, so we don't churn updatedAt or
    // clobber anything the therapist curated by hand with an empty value.
    const ref = adminDb.collection("clients").doc(clientId);
    const snap = await ref.get();
    const existing = (snap.data() ?? {}) as Record<string, unknown>;

    const desired: Record<string, string> = {
      name: user.displayName,
      email,
      whatsapp: phone,
      dateOfBirth: user.dateOfBirth ?? "",
      age: age === null ? "" : String(age),
      gender: user.gender ?? "",
      pronouns: user.pronouns ?? "",
    };

    const patch: Record<string, unknown> = {};
    for (const [field, value] of Object.entries(desired)) {
      if (!value) continue; // never overwrite with a blank
      if (String(existing[field] ?? "") !== value) patch[field] = value;
    }
    if (!existing.userId) patch.userId = user._id;

    if (Object.keys(patch).length > 0) {
      patch.updatedAt = FieldValue.serverTimestamp();
      await ref.update(patch);
      result.updatedFields = Object.keys(patch).filter(
        (f) => f !== "updatedAt"
      );
    }

    return result;
  } catch (error) {
    console.error("client-sync: failed", error);
    return result;
  }
}
