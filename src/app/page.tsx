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
                className="group border border-border rounded-2xl p-8 hover:border-sage-400/60 hover:shadow-sm transition-all duration-300 block"
              >
                <div className="w-10 h-10 rounded-full bg-secondary-bg mb-6 transition-all duration-300 group-hover:scale-125 group-hover:bg-sage-400/40" />
                <h3 className="font-serif text-lg font-medium mb-3">
                  {service.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {service.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm text-sage-600 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
