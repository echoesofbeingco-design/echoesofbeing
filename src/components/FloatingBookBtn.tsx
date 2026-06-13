"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const HIDDEN_PATHS = ["/book", "/auth/login", "/auth/signup"];

export default function FloatingBookBtn() {
  const pathname = usePathname();
  const [footerVisible, setFooterVisible] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Hide on booking and auth pages
  const onHiddenPage = HIDDEN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Listen for mobile nav open/close
  useEffect(() => {
    function handleNavToggle(e: Event) {
      setMobileNavOpen((e as CustomEvent).detail?.open ?? false);
    }

    window.addEventListener("mobile-nav-toggle", handleNavToggle);
    return () =>
      window.removeEventListener("mobile-nav-toggle", handleNavToggle);
  }, []);

  // Scroll-driven visibility: hide while the hero (first section) fills the
  // screen, reveal once scrolled into the next section, hide again at the footer.
  useEffect(() => {
    if (onHiddenPage) return;

    function handleScroll() {
      const footer = document.querySelector("footer");
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        setFooterVisible(footerRect.top < window.innerHeight - 20);
      }

      // Reveal only after the first section's bottom scrolls into the upper
      // part of the viewport — i.e. the next section is on screen.
      const hero = document.querySelector("main section");
      if (hero) {
        setPastHero(
          hero.getBoundingClientRect().bottom < window.innerHeight * 0.4
        );
      } else {
        setPastHero(window.scrollY > window.innerHeight * 0.6);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [onHiddenPage]);

  if (onHiddenPage) return null;

  const shouldHide = footerVisible || mobileNavOpen || !pastHero;

  return (
    <div
      className={`md:hidden fixed bottom-6 right-6 z-40 transition-all duration-300 ${
        shouldHide
          ? "translate-y-20 opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      }`}
    >
      <Link
        href="/book"
        className="relative bg-sage-600 text-cream px-5 py-3 rounded-full text-sm font-medium shadow-[0_4px_20px_rgba(45,53,45,0.35)] hover:bg-sage-700 active:scale-95 transition-all duration-200 flex items-center gap-2 ring-[3px] ring-cream/80"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
        Book a session
      </Link>
    </div>
  );
}
