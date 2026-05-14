import Image from "next/image";
import Link from "next/link";

import { services } from "@/data/services";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-px bg-sage-600" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-muted">
                Counselling Psychology
              </span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] font-medium leading-tight mb-8">
              You don&apos;t have to{" "}
              <span className="text-sage-400">figure it all out</span> alone.
            </h1>

            <p className="text-muted leading-relaxed mb-8 max-w-lg">
              Sometimes, something feels off and you can&apos;t quite name it.
              Maybe it&apos;s the weight of relationships, the quiet of
              loneliness, or the kind of anxiety that follows you into ordinary
              days. Whatever brought you here, this is a space where you get to
              slow down, be honest, and find your way at your own pace.
            </p>

            <div className="flex items-center gap-6 mb-6">
              <Link
                href="/book"
                className="group bg-sage-600 text-cream px-6 py-3 rounded-full text-sm font-medium hover:bg-sage-700 hover:shadow-lg hover:shadow-sage-600/20 transition-all duration-300 inline-flex items-center gap-2"
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
                className="text-sm text-forest hover:text-sage-600 transition-colors duration-300"
              >
                A little about me
              </Link>
            </div>

            <p className="text-sm text-muted">
              If you&apos;re unsure, that&apos;s okay. You can always reach out
              with a question first.
            </p>
          </div>

          <div className="relative">
            <Image
              src="/hero.jpg"
              alt="A serene therapy room with a linen armchair beside a sunlit window"
              width={600}
              height={500}
              className="rounded-2xl object-cover w-full h-[400px] md:h-[500px]"
              priority
            />
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group border border-border rounded-2xl p-5 md:p-8 hover:border-sage-400/60 hover:shadow-md transition-all duration-300 block cursor-pointer"
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
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-6">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 block mb-4">
            How it works
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-medium mb-8">
            Working together.
          </h2>
          <div className="space-y-6 text-muted leading-relaxed">
            <p>
              Once you book a session, you&apos;ll receive a confirmation with
              all the details you need. Before we begin, you&apos;ll also be
              asked to fill out a short client intake form and a consent form.
              This helps me understand a little about you before we meet, and
              ensures we&apos;re starting on the same page.
            </p>
            <p>
              Sessions are held online. You don&apos;t need to have a clear
              reason to reach out. Sometimes just feeling like something needs
              to change is enough.
            </p>
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="py-20 md:py-28 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Left — text */}
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
                  className="group bg-sage-600 text-cream px-6 py-3 rounded-full text-sm font-medium hover:bg-sage-700 hover:shadow-lg hover:shadow-sage-600/20 transition-all duration-300 inline-flex items-center gap-2"
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
                  className="text-sm text-forest hover:text-sage-600 transition-colors duration-300"
                >
                  Create an account
                </Link>
              </div>
            </div>

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
                  desc: "Leave a kind response, send a heart, or simply read and know you&apos;re not the only one feeling this way.",
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
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group flex gap-4 border border-border rounded-xl p-5 hover:border-sage-400/50 transition-colors duration-300"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary-bg flex items-center justify-center flex-shrink-0 text-sage-600 group-hover:bg-sage-400/30 transition-colors duration-300">
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
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-sage-600 rounded-3xl py-16 md:py-20 px-6 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-cream mb-4">
              Ready when you are.
            </h2>
            <p className="text-cream/80 mb-8 max-w-md mx-auto">
              If you&apos;re unsure, that&apos;s okay. You can always reach out
              with a question first.
            </p>
            <Link
              href="/book"
              className="group inline-flex items-center gap-2 bg-cream text-forest px-8 py-3.5 rounded-full text-sm font-medium hover:bg-cream-light hover:shadow-lg hover:shadow-black/10 transition-all duration-300"
            >
              Book a session
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
          </div>
        </div>
      </section>
    </>
  );
}
