"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBooking, updateBookingConsent } from "@/lib/booking";

export default function ConsentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");

  const [booking, setBooking] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [consent, setConsent] = useState({
    paidSession: false,
    paymentFirst: false,
    communicationConsent: false,
    notes: "",
  });

  useEffect(() => {
    if (!bookingId) {
      router.replace("/book");
      return;
    }
    getBooking(bookingId).then((data) => {
      if (!data) {
        router.replace("/book");
        return;
      }
      setBooking(data);
      setLoading(false);
    });
  }, [bookingId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingId || !booking) return;

    setSubmitting(true);
    try {
      await updateBookingConsent(bookingId, consent);

      const updatedBooking = await getBooking(bookingId);

      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "slot_reserved",
          booking: updatedBooking,
        }),
      });

      router.push(`/book/confirmed?id=${bookingId}`);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-28 text-center">
        <p className="text-muted">Loading...</p>
      </section>
    );
  }

  return (
    <>
      <section className="max-w-2xl mx-auto px-6 pt-16 pb-8">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 block mb-4">
          Step 3 of 3
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-medium mb-4">
          One last thing.
        </h1>
        <p className="text-muted max-w-xl">
          Before we finalize your slot reservation, please review and acknowledge
          the following.
        </p>
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-20">
        <form
          onSubmit={handleSubmit}
          className="border border-border rounded-2xl p-8 md:p-10 space-y-6"
        >
          <div className="space-y-5">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                required
                checked={consent.paidSession}
                onChange={(e) =>
                  setConsent((prev) => ({
                    ...prev,
                    paidSession: e.target.checked,
                  }))
                }
                className="mt-1 w-4 h-4 rounded border-border text-sage-600 focus:ring-sage-400/40 flex-shrink-0"
              />
              <span className="text-sm text-muted leading-relaxed group-hover:text-forest transition-colors duration-300">
                I understand that therapy sessions are paid and that the fee
                applies to the slot I have selected.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                required
                checked={consent.paymentFirst}
                onChange={(e) =>
                  setConsent((prev) => ({
                    ...prev,
                    paymentFirst: e.target.checked,
                  }))
                }
                className="mt-1 w-4 h-4 rounded border-border text-sage-600 focus:ring-sage-400/40 flex-shrink-0"
              />
              <span className="text-sm text-muted leading-relaxed group-hover:text-forest transition-colors duration-300">
                I understand that my session will be confirmed only after payment
                verification. Therapist and session access details will be shared
                after payment is received.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                required
                checked={consent.communicationConsent}
                onChange={(e) =>
                  setConsent((prev) => ({
                    ...prev,
                    communicationConsent: e.target.checked,
                  }))
                }
                className="mt-1 w-4 h-4 rounded border-border text-sage-600 focus:ring-sage-400/40 flex-shrink-0"
              />
              <span className="text-sm text-muted leading-relaxed group-hover:text-forest transition-colors duration-300">
                I consent to receiving communication regarding my booking via
                email and WhatsApp.
              </span>
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wider uppercase block mb-2">
              Anything else? (optional)
            </label>
            <textarea
              rows={3}
              value={consent.notes}
              onChange={(e) =>
                setConsent((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Any additional notes or questions."
              className="w-full px-4 py-3 rounded-lg border border-border bg-cream-light focus:outline-none focus:ring-2 focus:ring-sage-400/40 transition-shadow duration-300 text-sm resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={
              submitting ||
              !consent.paidSession ||
              !consent.paymentFirst ||
              !consent.communicationConsent
            }
            className="w-full bg-forest text-cream py-3.5 rounded-lg text-sm font-medium hover:bg-sage-700 hover:shadow-lg hover:shadow-sage-600/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Reserve my slot"}
          </button>

          <p className="text-xs text-muted text-center">
            Your slot will be reserved. We will reach out with payment details.
          </p>
        </form>
      </section>
    </>
  );
}
