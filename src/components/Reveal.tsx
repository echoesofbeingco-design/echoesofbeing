"use client";

import { useEffect, useRef } from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms before this element animates in. */
  delay?: number;
  /** Vertical travel distance in px (default 24). */
  y?: number;
  /** Element to render as (default "div"). */
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>;

/**
 * Reveals its children with a gentle blur + fade + rise the first time they
 * scroll into view. Honors prefers-reduced-motion (shown instantly) and
 * degrades gracefully without JS via the noscript fallback in layout.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 24,
  as,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const Tag = (as || "div") as React.ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced-motion: reveal immediately, no transition.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.setAttribute("data-reveal", "visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-reveal", "visible");
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={className}
      style={
        {
          "--reveal-delay": `${delay}ms`,
          "--reveal-y": `${y}px`,
        } as React.CSSProperties
      }
      {...rest}
    >
      {children}
    </Tag>
  );
}
