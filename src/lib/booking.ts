import { db } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

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

export async function createBooking(data: BookingData): Promise<string> {
  const now = serverTimestamp();

  // 1. Create the booking
  const bookingRef = await addDoc(collection(db, "bookings"), {
    ...data,
    status: "intake_submitted" as BookingStatus,
    createdAt: now,
    updatedAt: now,
  });

  // 2. Create or link a client record
  // Check if a client with this email already exists
  const clientsQuery = query(
    collection(db, "clients"),
    where("email", "==", data.email.toLowerCase().trim())
  );
  const existingClients = await getDocs(clientsQuery);

  if (existingClients.empty) {
    // Create new client record
    const clientRef = await addDoc(collection(db, "clients"), {
      name: data.name,
      email: data.email.toLowerCase().trim(),
      whatsapp: data.whatsapp,
      age: data.age,
      gender: data.gender,
      pronouns: data.pronouns,
      occupation: "",
      desiredOutcomes: "",
      status: "active",
      bookingId: bookingRef.id,
      createdAt: now,
      updatedAt: now,
    });

    // Link client back to booking
    await updateDoc(doc(db, "bookings", bookingRef.id), {
      clientId: clientRef.id,
    });
  } else {
    // Client exists — link booking to existing client
    const existingClient = existingClients.docs[0];
    await updateDoc(doc(db, "bookings", bookingRef.id), {
      clientId: existingClient.id,
    });
  }

  return bookingRef.id;
}

export async function updateBookingCalendly(
  bookingId: string,
  calendly: CalendlyData
) {
  await updateDoc(doc(db, "bookings", bookingId), {
    calendly,
    status: "slot_reserved" as BookingStatus,
    updatedAt: serverTimestamp(),
  });
}

export async function updateBookingConsent(
  bookingId: string,
  consent: ConsentData
) {
  await updateDoc(doc(db, "bookings", bookingId), {
    consent,
    status: "pending_payment" as BookingStatus,
    updatedAt: serverTimestamp(),
  });
}

export async function getBooking(
  bookingId: string
): Promise<Record<string, unknown> | null> {
  const snap = await getDoc(doc(db, "bookings", bookingId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Record<string, unknown>;
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
  await updateDoc(doc(db, "bookings", bookingId), {
    aadhar,
    updatedAt: serverTimestamp(),
  });
}
