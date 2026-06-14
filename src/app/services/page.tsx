import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import SectionBg from "@/components/SectionBg";

export const metadata: Metadata = {
  title: "Services & Fees",
  description:
    "Clear, honest pricing. Sessions shaped to fit. Individual therapy, couples sessions, and more.",
};

const plans = [
  {
    title: "Introductory consultation",
    duration: "30 minutes",
    price: "Complimentary",
    description:
      "A short conversation to share what brings you in and to see if we're a good fit. No commitment to continue.",
    highlighted: false,
  },
  {
    title: "Individual therapy",
    duration: "50 minutes",
    price: "₹2,000 / session",
    description:
      "Weekly or fortnightly one-to-one sessions held online. Most clients begin here.",
    highlighted: true,
    badge: "Most chosen",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* ──────────  Header  ────────── */}
      <section className="relative isolate overflow-hidden border-b border-border py-20 md:py-28">
        <SectionBg variant="sage" />
        <span
          aria-hidden
          className="ghost-heading absolute top-0 left-1/2 -translate-x-1/2 text-[24vw] md:text-[16vw] whitespace-nowrap"
        >
          Fees
        </span>
        <Reveal className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 block mb-5">
            Services & fees
          </span>
          <h1 className="display text-4xl md:text-6xl mb-6">
            Clear, honest pricing.
            <br />
            Sessions shaped to fit.
          </h1>
          <p className="text-muted max-w-lg mx-auto">
            Fees are payable at the time of booking. Sliding-scale spots are
            available, please ask.
          </p>
        </Reveal>
      </section>

      {/* ──────────  Pricing cards  ────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {plans.map((plan, i) => (
              <Reveal key={plan.title} delay={i * 100} className="h-full">
                <article
                  className={`h-full rounded-[1.5rem] p-8 border transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
                    plan.highlighted
                      ? "border-sage-500 ring-1 ring-sage-500/20 bg-secondary-bg/40"
                      : "border-border hover:border-sage-400/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h2 className="font-serif text-xl font-medium">
                      {plan.title}
                    </h2>
                    {plan.badge && (
                      <span className="text-xs bg-accent-bg text-sage-600 px-3 py-1 rounded-full font-medium">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted mb-4">{plan.duration}</p>
                  <p className="display text-3xl text-sage-600 mb-4">
                    {plan.price}
                  </p>
                  <p className="text-sm text-muted leading-relaxed">
                    {plan.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Payment note */}
          <Reveal className="relative isolate overflow-hidden rounded-[1.5rem] p-8 mb-12 block">
            <SectionBg variant="warm" />
            <h3 className="font-serif text-lg font-medium mb-3">Payment</h3>
            <p className="text-sm text-muted leading-relaxed">
              Sessions are paid at the time of booking via bank transfer or UPI.
              Payment details are sent with your appointment confirmation.
              Cancellations made less than 24 hours before a session are charged
              in full.
            </p>
          </Reveal>

          {/* CTA */}
          <div className="text-center">
            <Link href="/book" className="btn-pill">
              Book a session
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
