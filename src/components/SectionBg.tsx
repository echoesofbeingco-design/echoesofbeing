/**
 * A decorative background layer (sage/warm mesh gradient + film grain) that
 * sits behind a section's content. Place inside a `relative isolate` section.
 */
export default function SectionBg({
  variant = "sage",
  className = "",
}: {
  variant?: "sage" | "warm";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 grain ${
        variant === "sage" ? "mesh-sage" : "mesh-warm"
      } ${className}`}
    />
  );
}
