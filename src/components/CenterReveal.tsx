"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Blur-fades its children in only while the surrounding section is crossing
 * the vertical centre of the viewport — i.e. while the sticky numeral is
 * pinned in the middle. Fades back out as the section leaves the centre.
 * Honors prefers-reduced-motion (shown immediately).
 */
export default function CenterReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }

    // a zero-height band at the viewport's vertical centre; the section
    // intersects it exactly while it straddles the middle of the screen.
    const target = el.closest("section") || el;
    const io = new IntersectionObserver(
      ([entry]) => setOn(entry.isIntersecting),
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[900ms] ease-out ${
        on ? "opacity-100 blur-0" : "opacity-0 blur-[6px]"
      } ${className}`}
    >
      {children}
    </div>
  );
}
