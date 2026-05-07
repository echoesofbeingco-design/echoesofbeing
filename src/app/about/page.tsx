import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About | Echos of Being",
  description:
    "I'm Nidhi Kishore, a Counselling Psychologist with a Master's in Counselling Psychology.",
};

export default function AboutPage() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
        {/* Image */}
        <div>
          <Image
            src="/about.jpg"
            alt="A single eucalyptus sprig on warm cream paper"
            width={500}
            height={600}
            className="rounded-2xl object-cover w-full h-[400px] md:h-[520px]"
            priority
          />
        </div>

        {/* Content */}
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 block mb-4">
            About the practice
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-medium mb-8">
            A little about me.
          </h1>

          <div className="space-y-6 text-muted leading-relaxed">
            <p>
              I&apos;m <span className="font-semibold text-forest">Nidhi Kishore</span>,
              a Counselling Psychologist with a Master&apos;s in Counselling
              Psychology and two years of practice working across schools,
              colleges, and organisations with children, young adults, and
              adults.
            </p>
            <p>
              I am a trauma-informed therapist, which means I understand that a
              lot of what we carry today has roots we didn&apos;t choose.
              Difficult relationships, environments that didn&apos;t feel safe,
              experiences that were never fully processed. These shape how we
              think, feel, and move through the world. My work is not about
              finding what&apos;s wrong with you. It&apos;s about understanding
              what happened to you, and what you&apos;ve been doing to survive.
            </p>
            <p>
              In our sessions, I won&apos;t hand you a script for how to feel
              better. I believe you already hold many of your own answers, and
              my role is to help you access them. That said, there are times when
              a little structure or a gentle framework helps, and I bring that in
              when it serves you.
            </p>
          </div>

          {/* Details */}
          <div className="mt-10 pt-8 border-t border-border grid grid-cols-2 gap-8">
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-muted block mb-2">
                Approach
              </span>
              <p className="font-medium">Trauma-informed &middot; Integrative</p>
            </div>
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-muted block mb-2">
                Format
              </span>
              <p className="font-medium">Online sessions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
