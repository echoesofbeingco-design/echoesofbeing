import Link from "next/link";
import SectionBg from "@/components/SectionBg";
import { COMMUNITY_ENABLED } from "@/lib/features";

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-border">
      <SectionBg variant="warm" />

      <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-12">
        {/* Sign-off */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-sage-600" />
            <span className="display text-3xl md:text-5xl">Echoes of Being</span>
          </div>
          <p className="text-sm text-muted leading-relaxed max-w-md">
            A counselling psychology practice. Safe, confidential,
            evidence-informed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 border-t border-border/70 pt-12">
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase mb-4">
              Visit
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/services"
                  className="text-sm text-muted hover:text-forest transition-colors duration-300"
                >
                  Services & fees
                </Link>
              </li>
              <li>
                <Link
                  href="/echoes"
                  className="text-sm text-muted hover:text-forest transition-colors duration-300"
                >
                  Echoes
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted hover:text-forest transition-colors duration-300"
                >
                  About
                </Link>
              </li>
              {COMMUNITY_ENABLED && (
                <li>
                  <Link
                    href="/community"
                    className="text-sm text-muted hover:text-forest transition-colors duration-300"
                  >
                    Community
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/book"
                  className="text-sm text-muted hover:text-forest transition-colors duration-300"
                >
                  Book a session
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase mb-4">
              Contact
            </h3>
            <p className="text-sm text-muted">echoesofbeing.co@gmail.com</p>
            <p className="text-sm text-muted mt-1">By appointment only</p>
            <a
              href="https://instagram.com/echoesofbeing.therapy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-muted hover:text-forest transition-colors duration-300"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.52.01-4.76.07-.97.04-1.5.21-1.85.34-.46.18-.8.4-1.15.74-.34.35-.56.69-.74 1.15-.13.35-.3.88-.34 1.85-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.04.97.21 1.5.34 1.85.18.46.4.8.74 1.15.35.34.69.56 1.15.74.35.13.88.3 1.85.34 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.97-.04 1.5-.21 1.85-.34.46-.18.8-.4 1.15-.74.34-.35.56-.69.74-1.15.13-.35.3-.88.34-1.85.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.97-.21-1.5-.34-1.85-.18-.46-.4-.8-.74-1.15-.35-.34-.69-.56-1.15-.74-.35-.13-.88-.3-1.85-.34-1.24-.06-1.61-.07-4.76-.07zm0 2.76a5.46 5.46 0 110 10.92 5.46 5.46 0 010-10.92zm0 9a3.54 3.54 0 100-7.08 3.54 3.54 0 000 7.08zm6.95-9.22a1.28 1.28 0 11-2.55 0 1.28 1.28 0 012.55 0z" />
              </svg>
              @echoesofbeing.therapy
            </a>
            <div className="mt-6">
              <Link
                href="/terms"
                className="text-xs text-muted hover:text-forest transition-colors duration-300"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-border py-6">
        <p className="text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} Echoes of Being. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
