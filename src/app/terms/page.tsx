import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Terms & Conditions | Echoes of Being",
  description:
    "Terms of use, privacy practices, and policies for Echoes of Being counselling psychology services.",
};

const sections = [
  {
    title: "1. Introduction",
    content: [
      "Welcome to Echoes of Being. By accessing our website, booking a session, or using any of our services, you agree to be bound by these Terms & Conditions. Please read them carefully before proceeding.",
      "Echoes of Being is a counselling psychology practice offering online therapy and consultation services. These terms govern the relationship between you (the client) and Echoes of Being (the practice).",
      'If you do not agree to these terms, please do not use our website or services. Your continued use of the website constitutes acceptance of these terms in their entirety.',
    ],
  },
  {
    title: "2. Services",
    content: [
      "Echoes of Being provides online counselling and psychotherapy services, including introductory consultations and individual therapy sessions. All sessions are conducted online via secure video platforms.",
      "Our services are therapeutic in nature and are not a substitute for medical treatment, psychiatric care, or emergency mental health services. We do not prescribe medication or provide medical diagnoses.",
      "The practice reserves the right to modify, suspend, or discontinue any service at any time with reasonable notice to affected clients.",
    ],
  },
  {
    title: "3. Eligibility",
    content: [
      "You must be at least 18 years of age to independently book and attend sessions. Clients under 18 may access services only with the written consent and involvement of a parent or legal guardian.",
      "By booking a session, you confirm that the information you provide is accurate and complete, and that you are seeking services voluntarily.",
      "Echoes of Being reserves the right to decline or discontinue services if, in the therapist's professional judgment, the client's needs fall outside the scope of services offered, or if a referral to another professional would better serve the client.",
    ],
  },
  {
    title: "4. Booking & Scheduling",
    content: [
      "Sessions are booked through our website using the online booking system. A booking is considered a request until confirmed by the practice after payment verification.",
      "By completing the intake form, you consent to the collection of the personal information requested, which is used solely for the purpose of providing you with appropriate therapeutic care.",
      "Session slots are reserved temporarily upon scheduling. Your slot is confirmed only after payment has been received and verified. Unconfirmed bookings may be released.",
    ],
  },
  {
    title: "5. Fees & Payment",
    content: [
      "Current fees are listed on our Services & Fees page. Fees are subject to change, and any changes will be communicated in advance of your next session.",
      "Payment is required at the time of booking via bank transfer or UPI. Payment details are provided with your booking confirmation. Sessions are not confirmed until payment is verified.",
      "The introductory consultation is offered on a complimentary basis and does not carry any obligation to continue with paid sessions.",
    ],
  },
  {
    title: "6. Cancellation & Rescheduling",
    content: [
      "Cancellations made at least 24 hours before a scheduled session will be eligible for rescheduling at no additional cost.",
      "Cancellations made less than 24 hours before a session are considered late cancellations and are charged in full. No refund will be provided for late cancellations or no-shows.",
      "In the event that the therapist needs to cancel or reschedule a session, you will be notified as soon as possible and offered an alternative time or a full refund.",
      "Refund requests are processed within 7 to 10 business days to the original payment method.",
    ],
  },
  {
    title: "7. Confidentiality",
    content: [
      "All information shared during sessions is treated as strictly confidential, in accordance with professional ethical guidelines for counselling psychologists.",
      "Confidentiality may only be broken in the following circumstances, as required by law or professional ethics: (a) if there is an imminent risk of harm to you or others; (b) if there is suspicion of abuse or neglect of a minor, elderly person, or person with a disability; (c) if disclosure is required by a court order or legal mandate.",
      "If confidentiality needs to be broken, you will be informed wherever possible and appropriate.",
      "Session records are stored securely and are accessible only to the therapist. Records are retained in accordance with professional guidelines and applicable laws.",
    ],
  },
  {
    title: "8. Data Collection & Privacy",
    content: [
      "We collect personal information through our booking form, including your name, email address, WhatsApp number, age, gender, pronouns, and details about what brings you to therapy. This information is used exclusively for providing and managing your therapeutic care.",
      "As part of the booking process, you may be asked to upload identity documents (such as Aadhaar card images). These documents are collected solely for verification purposes and are stored securely in encrypted cloud storage.",
      "Identity documents are automatically deleted from our systems after 30 days of upload. Download links to these documents expire and become inaccessible after deletion.",
      "We do not sell, trade, or share your personal information with third parties, except as required to provide our services (e.g., email and communication platforms) or as required by law.",
      "We use the following third-party services to operate: Firebase (data and file storage, by Google), Resend (transactional email), and Calendly (scheduling). Each of these services has its own privacy policy, and your data is subject to their respective terms when processed through their platforms.",
      "You have the right to request access to, correction of, or deletion of your personal data at any time by contacting us at the email address provided below.",
    ],
  },
  {
    title: "9. Communication",
    content: [
      "By providing your email and WhatsApp number during booking, and by checking the communication consent box, you consent to receiving messages related to your booking, session reminders, payment confirmations, and other service-related communication via these channels.",
      "We will not send marketing or promotional messages without your explicit consent. You may withdraw your communication consent at any time by notifying us, though this may affect our ability to manage your bookings effectively.",
      "Communication between sessions via email or WhatsApp is for scheduling and administrative purposes only. Therapeutic advice or crisis support is not provided outside of scheduled sessions.",
    ],
  },
  {
    title: "10. Client Responsibilities",
    content: [
      "You are responsible for attending sessions on time and in a private, quiet space suitable for a confidential conversation.",
      "You are responsible for ensuring you have a stable internet connection and access to the video platform used for sessions.",
      "Therapy is a collaborative process. While the therapist provides a supportive and professional space, positive outcomes depend on your active engagement and willingness to participate in the therapeutic process.",
      "You agree to inform the therapist of any changes in your mental or physical health, medication, or personal circumstances that may be relevant to your care.",
    ],
  },
  {
    title: "11. Emergency & Crisis Situations",
    content: [
      "Echoes of Being is not an emergency or crisis service. If you are experiencing a mental health emergency, suicidal thoughts, or are in immediate danger, please contact your nearest emergency services, go to the nearest hospital, or call a crisis helpline.",
      "Helpful resources in India include: iCall (9152987821), Vandrevala Foundation (1860 2662 345), and AASRA (9820466726).",
      "The therapist may, at their discretion, provide referrals to emergency services or other professionals if they believe you are at risk. This is done in good faith and in accordance with professional ethical obligations.",
    ],
  },
  {
    title: "12. Limitations & Disclaimers",
    content: [
      "Echoes of Being provides counselling services in good faith and to the best of the therapist's professional ability. However, we do not guarantee specific outcomes or results from therapy.",
      "The content on this website, including blog posts, service descriptions, and informational text, is for general informational purposes only and does not constitute professional advice, diagnosis, or treatment.",
      "Echoes of Being shall not be held liable for any direct, indirect, incidental, or consequential damages arising from the use of our website or services, to the fullest extent permitted by law.",
      "The website and services are provided on an \"as is\" basis. We make no warranties, express or implied, regarding the availability, accuracy, or reliability of the website.",
    ],
  },
  {
    title: "13. Intellectual Property",
    content: [
      "All content on this website, including text, graphics, logos, design, and layout, is the property of Echoes of Being and is protected by applicable intellectual property laws.",
      "You may not reproduce, distribute, modify, or create derivative works from any content on this website without prior written consent from Echoes of Being.",
    ],
  },
  {
    title: "14. Termination of Services",
    content: [
      "Either the client or the therapist may choose to end the therapeutic relationship at any time. If either party wishes to discontinue, reasonable notice is appreciated so that appropriate closure or referral can be arranged.",
      "Echoes of Being reserves the right to terminate services if: (a) the client's behaviour is threatening, abusive, or disruptive; (b) the therapist determines that a referral would be more appropriate; or (c) there is a persistent failure to comply with these terms, including non-payment.",
    ],
  },
  {
    title: "15. Governing Law",
    content: [
      "These Terms & Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in India.",
    ],
  },
  {
    title: "16. Changes to These Terms",
    content: [
      "Echoes of Being reserves the right to update or modify these Terms & Conditions at any time. Changes will be posted on this page with an updated effective date. Continued use of our website and services after any changes constitutes acceptance of the revised terms.",
      "For significant changes, we will make reasonable efforts to notify existing clients via email.",
    ],
  },
  {
    title: "17. Community Guidelines",
    content: [
      "The Echoes of Being Community is a peer support space for sharing thoughts, experiences, and encouragement. By using the Community, you agree to the following guidelines:",
      "Be respectful and kind. Treat every member with empathy, regardless of their background, identity, or beliefs. This is a safe space for vulnerability.",
      "No hate speech, slurs, or offensive language. Content that is harmful, discriminatory, threatening, or sexually explicit will be automatically removed. This includes content in all languages.",
      "No harassment or bullying. Targeting, mocking, or intimidating other members is strictly prohibited.",
      "No promotion of self-harm or harm to others. If you or someone you know is in crisis, please contact an emergency helpline immediately (iCall: 9152987821, Vandrevala Foundation: 1860-2662-345).",
      "No spam or self-promotion. The Community is for genuine conversation, not advertising or solicitation.",
      "Respect anonymity. Do not attempt to identify anonymous posters or share their information.",
      "Reports are taken seriously. Content that receives multiple reports from community members will be automatically reviewed and may be removed.",
      "Violations may result in account suspension. Echoes of Being reserves the right to suspend or ban accounts that repeatedly violate these guidelines.",
    ],
  },
  {
    title: "18. User-Generated Content",
    content: [
      "By posting content on the Echoes of Being Community, you grant Echoes of Being a non-exclusive, royalty-free licence to display your content within the platform.",
      "You retain ownership of your content but are responsible for ensuring it does not violate any laws or the rights of others.",
      "Echoes of Being reserves the right to remove any content that violates these terms or Community Guidelines without prior notice.",
      "Anonymous posts are attributed to 'Anonymous' publicly. The identity of anonymous posters is stored securely and is not shared with other users, but may be disclosed to law enforcement if required by Indian law.",
    ],
  },
  {
    title: "19. Community Account & Security",
    content: [
      "To participate in the Community, you must create an account with a valid email address and password. You are responsible for maintaining the confidentiality of your login credentials.",
      "Passwords are encrypted using industry-standard hashing (bcrypt). Echoes of Being cannot and does not store your password in plain text.",
      "Account actions — including posting, commenting, upvoting, and reporting — are rate-limited to prevent abuse and protect the platform's integrity.",
      "If you forget your password, you may request a one-time reset link sent to your registered email. This link expires after 1 hour and can only be used once.",
      "Echoes of Being implements security measures including DDoS protection, input validation, and session management to protect your account and data.",
    ],
  },
  {
    title: "20. Contact",
    content: [
      "If you have any questions, concerns, or requests regarding these Terms & Conditions or your personal data, please contact us:",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-accent-bg/40 border-b border-border py-20 md:py-28">
        <Reveal className="max-w-3xl mx-auto px-6">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 block mb-4">
            Legal
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-medium leading-tight mb-6">
            Terms & Conditions
          </h1>
          <p className="text-muted max-w-xl">
            Please review these terms carefully. They outline how our practice
            operates, what you can expect from us, and how we handle your
            information.
          </p>
          <p className="text-xs text-muted mt-6">
            Last updated: May 2025
          </p>
        </Reveal>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="space-y-12">
            {sections.map((section) => (
              <Reveal
                key={section.title}
                as="article"
                id={
                  section.title === "17. Community Guidelines"
                    ? "community-guidelines"
                    : undefined
                }
              >
                <h2 className="font-serif text-xl md:text-2xl font-medium mb-4">
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.content.map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-sm text-muted leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.title === "20. Contact" && (
                  <div className="mt-4 bg-accent-bg/50 rounded-xl p-6">
                    <p className="text-sm font-medium mb-1">Echoes of Being</p>
                    <p className="text-sm text-muted">
                      echoesofbeing.co@gmail.com
                    </p>
                  </div>
                )}
              </Reveal>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 pt-12 border-t border-border text-center">
            <p className="text-muted mb-6">
              Ready to take the next step?
            </p>
            <Link
              href="/book"
              className="group inline-flex items-center gap-2 bg-sage-600 text-cream px-8 py-3.5 rounded-full text-sm font-medium hover:bg-sage-700 hover:shadow-lg hover:shadow-sage-600/20 transition-all duration-300"
            >
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
      </section>
    </>
  );
}
