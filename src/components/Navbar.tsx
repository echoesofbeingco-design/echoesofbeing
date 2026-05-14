"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();

  const toggleMobileNav = useCallback((open: boolean) => {
    setMobileOpen(open);
    window.dispatchEvent(
      new CustomEvent("mobile-nav-toggle", { detail: { open } })
    );
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="h-1 bg-sage-600" />
      <nav className="bg-cream/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sage-600" />
            <span className="font-serif text-lg font-medium tracking-tight">
              Echos of Being
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/services"
              className={`text-sm transition-colors duration-300 hover:text-sage-600 ${
                pathname === "/services" ? "text-sage-600" : "text-forest"
              }`}
            >
              Services
            </Link>
            <Link
              href="/blog"
              className={`text-sm transition-colors duration-300 hover:text-sage-600 ${
                pathname.startsWith("/blog") ? "text-sage-600" : "text-forest"
              }`}
            >
              Blog
            </Link>
            <Link
              href="/community"
              className={`text-sm transition-colors duration-300 hover:text-sage-600 ${
                pathname.startsWith("/community")
                  ? "text-sage-600"
                  : "text-forest"
              }`}
            >
              Community
            </Link>
            <Link
              href="/about"
              className={`text-sm transition-colors duration-300 hover:text-sage-600 ${
                pathname === "/about" ? "text-sage-600" : "text-forest"
              }`}
            >
              About
            </Link>

            {/* Profile icon or Login link */}
            {!loading && (
              <>
                {user ? (
                  <Link
                    href="/community/profile"
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      pathname === "/community/profile"
                        ? "text-sage-600 bg-accent-bg"
                        : "text-muted hover:text-sage-600 hover:bg-accent-bg"
                    }`}
                    aria-label="Profile"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="text-sm text-sage-600 hover:text-sage-700 font-medium transition-colors"
                  >
                    Log in
                  </Link>
                )}
              </>
            )}

            <Link
              href="/book"
              className="group text-sm bg-sage-600 text-cream px-5 py-2.5 rounded-full hover:bg-sage-700 hover:shadow-lg hover:shadow-sage-600/20 transition-all duration-300 inline-flex items-center gap-1.5"
            >
              Book a session
            </Link>
          </div>

          {/* Mobile hamburger  */}
          <button
            onClick={() => toggleMobileNav(!mobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span
              className={`w-5 h-0.5 bg-forest transition-transform duration-300 ${
                mobileOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`w-5 h-0.5 bg-forest transition-opacity duration-300 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-5 h-0.5 bg-forest transition-transform duration-300 ${
                mobileOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border px-6 py-4 flex flex-col gap-4 bg-cream/95 backdrop-blur-md">
            <Link
              href="/services"
              onClick={() => toggleMobileNav(false)}
              className="text-sm py-2"
            >
              Services
            </Link>
            <Link
              href="/blog"
              onClick={() => toggleMobileNav(false)}
              className="text-sm py-2"
            >
              Blog
            </Link>
            <Link
              href="/community"
              onClick={() => toggleMobileNav(false)}
              className="text-sm py-2"
            >
              Community
            </Link>
            <Link
              href="/about"
              onClick={() => toggleMobileNav(false)}
              className="text-sm py-2"
            >
              About
            </Link>

            {/* Auth in mobile */}
            {!loading && (
              <>
                {user ? (
                  <Link
                    href="/community/profile"
                    onClick={() => toggleMobileNav(false)}
                    className="flex items-center gap-3 py-2 border-t border-border mt-1 pt-4 text-sm text-muted hover:text-sage-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                    My Profile
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => toggleMobileNav(false)}
                    className="text-sm py-2 text-sage-600 font-medium"
                  >
                    Log in / Sign up
                  </Link>
                )}
              </>
            )}

            <Link
              href="/book"
              onClick={() => toggleMobileNav(false)}
              className="text-sm bg-sage-600 text-cream px-5 py-2.5 rounded-full text-center hover:bg-sage-700 transition-all duration-300"
            >
              Book a session
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
