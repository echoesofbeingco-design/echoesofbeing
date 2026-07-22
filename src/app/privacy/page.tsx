import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import SectionBg from "@/components/SectionBg";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Echoes of Being collects, uses, stores and protects your personal information, and the rights you have over your data.",
};

const sections = [
  {
    title: "Who we are",
    content: [
      "Echoes of Being is a counselling psychology practice based in Bengaluru, India, offering online therapy and consultation services. This policy explains what personal information we collect, why we collect it, how we protect it, and what rights you have over it.",
      "In the language of India's Digital Personal Data Protection Act, 2023, Echoes of Being is the Data Fiduciary responsible for your personal data, and you are the Data Principal. If you have any question or concern about your data, you can contact us at the address at the end of this policy.",
      "We take this seriously. What you share in therapy is among the most personal information there is, and we would rather collect too little than too much.",
    ],
  },
  {
    title: "Information you give us",
    content: [
      "Account details. If you create an account to book sessions, we store your name, email address and a securely hashed version of your password. We never store your password itself, and we cannot see it. Hashing is one-way: even we cannot reverse it back into your password.",
      "Booking and intake details. When you book a session we collect your name, email address, WhatsApp number, age, gender, pronouns, the type of session you want, a category for what you would like help with, and what you write in the 'what brings you here' field.",
      "Consent records. We record that you accepted these terms and our policies, and when you did so, so that we do not have to ask you again at every booking.",
      "Session records. If you go on to have sessions, your therapist keeps clinical notes about your work together. These are treated as confidential health records and are described in more detail below.",
      "Anything else you choose to send us. If you email or message us, we keep that correspondence so we can respond and maintain continuity of care.",
    ],
  },
  {
    title: "Information collected automatically",
    content: [
      "We deliberately keep this to a minimum.",
      "We do not use Google Analytics, advertising pixels, social media trackers, session recording, or any third-party analytics or profiling tools on this website. We do not build advertising profiles about you, and we do not sell or share your data with advertisers. Ever.",
      "The only cookie our website sets is an essential sign-in cookie that keeps you logged in to your account. It contains a signed token identifying your session, is marked HttpOnly so it cannot be read by scripts in your browser, and expires after seven days. It is strictly necessary for the site to work and is not used for tracking.",
      "Like virtually all websites, our hosting provider processes standard technical information such as your IP address and browser type in order to serve pages and to protect the service against abuse and denial-of-service attacks. We use IP addresses only for rate limiting and security, not to identify or profile you.",
    ],
  },
  {
    title: "How we use your information",
    content: [
      "To provide the service you asked for: to arrange, confirm and hold your sessions, and to deliver appropriate therapeutic care.",
      "To communicate with you about your booking: confirmations, session reminders, payment details, changes and cancellations, by email and WhatsApp.",
      "To keep clinical records, as professional ethical guidelines for counselling psychologists require.",
      "To keep the service safe and working: verifying that a booking is genuine, preventing spam and abuse, and diagnosing technical problems.",
      "To meet legal and professional obligations where these apply.",
      "We do not use your personal information to train artificial intelligence models, and we do not use what you share in sessions for marketing, research or any purpose other than your care.",
    ],
  },
  {
    title: "Your therapy records and confidentiality",
    content: [
      "Everything you share in a session is treated as strictly confidential in line with professional ethical guidelines for counselling psychologists. Session notes are accessible only to your therapist.",
      "Confidentiality may only be broken in the narrow circumstances set out in our Terms & Conditions: an imminent risk of serious harm to you or another person, a suspicion of abuse or neglect of a child, an elderly person or a person with a disability, or where disclosure is required by a court order or the law. Wherever it is possible and appropriate to do so, we will tell you first.",
      "Your clinical notes are not shared with any third party for marketing, analytics or commercial purposes under any circumstances.",
    ],
  },
  {
    title: "Services we rely on",
    content: [
      "Running a practice online means relying on a small number of carefully chosen service providers, who process data strictly on our instructions. We keep this list short on purpose, and we keep it honest and current:",
      "Google Firebase (Google Cloud) — securely stores booking records, account details and clinical notes.",
      "Google Calendar and Google Meet — when your session is confirmed, an entry is created in the practice calendar and you are invited as a guest so the appointment appears in your own calendar, along with a private video link for the session. The calendar entry contains your name, your email address and the session type. It does not contain anything you wrote about what brings you to therapy, and it never contains clinical notes.",
      "Resend — sends transactional email such as verification codes, booking confirmations and password resets.",
      "Vercel — hosts the website and processes standard technical request information.",
      "Sanity — stores the written articles published in Echoes. It holds no client or booking data at all.",
      "Each of these providers has its own privacy policy and security practices. We do not sell, rent or trade your personal information to anyone, and we do not share it with third parties for their own purposes.",
    ],
  },
  {
    title: "Where your data is stored",
    content: [
      "Our providers operate global infrastructure, which means your information may be stored or processed on servers outside India. Where that happens, we rely on providers that offer recognised contractual and technical safeguards for international transfers, and that are permitted under applicable Indian law.",
    ],
  },
  {
    title: "How we protect your information",
    content: [
      "All traffic between your device and our website is encrypted in transit using HTTPS.",
      "Passwords are hashed using bcrypt with a strong work factor. They are never stored, logged or transmitted in readable form.",
      "Our database is closed to direct public access. Every read and write goes through our own authenticated server code, so no client record is reachable from a browser.",
      "Administrative access to booking and clinical data is restricted to authorised accounts, protected by individual passwords and time-limited sessions, with sensitive actions limited to administrator accounts.",
      "We apply rate limiting and abuse protection to sign-in, verification and booking endpoints.",
      "No system can promise perfect security, and we will not pretend otherwise. If a breach ever occurs that affects your personal data, we will notify you and the relevant authority as required by law.",
    ],
  },
  {
    title: "How long we keep your data",
    content: [
      "Clinical and session records are retained for at least three years after your last session, in line with professional record-keeping guidelines, and may be kept longer where a legal or professional obligation requires it.",
      "Booking and payment records are kept for as long as needed for accounting and legal compliance.",
      "Account details are kept while your account is open. If you delete your account, we remove your profile and sign-in credentials as described below.",
      "Correspondence is kept only as long as it is useful for continuity of care.",
    ],
  },
  {
    title: "Your rights over your data",
    content: [
      "You have the right to ask what personal data we hold about you and to receive a copy of it.",
      "You have the right to have inaccurate or incomplete information corrected. You can update most of your details yourself from your profile page.",
      "You have the right to withdraw consent for communication or for optional processing at any time, though this may affect our ability to manage your bookings.",
      "You have the right to ask us to erase your personal data. You can delete your own account at any time from your profile page, which removes your sign-in credentials and profile details.",
      "Please note one honest limit on erasure: where you have actually attended sessions, we are required by professional and legal record-keeping obligations to retain the clinical record for the retention period described above, even after your account is deleted. In that case we sever the record from your login and restrict it so it is no longer used for any active purpose. We will always tell you plainly what has been deleted and what has been retained, and why.",
      "You have the right to nominate another person to exercise these rights on your behalf if you are unable to do so.",
      "You have the right to raise a grievance with us, and to complain to the Data Protection Board of India if you are not satisfied with our response.",
      "To exercise any of these rights, contact us at the address below. We will respond as promptly as we reasonably can.",
    ],
  },
  {
    title: "Children and young people",
    content: [
      "Our services are for adults aged 18 and above. We do not knowingly accept bookings from, or collect personal data about, anyone under 18. Age is asked for at sign-up and bookings from under-18s are declined, with signposting to appropriate youth support services.",
      "If you believe a person under 18 has provided us with personal information, please contact us and we will delete it.",
    ],
  },
  {
    title: "Changes to this policy",
    content: [
      "We may update this policy as the practice or the law changes. The effective date below always reflects the current version. If we make a change that materially affects how we handle your personal data, we will make reasonable efforts to tell existing clients by email rather than quietly changing the page.",
    ],
  },
  {
    title: "Contact and grievances",
    content: [
      "For any question, request or complaint about your personal data, including to exercise any of the rights above, please contact us:",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      {/* Header */}
      <section className="relative isolate overflow-hidden border-b border-border py-20 md:py-28">
        <SectionBg variant="sage" />
        <span
          aria-hidden
          className="ghost-heading absolute top-0 left-1/2 -translate-x-1/2 text-[26vw] md:text-[15vw] whitespace-nowrap"
        >
          Privacy
        </span>
        <Reveal className="relative max-w-3xl mx-auto px-6">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 block mb-5">
            Legal
          </span>
          <h1 className="display text-4xl md:text-6xl mb-6">Privacy Policy</h1>
          <p className="text-muted max-w-xl">
            What you share here matters. This page explains exactly what we
            collect, who it is shared with, how long we keep it, and the control
            you have over it.
          </p>
          <p className="text-xs text-muted mt-6">Last updated: July 2026</p>
        </Reveal>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="space-y-12">
            {sections.map((section, idx) => (
              <Reveal key={section.title} as="article">
                <h2 className="display text-xl md:text-2xl mb-4">
                  {idx + 1}. {section.title}
                </h2>
                <div className="space-y-3">
                  {section.content.map((paragraph, i) => (
                    <p key={i} className="text-sm text-muted leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.title === "Contact and grievances" && (
                  <div className="mt-4 bg-accent-bg/50 rounded-xl p-6">
                    <p className="text-sm font-medium mb-1">Echoes of Being</p>
                    <p className="text-sm text-muted">
                      echoesofbeing.co@gmail.com
                    </p>
                    <p className="text-xs text-muted mt-2">
                      Please write &ldquo;Data request&rdquo; in the subject line
                      so we can prioritise it.
                    </p>
                  </div>
                )}
              </Reveal>
            ))}
          </div>

          {/* Cross-link */}
          <div className="mt-16 pt-12 border-t border-border">
            <p className="text-sm text-muted mb-6">
              This policy sits alongside our{" "}
              <Link href="/terms" className="text-sage-600 underline hover:text-sage-700">
                Terms &amp; Conditions
              </Link>
              , which cover bookings, fees, cancellations and confidentiality in
              more detail.
            </p>
            <div className="text-center">
              <Link href="/book" className="btn-pill">
                Book a session
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
