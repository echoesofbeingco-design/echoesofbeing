import Link from "next/link";
import FadeImage from "./FadeImage";
import ScrollZoom from "./ScrollZoom";
import type { ServiceDetail } from "@/data/services";

/** Tall full-bleed image card with overlay title + hover tagline reveal. */
export default function ServiceImageCard({
  service,
}: {
  service: ServiceDetail;
}) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative block overflow-hidden rounded-2xl aspect-[3/4]"
    >
      <ScrollZoom className="absolute inset-0" from={1.02} to={1.1}>
        <FadeImage
          src={service.image}
          alt={service.imageAlt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />
      </ScrollZoom>
      {/* graded overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/25 to-forest/40 transition-opacity duration-500 group-hover:from-forest/90" />

      <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-between">
        <h3 className="font-serif text-lg md:text-xl text-cream font-medium leading-snug">
          {service.title}
        </h3>

        <div>
          <p className="text-cream/85 text-xs leading-relaxed mb-3 max-h-0 opacity-0 -translate-y-1 group-hover:max-h-24 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 overflow-hidden">
            {service.tagline}
          </p>
          <span className="inline-flex items-center gap-1.5 text-cream text-xs font-medium tracking-wide">
            Explore
            <svg
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
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
          </span>
        </div>
      </div>
    </Link>
  );
}
