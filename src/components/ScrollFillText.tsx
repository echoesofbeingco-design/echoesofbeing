"use client";

import { useEffect, useRef } from "react";

type Props = {
  text: string;
  /** Words (lowercased, punctuation-stripped) to render in sage. */
  highlight?: string[];
  className?: string;
};

/**
 * A statement whose words fade from faint to solid as the element scrolls up
 * through the viewport, word by word. Highlighted words render in sage.
 * Honors prefers-reduced-motion (all words shown solid).
 */
export default function ScrollFillText({
  text,
  highlight = [],
  className = "",
}: Props) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const words = text.split(" ");
  const hl = new Set(highlight.map((w) => w.toLowerCase().replace(/[.,!?'"]/g, "")));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      spans.forEach((s) => (s.style.opacity = "1"));
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const startY = vh * 0.82; // word starts filling when its centre passes here
      const endY = vh * 0.4; // fully filled by here
      const span = startY - endY;
      for (const s of spans) {
        const r = s.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const p = Math.max(0, Math.min(1, (startY - center) / span));
        s.style.opacity = String(0.16 + p * 0.84);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => {
        const clean = w.toLowerCase().replace(/[.,!?'"]/g, "");
        return (
          <span
            key={i}
            data-w
            className="scroll-fill-word"
            style={{
              opacity: 0.16,
              color: hl.has(clean)
                ? "var(--color-sage-500)"
                : "var(--color-forest)",
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}
