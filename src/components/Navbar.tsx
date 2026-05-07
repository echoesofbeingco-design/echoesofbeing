"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
              href="/about"
              className={`text-sm transition-colors duration-300 hover:text-sage-600 ${
                pathname === "/about" ? "text-sage-600" : "text-forest"
              }`}
            >
              About
            </Link>
            <Link
              href="/book"
              className="group text-sm bg-sage-600 text-cream px-5 py-2.5 rounded-full hover:bg-sage-700 hover:shadow-lg hover:shadow-sage-600/20 transition-all duration-300 inline-flex items-center gap-1.5"
            >
              Book a session
            </Link>
          </div>

          {/* Mobile hamburger  */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
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
              onClick={() => setMobileOpen(false)}
              className="text-sm py-2"
            >
              Services
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="text-sm py-2"
            >
              About
            </Link>
            <Link
              href="/book"
              onClick={() => setMobileOpen(false)}
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
