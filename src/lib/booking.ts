/**
 * Client-side wrapper around the booking + availability APIs.
 * All calls are authenticated by the session cookie; the server enforces
 * ownership, slot validity and double-booking protection.
 */

export interface SessionTypeOption {
  id: string;
  label: string;
  durationMin: number;
  price: number;
  enabled: boolean;
}

export interface SlotOption {
  startISO: string;
  endISO: string;
  startMs: number;
  endMs: number;
  label: string;
}

export interface DayAvailability {
  date: string;
  slots: SlotOption[];
}

export interface AvailabilityResponse {
  timezone: string;
  sessionTypes: SessionTypeOption[];
  minNoticeHours?: number;
  days: DayAvailability[];
}

export interface BookingSummary {
  id: string;
  status: string;
  sessionType: string;
  category: string;
  concern: string;
  startMs?: number;
  startISO: string | null;
  endISO: string | null;
  timezone: string;
  meetLink: string | null;
  createdAt: string;
}

async function bookingApi<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error || "Something went wrong.");
    (error as Error & { code?: string }).code = data.code;
    throw error;
  }
  return data as T;
}

export async function getAvailability(
  sessionTypeId?: string
): Promise<AvailabilityResponse> {
  const params = new URLSearchParams();
  if (sessionTypeId) params.set("type", sessionTypeId);
  const res = await fetch(`/api/availability?${params.toString()}`);
  if (!res.ok) throw new Error("Could not load available times.");
  return (await res.json()) as AvailabilityResponse;
}

export interface CreateBookingInput {
  sessionTypeId: string;
  startMs: number;
  category: string;
  concern: string;
  /** Session-specific acknowledgements, confirmed on every booking. */
  consent: {
    paidSession: boolean;
    paymentFirst: boolean;
    communicationConsent: boolean;
    notes?: string;
  };
}

export interface CreateBookingResult {
  id: string;
  startISO: string;
  endISO: string;
  date: string;
  time: string;
  timezone: string;
  meetLink: string | null;
  calendarSynced: boolean;
}

export function createBooking(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  return bookingApi<CreateBookingResult>({ action: "create", ...input });
}

export function listBookings(): Promise<{ bookings: BookingSummary[] }> {
  return bookingApi<{ bookings: BookingSummary[] }>({ action: "list" });
}

export function getBooking(
  bookingId: string
): Promise<{ booking: BookingSummary }> {
  return bookingApi<{ booking: BookingSummary }>({ action: "get", bookingId });
}

export function cancelBooking(
  bookingId: string
): Promise<{ success: boolean }> {
  return bookingApi<{ success: boolean }>({ action: "cancel", bookingId });
}
