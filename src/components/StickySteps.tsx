"use client";

import { useEffect, useRef, useState } from "react";

type Step = { title: string; body: string };

/**
 * Editorial "how it works": a giant numeral pinned (sticky) on one side while
 * the step copy scrolls past on the other, with the active step emphasised.
 * Collapses to a stacked, numbered list on mobile.
 */
export default function StickySteps({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActive(Number((e.target as HTMLElement).dataset.idx));
          }
        });
      },
      // activate a step as its title rises into the numeral's zone near the top
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    refs.current.forEach((r) => r && observer.observe(r));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
      {/* Sticky numeral (desktop) — pinned near the top, level with the active
          step's title. The "0" holds still while the units digit rolls inside a
          clipped window: the old digit rolls up out of view and fades, the next
          rolls in from below. */}
      <div className="hidden md:flex md:sticky md:top-[16vh] items-start justify-center">
        <div
          className="display text-[12rem] lg:text-[15rem] leading-none text-sage-400 tabular-nums select-none flex items-start"
          style={{
            // soft cream halo lifts the numeral off the flow-art behind it
            textShadow:
              "0 0 24px var(--color-cream), 0 0 48px var(--color-cream), 0 0 80px var(--color-cream)",
          }}
          aria-label={`Step ${active + 1}`}
        >
          <span>0</span>
          <span className="relative inline-block overflow-hidden" aria-hidden>
            {/* invisible sizer reserves one digit's width and height */}
            <span className="invisible">0</span>
            {[1, 2, 3].map((n, i) => (
              <span
                key={n}
                className="absolute inset-0 flex items-start justify-center motion-safe:transition-all motion-safe:duration-[600ms] motion-safe:ease-out"
                style={{
                  opacity: i === active ? 1 : 0,
                  // only the active digit sits in the window; others roll fully
                  // out (up if already passed, down if still to come).
                  transform: `translateY(${
                    i < active ? -100 : i > active ? 100 : 0
                  }%)`,
                }}
              >
                {n}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="md:py-[18vh] space-y-14 md:space-y-[28vh]">
        {steps.map((s, i) => (
          <div
            key={i}
            data-idx={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={`transition-opacity duration-500 ${
              active === i ? "opacity-100" : "md:opacity-35"
            }`}
          >
            <span className="md:hidden display text-5xl text-sage-400 block mb-3">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-medium mb-4 leading-snug">
              {s.title}
            </h3>
            <p className="text-muted leading-relaxed max-w-md">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
