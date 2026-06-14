/**
 * A delicate, static decorative flourish rendered as a soft ribbon — two
 * looping lines with layered widths (wide soft band + crisp core) and a
 * gradient that fades in and out across its length, so it's strongest in the
 * centre (where the numeral sits) and dissolves toward the edges. Purely
 * ornamental and static, so it never fights smooth scrolling.
 */
export default function FlowDecor({ className = "" }: { className?: string }) {
  const d1 =
    "M-40,300 C150,300 250,120 400,120 C540,120 560,300 420,320 C320,335 320,210 430,205 C600,196 760,300 960,300 C1180,300 1280,230 1500,275";
  const d2 =
    "M-40,274 C150,274 250,96 402,96 C542,96 560,276 422,296 C326,310 326,186 432,181 C600,172 760,276 960,276 C1180,276 1280,206 1500,250";

  const stop = (offset: string, opacity: number, strong = false) => (
    <stop
      offset={offset}
      style={{
        stopColor: strong
          ? "var(--color-sage-500)"
          : "var(--color-sage-400)",
        stopOpacity: opacity,
      }}
    />
  );

  return (
    <svg
      aria-hidden
      viewBox="0 0 1460 420"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      className={`pointer-events-none ${className}`}
    >
      <defs>
        <linearGradient id="flowdecor-grad" x1="0" y1="0" x2="1" y2="0">
          {stop("0%", 0)}
          {stop("22%", 0.45)}
          {stop("50%", 0.8, true)}
          {stop("78%", 0.45)}
          {stop("100%", 0)}
        </linearGradient>
      </defs>

      {/* wide soft ribbon (dynamic width) */}
      <path
        d={d1}
        stroke="url(#flowdecor-grad)"
        strokeWidth="6"
        strokeOpacity="0.4"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={d2}
        stroke="url(#flowdecor-grad)"
        strokeWidth="4.5"
        strokeOpacity="0.4"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* crisp cores */}
      <path
        d={d1}
        stroke="url(#flowdecor-grad)"
        strokeWidth="1.3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={d2}
        stroke="url(#flowdecor-grad)"
        strokeWidth="1.1"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
