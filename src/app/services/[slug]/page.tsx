import type { Metadata } from "next";
import FadeImage from "@/components/FadeImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services, getServiceBySlug } from "@/data/services";

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
      title: `${service.title} — Echos of Being`,
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
      name: "Echos of Being",
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
      {/* Hero */}
      <section className="relative">
        <div className="h-[320px] md:h-[420px] relative overflow-hidden bg-secondary-bg">
          <FadeImage
            src={service.image}
            alt={service.imageAlt}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/40 to-transparent" />
        </div>
        <div className="max-w-3xl mx-auto px-6 -mt-24 relative z-10">
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
          <h1 className="font-serif text-4xl md:text-5xl font-medium mb-4">
            {service.title}
          </h1>
          <p className="font-serif text-xl md:text-2xl text-sage-500 mb-6">
            {service.tagline}
          </p>
          <p className="text-muted leading-relaxed text-lg">
            {service.description}
          </p>
        </div>
      </section>

      {/* Content sections */}
      <section className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="space-y-16">
          {service.sections.map((section, i) => (
            <div key={i} className="group">
              <div className="flex items-start gap-5">
                <div className="hidden md:block mt-2 w-8 h-8 rounded-full bg-secondary-bg flex-shrink-0 group-hover:bg-sage-400/40 transition-colors duration-300" />
                <div>
                  <h2 className="font-serif text-2xl font-medium mb-4">
                    {section.heading}
                  </h2>
                  <p className="text-muted leading-relaxed">
                    {section.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Closing */}
        <div className="mt-20 pt-10 border-t border-border">
          <blockquote className="font-serif text-xl md:text-2xl leading-relaxed text-forest/80 italic">
            &ldquo;{service.closing}&rdquo;
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-sage-600 rounded-3xl py-14 md:py-16 px-6 text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-cream mb-3">
              Ready to start?
            </h2>
            <p className="text-cream/80 mb-8 max-w-md mx-auto text-sm">
              You don&apos;t need to have the right words. Just showing up is
              the first step.
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
