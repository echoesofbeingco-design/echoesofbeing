import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="border-t border-border bg-accent-bg/40">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-sage-600" />
              <span className="font-serif text-lg font-medium">
                Echos of Being
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              A counselling psychology practice. Gentle, confidential,
              evidence-informed.
            </p>
          </div>

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
                  href="/about"
                  className="text-sm text-muted hover:text-forest transition-colors duration-300"
                >
                  About
                </Link>
              </li>
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
          </div>
        </div>
      </div>

      <div className="border-t border-border py-6">
        <p className="text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} Echos of Being. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
