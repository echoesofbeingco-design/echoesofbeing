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

/* ----------  Aadhaar image upload  ---------- */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateAadharFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only JPG, PNG, or WebP images are allowed.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File size must be under 5 MB.";
  }
  return null;
}

export interface AadharUploadResult {
  frontUrl: string;
  backUrl: string;
  frontPublicId: string;
  backPublicId: string;
}

export async function uploadAadharImages(
  bookingId: string,
  front: File,
  back: File
): Promise<AadharUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    throw new Error("Image upload is not configured.");
  }

  async function uploadOne(file: File, label: string) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", preset!);
    fd.append("folder", `echos-bookings/${bookingId}`);
    fd.append("public_id", `${label}-${Date.now()}`);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: fd }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        (err as Record<string, Record<string, string>>)?.error?.message ||
          "Image upload failed"
      );
    }
    return res.json();
  }

  const [frontData, backData] = await Promise.all([
    uploadOne(front, "aadhar-front"),
    uploadOne(back, "aadhar-back"),
  ]);

  return {
    frontUrl: frontData.secure_url,
    backUrl: backData.secure_url,
    frontPublicId: frontData.public_id,
    backPublicId: backData.public_id,
  };
}

export async function updateBookingAadhar(
  bookingId: string,
  aadhar: AadharUploadResult
) {
  await bookingApi({ action: "update_aadhar", bookingId, aadhar });
}
