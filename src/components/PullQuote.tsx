import Reveal from "./Reveal";
import SectionBg from "./SectionBg";
import FlowLine from "./FlowLine";

/** Full-bleed pull-quote section: large serif quote over a graded sage background. */
export default function PullQuote({
  quote,
  attribution,
}: {
  quote: string;
  attribution?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden py-28 md:py-40">
      <SectionBg variant="sage" />
      <FlowLine className="absolute left-0 top-1/2 h-56 w-full -translate-y-1/2 opacity-70" />
      <Reveal className="relative max-w-4xl mx-auto px-6 text-center">
        <span className="font-serif text-6xl text-sage-400/50 leading-none block mb-2">
          &ldquo;
        </span>
        <p className="display text-3xl md:text-4xl lg:text-[2.75rem] text-forest/90">
          {quote}
        </p>
        {attribution && (
          <p className="mt-8 text-xs font-semibold tracking-[0.2em] uppercase text-muted">
            {attribution}
          </p>
        )}
      </Reveal>
    </section>
  );
}
