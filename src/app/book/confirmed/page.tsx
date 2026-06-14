"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBooking } from "@/lib/booking";

function ConfirmedContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const [name, setName] = useState("");

  useEffect(() => {
    if (bookingId) {
      getBooking(bookingId).then((data) => {
        if (data) setName(data.name as string);
      });
    }
  }, [bookingId]);

  return (
    <section className="max-w-2xl mx-auto px-6 py-20 md:py-28">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-full bg-sage-600/10 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-sage-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="display text-4xl md:text-5xl mb-4">
          Your slot is reserved{name ? `, ${name.split(" ")[0]}` : ""}.
        </h1>
        <p className="text-muted leading-relaxed max-w-md mx-auto">
          Thank you for taking this step. We have received your details and your
          calendar slot has been held for you.
        </p>
      </div>

      <div className="border border-border rounded-2xl p-8 md:p-10 space-y-8">
        <div>
          <h2 className="font-serif text-xl font-medium mb-4">
            What happens next
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-secondary-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-sage-600">1</span>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">
                  We will reach out on WhatsApp
                </p>
                <p className="text-sm text-muted leading-relaxed">
                  You will receive a message with payment details and next steps.
                  This usually happens within a few hours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-secondary-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-sage-600">2</span>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Complete your payment</p>
                <p className="text-sm text-muted leading-relaxed">
                  Payment can be made via UPI or bank transfer. Details will be
                  shared with you personally.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-secondary-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-sage-600">3</span>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Session confirmed</p>
                <p className="text-sm text-muted leading-relaxed">
                  Once payment is verified, your session is confirmed. Therapist
                  and session access details will be shared with you.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-accent-bg/50 rounded-xl p-5">
          <p className="text-sm text-muted leading-relaxed">
            <span className="font-medium text-forest">Please note:</span> Your
            slot is temporarily reserved, not yet confirmed. It will be finalized
            once payment is verified. If you have any questions, feel free to
            email us at{" "}
            <a href="mailto:echoesofbeing.co@gmail.com" className="text-sage-600 underline hover:text-forest transition-colors">echoesofbeing.co@gmail.com</a>
          </p>
        </div>
      </div>

      <div className="text-center mt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-sage-600 hover:text-sage-700 transition-colors duration-300"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to home
        </Link>
      </div>
    </section>
  );
}

export default function ConfirmedPage() {
  return (
    <Suspense
      fallback={
        <section className="max-w-2xl mx-auto px-6 py-28 text-center">
          <p className="text-muted">Loading...</p>
        </section>
      }
    >
      <ConfirmedContent />
    </Suspense>
  );
}
