import { db } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export interface BookingData {
  name: string;
  email: string;
  whatsapp: string;
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
  const ref = await addDoc(collection(db, "bookings"), {
    ...data,
    status: "intake_submitted" as BookingStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
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

export async function getBooking(bookingId: string) {
  const snap = await getDoc(doc(db, "bookings", bookingId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
