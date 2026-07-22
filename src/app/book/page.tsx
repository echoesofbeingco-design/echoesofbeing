"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  createBooking,
  getAvailability,
  type DayAvailability,
  type SessionTypeOption,
  type SlotOption,
  type CreateBookingResult,
} from "@/lib/booking";
import { showToast } from "@/components/Toast";
import { formatDateOfBirth } from "@/lib/profile-fields";

type Step = "type" | "time" | "details" | "done";

interface BookerProfile {
  displayName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  pronouns: string;
  termsAcceptedAt: string | null;
}

const CATEGORIES = [
  "Relationships",
  "Loneliness",
  "Anxiety",
  "Depression",
  "Trauma",
  "Self-Esteem",
  "Women's Issues",
  "Other / Not sure",
];

/** "2026-07-23" → "Thu, 23 Jul". The string is already a calendar date. */
function formatDayLabel(date: string): { weekday: string; day: string } {
  const d = new Date(`${date}T00:00:00Z`);
  return {
    weekday: new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      timeZone: "UTC",
    }).format(d),
    day: new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(d),
  };
}

function formatPrice(price: number): string {
  return price === 0 ? "Complimentary" : `₹${price.toLocaleString("en-IN")}`;
}

/** Dates shown before the "show all" reveal — two tidy rows on desktop. */
const DAYS_PER_PAGE = 10;

