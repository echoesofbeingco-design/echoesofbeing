"use client";

import { useEffect, useRef } from "react";

/**
 * A slim sage progress bar pinned to the top of the viewport that appears while
 * navigating between pages.
 *
 * Deliberately framework-agnostic: it does NOT use Next's navigation hooks
 * (usePathname/useSearchParams), which couple into React's navigation
 * transition and can trigger "useInsertionEffect must not schedule updates".
 * Instead it starts on internal link clicks and watches `location` to know when
 * the URL has committed. All work is imperative DOM mutation via a ref — no
 * React state, so it never re-renders during a navigation.
 */
export default function TopLoader() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let progress = 0;
    let active = false;
    let startUrl = "";
    let trickle: ReturnType<typeof setInterval> | null = null;
    let watch: ReturnType<typeof setInterval> | null = null;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const setWidth = (p: number) => {
      if (barRef.current) barRef.current.style.width = `${p}%`;
    };

    const clearAll = () => {
      if (trickle) clearInterval(trickle);
      if (watch) clearInterval(watch);
      trickle = null;
      watch = null;
      timeouts.forEach(clearTimeout);
      timeouts.length = 0;
    };

    const done = () => {
      if (!active) return;
      active = false;
      clearAll();
      progress = 100;
      setWidth(100);
      timeouts.push(
        setTimeout(() => {
          if (barRef.current) barRef.current.style.opacity = "0";
          timeouts.push(
            setTimeout(() => {
              progress = 0;
              setWidth(0);
            }, 300)
          );
        }, 250)
      );
    };

    const start = () => {
      const bar = barRef.current;
      if (!bar) return;
      clearAll();
      active = true;
      startUrl = location.href;
      bar.style.opacity = "1";
      progress = 10;
      setWidth(10);
      trickle = setInterval(() => {
        if (progress >= 90) return;
        const inc = progress < 50 ? 9 : progress < 75 ? 4 : 1.5;
        progress = Math.min(90, progress + inc);
        setWidth(progress);
      }, 280);
      // Complete once the URL actually changes (route committed).
      watch = setInterval(() => {
        if (location.href !== startUrl) done();
      }, 90);
      // Safety: never leave the bar stuck if navigation never happens.
      timeouts.push(setTimeout(done, 10000));
    };

    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        anchor.getAttribute("target") === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }
      try {
        const url = new URL(href, location.href);
        if (url.origin !== location.origin) return; // external
        if (url.pathname === location.pathname && url.search === location.search) {
          return; // same page (or hash-only)
        }
        start();
      } catch {
        // ignore malformed hrefs
      }
    };

    // Back/forward: the URL has already changed, so just flash a brief bar.
    const onPopState = () => {
      const bar = barRef.current;
      if (!bar) return;
      clearAll();
      active = true;
      bar.style.opacity = "1";
      progress = 30;
      setWidth(30);
      timeouts.push(setTimeout(done, 350));
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      clearAll();
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        ref={barRef}
        style={{
          height: 3,
          width: "0%",
          opacity: 0,
          background:
            "linear-gradient(90deg, var(--color-sage-600), var(--color-sage-400))",
          boxShadow: "0 0 10px rgba(132, 162, 132, 0.7)",
          borderRadius: "0 3px 3px 0",
          transition: "width 0.25s ease-out, opacity 0.35s ease-out",
        }}
      />
    </div>
  );
}
