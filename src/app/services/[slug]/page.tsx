import type { Metadata } from "next";
import FadeImage from "@/components/FadeImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services, getServiceBySlug } from "@/data/services";
import Reveal from "@/components/Reveal";
import ScrollZoom from "@/components/ScrollZoom";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.title} Therapy`,
    description: service.description,
    alternates: { canonical: `https://www.echoesofbeing.co.in/services/${slug}` },
    openGraph: {
      title: `${service.title} | Echoes of Being`,
      description: service.description,
      type: "website",
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.title} Therapy`,
    description: service.description,
    provider: {
      "@type": "ProfessionalService",
      name: "Echoes of Being",
      url: "https://www.echoesofbeing.co.in",
    },
    areaServed: { "@type": "Country", name: "India" },
    serviceType: "Counselling Psychology",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ──────────  Hero  ────────── */}
      <section className="relative">
        <div className="h-[340px] md:h-[460px] relative overflow-hidden bg-secondary-bg">
          <ScrollZoom className="absolute inset-0" from={1.04} to={1.14}>
            <FadeImage
              src={service.image}
              alt={service.imageAlt}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </ScrollZoom>
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/45 to-transparent" />
        </div>
        <div className="max-w-3xl mx-auto px-6 -mt-28 relative z-10">
          <Link
            href="/#services"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-sage-600 transition-colors duration-300 mb-6"
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
            Back to services
          </Link>
          <h1 className="display text-4xl md:text-6xl mb-4">{service.title}</h1>
          <p className="font-serif text-xl md:text-2xl text-sage-500 mb-6">
            {service.tagline}
          </p>
          <p className="text-muted leading-relaxed text-lg">
            {service.description}
          </p>
        </div>
      </section>

      {/* ──────────  Content sections  ────────── */}
      <section className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="space-y-14 md:space-y-20">
          {service.sections.map((section, i) => (
            <Reveal key={i} className="block">
              <div className="flex items-start gap-5 md:gap-8">
                <span className="display text-2xl md:text-4xl text-sage-400/60 tabular-nums flex-shrink-0 pt-1 select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="display text-2xl md:text-3xl mb-4">
                    {section.heading}
                  </h2>
                  <p className="text-muted leading-relaxed">{section.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Closing */}
        <Reveal className="mt-20 pt-10 border-t border-border block">
          <blockquote className="display text-2xl md:text-[2rem] leading-relaxed text-forest/85">
            &ldquo;{service.closing}&rdquo;
          </blockquote>
        </Reveal>
      </section>

      {/* ──────────  CTA  ────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal
            y={36}
            className="relative isolate overflow-hidden grain bg-sage-600 rounded-[2rem] py-14 md:py-16 px-6 text-center block"
          >
            <h2 className="display text-3xl md:text-4xl text-cream mb-3">
              Ready to start?
            </h2>
            <p className="text-cream/80 mb-8 max-w-md mx-auto text-sm">
              You don&apos;t need to have the right words. Just showing up is the
              first step.
            </p>
            <Link
              href="/book"
              className="group inline-flex items-center gap-2 bg-cream text-forest px-8 py-3.5 rounded-full text-sm font-medium hover:bg-cream-light hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 transition-all duration-300"
            >
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
          </Reveal>
        </div>
      </section>
    </>
  );
}
