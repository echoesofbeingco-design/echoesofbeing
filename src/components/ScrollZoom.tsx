"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wraps an image (or any node) and applies a gentle scroll-linked scale —
 * a slow "Ken Burns" zoom as the element travels through the viewport.
 * Place inside an `overflow-hidden` parent so the scaled image is clipped.
 *
 * Only computes while on-screen (IntersectionObserver gate) and honors
 * prefers-reduced-motion (stays at scale 1, no scroll work).
 */
export default function ScrollZoom({
  from = 1.04,
  to = 1.13,
  className = "",
  children,
}: {
  from?: number;
  to?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      el.style.transform = "scale(1)";
      return;
    }

    let raf = 0;
    let active = false;

    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 as the element enters from the bottom, 1 as it leaves past the top.
      const p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
      el.style.transform = `scale(${(from + (to - from) * p).toFixed(4)})`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false;
        if (visible && !active) {
          active = true;
          window.addEventListener("scroll", onScroll, { passive: true });
          update();
        } else if (!visible && active) {
          active = false;
          window.removeEventListener("scroll", onScroll);
        }
      },
      { rootMargin: "120px 0px 120px 0px" }
    );

    io.observe(el);
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [from, to]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ willChange: "transform", transformOrigin: "center" }}
    >
      {children}
    </div>
  );
}
