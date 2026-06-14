"use client";

import { useEffect, useRef } from "react";

/**
 * A decorative thin flowing line that "draws" itself as the section scrolls
 * through the viewport — a faint thread that stitches the page together.
 * Honors prefers-reduced-motion (renders fully drawn, no scroll work).
 */
export default function FlowLine({
  className = "",
  d = "M-20,180 C160,60 280,300 470,250 C660,200 720,40 920,130 C1100,210 1240,340 1460,210",
  viewBox = "0 0 1440 360",
  strokeWidth = 1.5,
  opacity = 0.3,
}: {
  className?: string;
  d?: string;
  viewBox?: string;
  strokeWidth?: number;
  opacity?: number;
}) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const len = path.getTotalLength();
    path.style.strokeDasharray = String(len);

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      path.style.strokeDashoffset = "0";
      return;
    }

    path.style.strokeDashoffset = String(len);
    const svg = path.ownerSVGElement;
    let raf = 0;

    const update = () => {
      raf = 0;
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when the line's top edge sits at the bottom of the viewport,
      // 1 once it has fully scrolled past the top — so it traces on scroll.
      const p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
      path.style.strokeDashoffset = String(len * (1 - p));
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
    // `d` is a static literal per instance; capture once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <svg
      aria-hidden
      viewBox={viewBox}
      preserveAspectRatio="none"
      fill="none"
      className={`pointer-events-none ${className}`}
    >
      <path
        ref={pathRef}
        d={d}
        stroke="var(--color-sage-400)"
        strokeOpacity={opacity}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
