import {
  PortableText as PortableTextReact,
  type PortableTextComponents,
  type PortableTextMarkComponentProps,
  type PortableTextBlockComponent,
} from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import React from "react";

/**
 * Custom "normal" block that preserves empty paragraphs as spacers.
 * Sanity creates an empty block when the user presses Enter for spacing.
 */
const NormalBlock: PortableTextBlockComponent = ({ children, value }) => {
  // Check if the block is truly empty (no text children, or only empty spans)
  const spans = value?.children || [];
  const isEmpty = spans.length === 0 || spans.every(
    (span) => !("text" in span) || !(span as { text?: string }).text
  );

  if (isEmpty) {
    // Preserve the empty line as vertical spacing
    return <div className="h-5" aria-hidden="true" />;
  }

  return (
    <p className="text-base leading-relaxed mb-5 text-forest/90">{children}</p>
  );
};

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-serif text-2xl md:text-3xl font-medium mt-12 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-serif text-xl md:text-2xl font-medium mt-10 mb-3">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-serif text-lg font-medium mt-8 mb-3">
        {children}
      </h4>
    ),
    normal: NormalBlock,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-sage-400 pl-6 py-2 my-8 italic text-muted">
        {children}
      </blockquote>
    ),
  },

  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mb-6 space-y-2 text-forest/90">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mb-6 space-y-2 text-forest/90">
        {children}
      </ol>
    ),
  },

  listItem: {
    bullet: ({ children }) => (
      <li className="text-base leading-relaxed">{children}</li>
    ),
    number: ({ children }) => (
      <li className="text-base leading-relaxed">{children}</li>
    ),
  },

  // ── Hard break (Shift+Enter) → <br> ─────────────────────────────────────
  // This is critical: without it, line breaks inside a paragraph are swallowed.
  hardBreak: () => <br />,

  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-forest">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    underline: ({ children }) => (
      <span className="underline decoration-sage-400 underline-offset-4">
        {children}
      </span>
    ),
    link: ({
      children,
      value,
    }: PortableTextMarkComponentProps<{
      _type: "link";
      _key: string;
      href?: string;
      blank?: boolean;
    }>) => {
      const target = value?.blank ? "_blank" : undefined;
      const rel = value?.blank ? "noopener noreferrer" : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={rel}
          className="text-sage-600 hover:text-sage-700 underline decoration-sage-300 underline-offset-4 transition-colors duration-200"
        >
          {children}
        </a>
      );
    },
  },

  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-8">
          <div className="rounded-xl overflow-hidden">
            <Image
              src={urlFor(value).width(900).quality(85).url()}
              alt={value.alt || "Blog image"}
              width={900}
              height={500}
              className="w-full h-auto object-cover"
            />
          </div>
          {value.caption && (
            <figcaption className="text-center text-sm text-muted mt-3 italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },

    callout: ({ value }) => {
      const styleMap: Record<
        string,
        { border: string; bg: string }
      > = {
        reflection: {
          border: "border-sage-400",
          bg: "bg-secondary-bg/40",
        },
        insight: {
          border: "border-sage-500",
          bg: "bg-accent-bg/60",
        },
        note: {
          border: "border-border",
          bg: "bg-cream-light",
        },
      };
      const s = styleMap[value.style] || styleMap.reflection;

      // Split text by newlines to preserve line breaks in callout
      const lines = (value.text as string).split("\n");

      return (
        <aside
          className={`my-8 rounded-xl border-l-4 ${s.border} ${s.bg} px-6 py-5`}
        >
          <p className="text-base leading-relaxed italic text-forest/80">
            {lines.map((line: string, i: number) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </p>
        </aside>
      );
    },
  },
};

export default function PortableText({ value }: { value: unknown[] }) {
  return <PortableTextReact value={value} components={components} />;
}
