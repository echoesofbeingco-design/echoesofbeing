/**
 * Shared option lists and completeness rules for a client's booking profile.
 * Kept in one place so sign-up, the "complete your profile" prompt and the
 * profile editor can never drift apart.
 */

export const GENDER_OPTIONS = [
  "Female",
  "Male",
  "Transgender",
  "Non-binary",
  "Genderqueer",
  "Genderfluid",
  "Agender",
  "Rather not say",
] as const;

export const PRONOUN_OPTIONS = [
  "She/Her",
  "He/Him",
  "They/Them",
  "She/They",
  "He/They",
  "Ze/Zir",
  "Any pronouns",
  "Rather not say",
] as const;

/**
 * Bump this when the Terms or Privacy Policy change materially — every user
 * will then be asked to read and accept again before their next booking.
 */
export const TERMS_VERSION = "2026-07";

export interface BookingProfile {
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  pronouns?: string;
}

/**
 * True when the user has never accepted the terms, or accepted an older
 * version. Accounts created before consent was captured fall in here, so they
 * are asked once rather than being silently treated as having agreed.
 */
export function needsTermsAcceptance(user: {
  termsAcceptedAt?: string | null;
  termsVersion?: string | null;
}): boolean {
  if (!user?.termsAcceptedAt) return true;
  return String(user.termsVersion ?? "") !== TERMS_VERSION;
}

/** The three acknowledgements taken on every booking. */
export interface SessionConsent {
  paidSession: boolean;
  paymentFirst: boolean;
  communicationConsent: boolean;
  notes?: string;
}

/**
 * Everything the therapist needs before a session can be booked. Accounts
 * created before these fields existed will be missing them, so the app prompts
 * for them at sign-in rather than failing at booking time.
 */
export const REQUIRED_PROFILE_FIELDS: (keyof BookingProfile)[] = [
  "phone",
  "dateOfBirth",
  "gender",
  "pronouns",
];

export function missingProfileFields(
  profile: BookingProfile | null | undefined
): (keyof BookingProfile)[] {
  if (!profile) return [...REQUIRED_PROFILE_FIELDS];
  return REQUIRED_PROFILE_FIELDS.filter(
    (field) => !String(profile[field] ?? "").trim()
  );
}

export function isProfileComplete(
  profile: BookingProfile | null | undefined
): boolean {
  return missingProfileFields(profile).length === 0;
}

/** "1995-01-15" → "15 January 1995" */
export function formatDateOfBirth(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
