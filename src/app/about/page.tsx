import type { Metadata } from "next";
import Image from "next/image";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "I'm Nidhi Kishore, a Bengaluru-based Counselling Psychologist. A warm, trauma-informed space to understand yourself and grow, at your own pace.",
};

const sections = [
  {
    heading: "Why I started Echoes of Being",
    paras: [
      "I became a Counselling Psychologist because I have always been drawn to how people grow. What helps someone move from feeling stuck to feeling a little steadier. How we change, how we come to understand our own emotions, how we slowly become more ourselves. That curiosity is really what my whole training has been about.",
      "Growing up in India, I noticed how rarely any of this was spoken about. Therapy was often seen as something you turned to only when things had gone seriously wrong, not as a place to understand yourself or to grow. Reaching out felt unfamiliar, and for many people it still does.",
      "That has slowly started to change, and counselling is talked about far more openly now. But along the way I noticed something else. Even as it became more popular, genuinely good and caring support stayed surprisingly hard to find. I started Echoes of Being to be exactly that. A space that takes your inner world seriously, that is warm and unhurried, and that helps you not only feel a little lighter, but understand yourself and grow.",
    ],
  },
  {
    heading: "How I work",
    paras: [
      "I am a trauma-informed therapist. In simple words, that means I understand that a lot of what we carry today has roots we did not choose. Difficult relationships, places that never felt safe, things that happened to us before we had the words for them. These quietly shape how we think, how we feel, and how we move through our days. My work is not about finding what is wrong with you. It is about understanding what happened to you, and what you have been doing to cope ever since. Then we look, gently and without judgment, at whether those ways of coping are still helping you, or whether they are quietly holding you back. And where they no longer serve you, we find ways that do.",
      "The way I work comes from two simple beliefs. The first is that you are not broken and you do not need fixing. You are someone who is capable of growing, and you already hold more of your own answers than you might realise. Part of our work is helping you find a version of yourself that feels more like you. Not someone new, just more honest, more whole, closer to the person underneath everything you have had to be for everyone else. The second belief is that the bigger questions matter too. Who am I, what do I really want, why do I feel lost, what makes my life feel like mine. These are questions all of us carry, and most of us rarely get a safe place to ask them out loud. Here, you do.",
      "Most of our work together is about understanding, not rushing to fix. But sometimes a practical tool helps, a way to steady a racing mind, or to sit with a strong feeling without being swept away by it. When that is useful, I draw on techniques from well-tested approaches like CBT and DBT. You do not need to know what those are. You will simply feel that, alongside the understanding, you are slowly building ways to handle things more easily.",
      "In our sessions, there is no script and no pressure to perform. This is your story, and we move at your pace. My role is simply to walk beside you while you find your footing.",
    ],
  },
  {
    heading: "What I hope for",
    paras: [
      "My hope for Echoes of Being is a simple one. That good, genuine psychological support becomes something anyone can reach, without fear, without stigma, and without confusion about where to even begin. That understanding yourself stops feeling like a luxury, and starts feeling like an ordinary part of taking care of your life. I am building this slowly and carefully, one person at a time, toward a day when reaching out for help feels as natural as it always should have.",
    ],
  },
];

export default function AboutPage() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
        {/* Image */}
        <div className="relative md:sticky md:top-24">
          <Reveal y={36}>
            <Image
              src="/about.jpg"
              alt="A single eucalyptus sprig on warm cream paper"
              width={500}
              height={600}
              className="rounded-2xl object-cover w-full h-[400px] md:h-[520px]"
              priority
            />
          </Reveal>
        </div>

        {/* Content */}
        <div>
          <Reveal>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 block mb-4">
              About the practice
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-medium mb-8">
              A little about me.
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="text-muted leading-relaxed">
              I&apos;m{" "}
              <span className="font-semibold text-forest">Nidhi Kishore</span>, a
              Counselling Psychologist based in Bengaluru. I hold a Master&apos;s
              in Counselling Psychology, and over the last few years I have spent
              more than 1,500 hours sitting with people in counselling. I have
              worked across schools, colleges, and organisations, with children,
              teenagers, young adults, and adults, each bringing something
              different.
            </p>
          </Reveal>

          {sections.map((s) => (
            <Reveal key={s.heading}>
              <div className="mt-10">
                <h2 className="font-serif text-xl md:text-2xl font-medium mb-4">
                  {s.heading}
                </h2>
                <div className="space-y-4 text-muted leading-relaxed">
                  {s.paras.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}

          {/* Details */}
          <Reveal>
            <div className="mt-12 pt-8 border-t border-border grid grid-cols-2 gap-8">
              <div>
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-muted block mb-2">
                  Approach
                </span>
                <p className="font-medium">Trauma-informed &middot; Integrative</p>
              </div>
              <div>
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-muted block mb-2">
                  Sessions
                </span>
                <p className="font-medium">Online &middot; Bengaluru-based</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
