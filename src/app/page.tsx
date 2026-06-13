import Image from "next/image";
import Link from "next/link";

import { services } from "@/data/services";
import Reveal from "@/components/Reveal";
import { COMMUNITY_ENABLED } from "@/lib/features";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <Reveal>
              <div className="flex items-center gap-3 mb-8">
                <span className="w-8 h-px bg-sage-600 flex-shrink-0" />
                <p className="text-sm text-muted">
                  Hi, I&apos;m{" "}
                  <span className="text-forest font-medium">Nidhi Kishore</span>,
                  Counselling Psychologist, trauma-informed therapist.
                </p>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] font-medium leading-tight mb-8">
                You don&apos;t have to{" "}
                <span className="text-sage-400">figure it all out</span> alone.
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <div className="text-muted leading-relaxed mb-8 max-w-lg space-y-4">
                <p>
                  Most of us understand so much &mdash; our work, our world, the
                  people around us &mdash; and still find ourselves hard to
                  understand. Why we react the way we do. Why some things stay
                  with us longer than they should.
                </p>
                <p>
                  That&apos;s not a flaw. No one ever taught us how to make sense
                  of ourselves.
                </p>
                <p>
                  That&apos;s the work we do here. Without judgment, at your
                  pace, together.
                </p>
              </div>
            </Reveal>

            <Reveal delay={270}>
              <div className="flex items-center gap-6 mb-6">
                <Link
                  href="/book"
                  className="group bg-sage-600 text-cream px-6 py-3 rounded-full text-sm font-medium hover:bg-sage-700 hover:shadow-lg hover:shadow-sage-600/20 hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center gap-2"
                >
                  Book a session{" "}
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/about"
                  className="link-underline text-sm text-forest hover:text-sage-600 transition-colors duration-300"
                >
                  About Nidhi
                </Link>
              </div>
            </Reveal>

            <Reveal delay={360}>
              <p className="text-sm text-muted">
                If you&apos;re unsure, that&apos;s okay. You can always reach out
                with a question first.
              </p>
            </Reveal>
          </div>

          <div className="relative">
            <Reveal delay={150} y={36}>
              <Image
                src="/hero.jpg"
                alt="A serene therapy room with a linen armchair beside a sunlit window"
                width={600}
                height={500}
                className="rounded-2xl object-cover w-full h-[400px] md:h-[500px]"
                priority
              />
            </Reveal>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="mt-16 hidden md:flex justify-center">
          <a
            href="#services"
            aria-label="Scroll to what we work on"
            className="group flex flex-col items-center gap-2 text-muted hover:text-sage-600 transition-colors duration-300"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
              Scroll
            </span>
            <span className="animate-breathe-cue group-hover:text-sage-600">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </a>
        </div>
      </section>

      {/* Trust strip */}
      <section className="px-6 pb-4">
        <Reveal className="flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 rounded-full border border-border bg-cream-light/80 px-6 py-3 text-sm shadow-[0_10px_34px_-14px_rgba(45,53,45,0.22)] backdrop-blur-sm">
            <span className="text-muted">
              <span className="font-semibold text-forest">1,500+</span> sessions
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-sage-400/70" />
            <span className="text-muted">
              <span className="font-semibold text-forest">1,000+</span> supervised
              practice hours
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-sage-400/70" />
            <span className="text-muted">
              <span className="font-semibold text-forest">Master&apos;s</span> in
              Counselling Psychology
            </span>
          </div>
        </Reveal>
      </section>

      {/* Services */}
      <section id="services" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
              <div>
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 block mb-4">
                  What brings people here
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-medium leading-tight">
                  Some of what we can work on, together.
                </h2>
              </div>
              <div className="flex items-end">
                <p className="text-muted leading-relaxed">
                  Each session is shaped around you. Your story, your pace, your
                  questions.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <Reveal key={service.slug} delay={i * 80} className="h-full">
                <Link
                  href={`/services/${service.slug}`}
                  className="group h-full border border-border rounded-2xl p-5 md:p-8 hover:border-sage-400/60 hover:shadow-md hover:-translate-y-1 transition-all duration-300 block cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary-bg mb-5 md:mb-6 transition-all duration-300 group-hover:scale-125 group-hover:bg-sage-400/40" />
                  <h3 className="font-serif text-lg font-medium mb-2 md:mb-3">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm text-sage-600 font-medium transition-all duration-300 group-hover:gap-2.5">
                    Learn more
                    <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing line */}
      <section className="px-6">
        <Reveal className="flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 rounded-full border border-sage-400/30 bg-accent-bg/50 px-6 py-3 text-sm shadow-[0_10px_34px_-14px_rgba(45,53,45,0.22)] backdrop-blur-sm">
            <span className="text-muted">
              Individual therapy{" "}
              <span className="font-semibold text-forest">&#8377;2,000</span>
              <span className="text-muted">/session</span>
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-sage-500/70" />
            <span className="inline-flex items-center gap-1.5 font-medium text-sage-700">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
              First consultation is free
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-sage-500/70" />
            <span className="text-muted">Sliding scale available</span>
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28 border-t border-border mt-20 md:mt-28">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 block mb-4">
              How it works
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-medium mb-10">
              Working together.
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Book a free 30-minute consultation",
                body: "A short conversation to see if we're a good fit. No commitment.",
              },
              {
                title: "Fill a short intake form",
                body: "A few questions so I can understand a little about you before we meet.",
              },
              {
                title: "Begin your sessions",
                body: "Weekly or fortnightly, online. Your pace, your story.",
              },
            ].map((step, i) => (
              <Reveal key={step.title} delay={i * 90} className="h-full">
                <div className="h-full border border-border rounded-2xl p-6 md:p-8 hover:border-sage-400/60 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-secondary-bg text-sage-700 font-serif text-lg font-medium mb-5">
                    {i + 1}
                  </span>
                  <h3 className="font-serif text-lg font-medium mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Community — hidden behind feature flag (COMMUNITY_ENABLED) for now */}
      {COMMUNITY_ENABLED && (
      <section className="py-20 md:py-28 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Left — text */}
            <Reveal>
              <div>
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 block mb-4">
                  You&apos;re not alone
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-medium leading-tight mb-6">
                  A community that{" "}
                  <span className="text-sage-400">understands.</span>
                </h2>
                <p className="text-muted leading-relaxed mb-5">
                  Healing doesn&apos;t happen in isolation. Our community is a
                  gentle, moderated space where people share what they carry,
                  support each other through difficult seasons, and celebrate
                  small wins together.
                </p>
                <p className="text-muted leading-relaxed mb-8">
                  Post anonymously if you need to. Read stories that mirror your
                  own. Offer a kind word to someone who needs it. No judgment, no
                  pressure — just honest, human conversation.
                </p>

                <div className="flex items-center gap-6">
                  <Link
                    href="/community"
                    className="group bg-sage-600 text-cream px-6 py-3 rounded-full text-sm font-medium hover:bg-sage-700 hover:shadow-lg hover:shadow-sage-600/20 hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center gap-2"
                  >
                    Join the community
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
                  <Link
                    href="/auth/signup"
                    className="link-underline text-sm text-forest hover:text-sage-600 transition-colors duration-300"
                  >
                    Create an account
                  </Link>
                </div>
              </div>
            </Reveal>

            {/* Right — feature cards */}
            <div className="space-y-4">
              {[
                {
                  title: "Share openly or anonymously",
                  desc: "Post under your name or check the anonymous box — your identity stays protected either way.",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Safe and moderated",
                  desc: "Every post passes through multi-language content filters. Harmful content is automatically removed.",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622A11.99 11.99 0 0020.402 6a11.959 11.959 0 00-8.402-3.286z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Support one another",
                  desc: "Leave a kind response, send a heart, or simply read and know you're not the only one feeling this way.",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Topics for every season",
                  desc: "Anxiety, relationships, loneliness, small wins — find the conversation that speaks to where you are right now.",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 6h.008v.008H6V6z"
                      />
                    </svg>
                  ),
                },
              ].map((feature, i) => (
                <Reveal key={feature.title} delay={i * 90}>
                  <div className="group flex gap-4 border border-border rounded-xl p-5 hover:border-sage-400/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-secondary-bg flex items-center justify-center flex-shrink-0 text-sage-600 group-hover:bg-sage-400/30 group-hover:scale-110 transition-all duration-300">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-muted leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* CTA */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal y={36}>
            <div className="bg-sage-600 rounded-3xl py-16 md:py-20 px-6 text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-cream mb-4">
                Your first conversation is free.
              </h2>
              <p className="text-cream/80 mb-8 max-w-md mx-auto">
                30 minutes, no commitment &mdash; just a chance to see if this
                feels right.
              </p>
              <Link
                href="/book"
                className="group inline-flex items-center gap-2 bg-cream text-forest px-8 py-3.5 rounded-full text-sm font-medium hover:bg-cream-light hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 transition-all duration-300"
              >
                Book a free consultation
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <p className="text-cream/70 text-sm mt-6 max-w-md mx-auto">
                If you&apos;re unsure, that&apos;s okay. You can always reach out
                with a question first.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