export default function BookPage() {
  const [step, setStep] = useState<Step>("type");

  const [sessionTypes, setSessionTypes] = useState<SessionTypeOption[]>([]);
  const [sessionTypeId, setSessionTypeId] = useState("");
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);
  const [showAllDays, setShowAllDays] = useState(false);

  const [category, setCategory] = useState("");
  const [concern, setConcern] = useState("");

  // Session-specific acknowledgements — confirmed on every booking.
  const [consent, setConsent] = useState({
    paidSession: false,
    paymentFirst: false,
    communicationConsent: false,
    notes: "",
  });
  const allConsentGiven =
    consent.paidSession &&
    consent.paymentFirst &&
    consent.communicationConsent;

  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreateBookingResult | null>(null);

  const [profile, setProfile] = useState<BookerProfile | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [needsTerms, setNeedsTerms] = useState(false);

  // Load the bookable session types once.
  useEffect(() => {
    getAvailability()
      .then((data) => {
        setSessionTypes(data.sessionTypes);
        setTimezone(data.timezone);
      })
      .catch(() => showToast("Could not load session types.", "error"))
      .finally(() => setLoadingTypes(false));
  }, []);

  // The therapist needs these details before a session; older accounts may not
  // have them yet, so we check here rather than failing at the final step.
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setProfile(data.user);
        setMissingFields(data.missingFields ?? []);
        setNeedsTerms(Boolean(data.needsTerms));
      })
      .catch(() => {});
  }, []);

  const loadSlots = useCallback(async (typeId: string) => {
    setLoadingSlots(true);
    setSelectedDate("");
    setSelectedSlot(null);
    try {
      const data = await getAvailability(typeId);
      setDays(data.days);
      setTimezone(data.timezone);
      if (data.days.length > 0) setSelectedDate(data.days[0].date);
    } catch {
      showToast("Could not load available times.", "error");
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  const selectedType = useMemo(
    () => sessionTypes.find((s) => s.id === sessionTypeId) ?? null,
    [sessionTypes, sessionTypeId]
  );

  // Collapsed by default; the selected day always stays on screen.
  const visibleDays = useMemo(() => {
    if (showAllDays) return days;
    const head = days.slice(0, DAYS_PER_PAGE);
    if (selectedDate && !head.some((d) => d.date === selectedDate)) {
      const picked = days.find((d) => d.date === selectedDate);
      if (picked) return [...head, picked];
    }
    return head;
  }, [days, showAllDays, selectedDate]);

  const slotsForDay = useMemo(
    () => days.find((d) => d.date === selectedDate)?.slots ?? [],
    [days, selectedDate]
  );

  function chooseType(id: string) {
    setSessionTypeId(id);
    setStep("time");
    loadSlots(id);
  }

  async function handleConfirm() {
    if (!selectedSlot || !sessionTypeId) return;
    if (!concern.trim()) {
      showToast("Please tell us a little about what brings you here.", "error");
      return;
    }
    if (!category) {
      showToast("Please choose what you'd like help with.", "error");
      return;
    }
    if (!allConsentGiven) {
      showToast("Please confirm all three acknowledgements.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const booking = await createBooking({
        sessionTypeId,
        startMs: selectedSlot.startMs,
        category,
        concern: concern.trim(),
        consent: {
          paidSession: consent.paidSession,
          paymentFirst: consent.paymentFirst,
          communicationConsent: consent.communicationConsent,
          notes: consent.notes.trim(),
        },
      });
      setResult(booking);
      setStep("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const err = error as Error & { code?: string };
      showToast(err.message, "error");
      // If someone else took the slot, refresh availability and go back.
      if (err.code === "SLOT_TAKEN") {
        setStep("time");
        setSelectedSlot(null);
        loadSlots(sessionTypeId);
      }
    } finally {
      setSubmitting(false);
    }
  }

  /* ───────────────────────────  done  ─────────────────────────── */

  if (step === "done" && result) {
    return (
      <section className="max-w-2xl mx-auto px-6 pt-16 pb-24">
        <div className="w-14 h-14 rounded-full bg-secondary-bg flex items-center justify-center mb-6">
          <svg
            className="w-7 h-7 text-sage-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="display text-4xl md:text-5xl mb-4">
          Your slot is reserved.
        </h1>
        <p className="text-muted leading-relaxed mb-8">
          {formatDayLabel(result.date).weekday},{" "}
          {formatDayLabel(result.date).day} at {result.time} (IST). We&apos;ve
          sent the details to your email.
        </p>

        <div className="rounded-[1.5rem] border border-border p-6 space-y-4 mb-8">
          {result.meetLink ? (
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-muted mb-1">
                Video link
              </p>
              <a
                href={result.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage-600 underline break-all text-sm"
              >
                {result.meetLink}
              </a>
            </div>
          ) : (
            <p className="text-sm text-muted">
              Your video link will be shared with you before the session.
            </p>
          )}
          <p className="text-sm text-muted leading-relaxed">
            Your slot is held, not yet confirmed. We&apos;ll reach out on
            WhatsApp with payment details, and your session is confirmed once
            payment is verified.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link href="/profile" className="btn-pill">
            View my sessions
          </Link>
          <Link href="/" className="btn-pill-outline">
            Back to home
          </Link>
        </div>
      </section>
    );
  }

  /* ──────────────────  profile must be complete first  ─────────── */

  if (missingFields.length > 0 || needsTerms) {
    return (
      <section className="max-w-2xl mx-auto px-6 pt-16 pb-24">
        <h1 className="display text-4xl md:text-5xl mb-4">
          {needsTerms && missingFields.length === 0
            ? "One thing to confirm first."
            : "Just a couple of details first."}
        </h1>
        <p className="text-muted leading-relaxed mb-8">
          {needsTerms && missingFields.length === 0
            ? "Your account was created before we introduced our current Terms & Conditions and Privacy Policy. Please review and accept them, and we won't ask again."
            : "Before your first session we need a little more information. It takes a moment, and you won't be asked again."}
        </p>
        <Link href="/profile" className="btn-pill">
          {needsTerms && missingFields.length === 0
            ? "Review and accept"
            : "Complete my details"}
        </Link>
      </section>
    );
  }

  /* ───────────────────────────  wizard  ───────────────────────── */

  return (
    <>
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-6">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 block mb-4">
          {step === "type"
            ? "Step 1 of 3"
            : step === "time"
            ? "Step 2 of 3"
            : "Step 3 of 3"}
        </span>
        <h1 className="display text-4xl md:text-5xl mb-4">
          {step === "type"
            ? "What would you like to book?"
            : step === "time"
            ? "Choose a time."
            : "A little about you."}
        </h1>
        <p className="text-muted max-w-xl">
          {step === "type"
            ? "Start wherever feels right. The first conversation is always free."
            : step === "time"
            ? `All times are shown in Indian Standard Time. Sessions are booked at least 24 hours ahead.`
            : "This helps us understand what brings you here before we meet. Everything you share is kept strictly confidential."}
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        {/* ── Step 1: session type ── */}
        {step === "type" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {loadingTypes ? (
              <p className="text-sm text-muted">Loading…</p>
            ) : (
              sessionTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => chooseType(type.id)}
                  className="text-left rounded-[1.5rem] border border-border p-7 hover:border-sage-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <h2 className="font-serif text-xl font-medium mb-1">
                    {type.label}
                  </h2>
                  <p className="text-sm text-muted mb-4">
                    {type.durationMin} minutes
                  </p>
                  <p className="display text-2xl text-sage-600">
                    {formatPrice(type.price)}
                  </p>
                </button>
              ))
            )}
          </div>
        )}

        {/* ── Step 2: date + time ── */}
        {step === "time" && (
          <div>
            <button
              onClick={() => setStep("type")}
              className="text-sm text-muted hover:text-sage-600 mb-6 transition-colors"
            >
              ← Change session type
            </button>

            {loadingSlots ? (
              <p className="text-sm text-muted">Loading available times…</p>
            ) : days.length === 0 ? (
              <div className="rounded-[1.5rem] border border-border p-8 text-center">
                <p className="text-muted">
                  There are no open times right now. Please check back soon, or
                  email us and we&apos;ll find a slot for you.
                </p>
              </div>
            ) : (
              <>
                {/* Dates — a wrapping grid, so there is nothing to scroll sideways. */}
                <p className="text-xs uppercase tracking-[0.18em] text-muted mb-3">
                  Choose a day
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 mb-4">
                  {visibleDays.map((day) => {
                    const label = formatDayLabel(day.date);
                    const active = day.date === selectedDate;
                    return (
                      <button
                        key={day.date}
                        onClick={() => {
                          setSelectedDate(day.date);
                          setSelectedSlot(null);
                        }}
                        className={`py-2.5 rounded-2xl border text-center transition-all duration-200 ${
                          active
                            ? "border-sage-500 bg-secondary-bg/60"
                            : "border-border hover:border-sage-400/60"
                        }`}
                      >
                        <span className="block text-[11px] uppercase tracking-wide text-muted">
                          {label.weekday}
                        </span>
                        <span className="block text-sm font-medium mt-0.5">
                          {label.day}
                        </span>
                        <span className="block text-[10px] text-muted mt-0.5">
                          {day.slots.length} open
                        </span>
                      </button>
                    );
                  })}
                </div>
                {days.length > DAYS_PER_PAGE && (
                  <button
                    onClick={() => setShowAllDays((v) => !v)}
                    className="text-sm text-sage-600 hover:text-forest transition-colors"
                  >
                    {showAllDays
                      ? "Show fewer dates"
                      : `Show all ${days.length} available dates`}
                  </button>
                )}

                {/* Times */}
                <p className="text-xs uppercase tracking-[0.18em] text-muted mt-8 mb-3">
                  Choose a time{" "}
                  <span className="normal-case tracking-normal">
                    ({timezone === "Asia/Kolkata" ? "IST" : timezone})
                  </span>
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-10">
                  {slotsForDay.map((slot) => {
                    const active = selectedSlot?.startMs === slot.startMs;
                    return (
                      <button
                        key={slot.startMs}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 rounded-xl border text-sm transition-all duration-200 ${
                          active
                            ? "border-sage-500 bg-sage-600 text-cream"
                            : "border-border hover:border-sage-400"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={!selectedSlot}
                  onClick={() => setStep("details")}
                  className="btn-pill disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Step 3: details ── */}
        {step === "details" && selectedSlot && (
          <div>
            <button
              onClick={() => setStep("time")}
              className="text-sm text-muted hover:text-sage-600 mb-6 transition-colors"
            >
              ← Change time
            </button>

            <div className="rounded-2xl bg-accent-bg/50 px-5 py-4 mb-6 text-sm">
              <span className="font-medium">{selectedType?.label}</span>
              <span className="text-muted">
                {" "}
                · {formatDayLabel(selectedDate).weekday}{" "}
                {formatDayLabel(selectedDate).day} at {selectedSlot.label} IST
              </span>
            </div>

            {/* What we'll send with the booking */}
            {profile && (
              <div className="rounded-[1.5rem] border border-border p-5 mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold tracking-wider uppercase text-muted">
                    Your details
                  </h2>
                  <Link
                    href="/profile"
                    className="text-xs text-sage-600 underline"
                  >
                    Edit
                  </Link>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Name</dt>
                    <dd>{profile.displayName}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Email</dt>
                    <dd className="truncate">{profile.email}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">WhatsApp</dt>
                    <dd>+91 {profile.phone}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Date of birth</dt>
                    <dd>{formatDateOfBirth(profile.dateOfBirth)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Gender</dt>
                    <dd>{profile.gender}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Pronouns</dt>
                    <dd>{profile.pronouns}</dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                  What would you like help with?{" "}
                  <span className="text-sage-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 text-sm"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                  What brings you here? <span className="text-sage-500">*</span>
                </label>
                <textarea
                  rows={5}
                  maxLength={2000}
                  value={concern}
                  onChange={(e) => setConcern(e.target.value)}
                  placeholder="A few words about what you're going through, or any questions you have."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 text-sm resize-y"
                />
                <p className="text-[11px] text-muted text-right mt-1">
                  {concern.length}/2000
                </p>
              </div>

              {/* Session acknowledgements — confirmed for each booking */}
              <div className="rounded-[1.5rem] border border-border p-5 space-y-4">
                <h2 className="text-xs font-semibold tracking-wider uppercase text-muted">
                  Before we confirm
                </h2>

                {[
                  {
                    key: "paidSession" as const,
                    text: "I understand that therapy sessions are paid and that the fee applies to the slot I have selected.",
                  },
                  {
                    key: "paymentFirst" as const,
                    text: "I understand that my session will be confirmed only after payment verification, and that session access details are shared after payment is received.",
                  },
                  {
                    key: "communicationConsent" as const,
                    text: "I consent to receiving communication regarding my booking via email and WhatsApp.",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={consent[item.key]}
                      onChange={(e) =>
                        setConsent({ ...consent, [item.key]: e.target.checked })
                      }
                      className="mt-0.5 w-4 h-4 rounded border-border text-sage-600 focus:ring-sage-400/40 flex-shrink-0"
                    />
                    <span className="text-sm text-muted leading-relaxed group-hover:text-forest transition-colors duration-300">
                      {item.text}{" "}
                      <span className="text-sage-500">*</span>
                    </span>
                  </label>
                ))}

                <div className="pt-1">
                  <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
                    Anything else? (optional)
                  </label>
                  <textarea
                    rows={2}
                    maxLength={1000}
                    value={consent.notes}
                    onChange={(e) =>
                      setConsent({ ...consent, notes: e.target.value })
                    }
                    placeholder="Any additional notes or questions."
                    className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 text-sm resize-y"
                  />
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={submitting || !allConsentGiven}
                className="btn-pill w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Reserving your slot…" : "Reserve my slot"}
              </button>

              <p className="text-xs text-muted text-center leading-relaxed">
                You accepted our{" "}
                <Link href="/terms" target="_blank" className="underline">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="underline">
                  Privacy Policy
                </Link>
                {profile?.termsAcceptedAt
                  ? ` on ${new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(profile.termsAcceptedAt))}`
                  : " when you created your account"}
                , so we won&apos;t ask again. Your details stay private and are
                only ever used to arrange your session.
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
