"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Reports a pageview on every route change.
 *
 * Uses sendBeacon where available so the request survives the visitor
 * navigating away, and falls back to a keepalive fetch. Every call is
 * fire-and-forget: a measurement failure must never surface to a visitor.
 */
export function trackEvent(event: string, path?: string) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({
    event,
    path: path ?? window.location.pathname,
    referrer: document.referrer,
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track",
        new Blob([body], { type: "application/json" })
      );
      return;
    }
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* measurement is never worth an error */
  }
}

export default function Analytics() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // React runs effects twice in dev StrictMode; guard so one visit is one view.
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    const body = JSON.stringify({
      path: pathname,
      referrer: document.referrer,
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/track",
          new Blob([body], { type: "application/json" })
        );
      } else {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return null;
}
