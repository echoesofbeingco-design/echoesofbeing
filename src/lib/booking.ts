export interface BookingData {
  name: string;
  email: string;
  whatsapp: string;
  age: string;
  gender: string;
  pronouns: string;
  sessionType: string;
  category: string;
  concern: string;
  termsAccepted?: boolean;
}

export interface CalendlyData {
  eventUri: string;
  inviteeUri: string;
}

export interface ConsentData {
  paidSession: boolean;
  paymentFirst: boolean;
  communicationConsent: boolean;
  notes: string;
}

export type BookingStatus =
  | "intake_submitted"
  | "slot_reserved"
  | "pending_payment"
  | "payment_verified"
  | "confirmed";

async function bookingApi(body: Record<string, unknown>) {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export async function createBooking(data: BookingData): Promise<string> {
  const result = await bookingApi({ action: "create", ...data });
  return result.id;
}

export async function updateBookingCalendly(
  bookingId: string,
  calendly: CalendlyData
) {
  await bookingApi({ action: "update_calendly", bookingId, calendly });
}

export async function updateBookingConsent(
  bookingId: string,
  consent: ConsentData
) {
  await bookingApi({ action: "update_consent", bookingId, consent });
}

export async function getBooking(
  bookingId: string
): Promise<Record<string, unknown> | null> {
  try {
    const result = await bookingApi({ action: "get", bookingId });
    return result.booking || null;
  } catch {
    return null;
  }
}

/* ----------  Email verification (OTP)  ---------- */

export type OtpPurpose = "client" | "guardian";

async function otpApi(body: Record<string, unknown>) {
  const res = await fetch("/api/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data;
}

/** Send a 6-digit verification code to the given email. */
export async function sendEmailOtp(
  bookingId: string,
  purpose: OtpPurpose,
  email: string
): Promise<{ cooldownMs?: number }> {
  return otpApi({ action: "send", bookingId, purpose, email });
}

/** Verify the code the user entered. Resolves on success, throws on failure. */
export async function verifyEmailOtp(
  bookingId: string,
  purpose: OtpPurpose,
  email: string,
  code: string
): Promise<void> {
  await otpApi({ action: "verify", bookingId, purpose, email, code });
}
