"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Lenis-powered inertial smooth scrolling. Adds momentum/easing to the wheel
 * and intercepts same-page anchor links so they glide (with a navbar offset)
 * instead of jumping. Disabled entirely under prefers-reduced-motion.
 *
 * Because Lenis owns the scroll position, a plain route change can leave the
 * new page mid-scroll (Lenis re-applies its old target on the next frame). So
 * on forward navigation we snap Lenis to the top; on back/forward (popstate)
 * we leave the browser's scroll restoration alone.
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const isPopRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Track back/forward so route-change resets don't clobber restored scroll.
    const onPopState = () => {
      isPopRef.current = true;
    };
    window.addEventListener("popstate", onPopState);

    // Glide to same-page anchors, leaving room for the sticky navbar.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -96 });
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // On forward navigation, snap to the top (skip on back/forward restore).
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (isPopRef.current) {
      isPopRef.current = false;
      return;
    }

    // Let hash-targeted navigations (e.g. "/#services") scroll to their anchor.
    if (window.location.hash) return;

    // Run after the browser/Next has committed its own scroll handling.
    requestAnimationFrame(() => {
      lenis.scrollTo(0, { immediate: true, force: true });
    });
  }, [pathname]);

  return null;
}
