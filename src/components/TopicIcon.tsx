/**
 * Minimalist line-art icons for community topics.
 * Designed to match the calm sage/forest aesthetic.
 */
export default function TopicIcon({
  icon,
  className = "w-4 h-4",
}: {
  icon: string;
  className?: string;
}) {
  const props = {
    className,
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (icon) {
    case "chat":
      return (
        <svg {...props}>
          <path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
        </svg>
      );

    case "waves":
      return (
        <svg {...props}>
          <path d="M3 8c2.5-3 5-3 7.5 0s5 3 7.5 0M3 16c2.5-3 5-3 7.5 0s5 3 7.5 0" />
        </svg>
      );

    case "cloud":
      return (
        <svg {...props}>
          <path d="M6.5 19a4.5 4.5 0 01-.42-8.98 7 7 0 0113.84 0A4.5 4.5 0 0119.5 19h-13z" />
        </svg>
      );

    case "link":
      return (
        <svg {...props}>
          <path d="M15 12a6 6 0 01-6 6H7a6 6 0 010-12h1M9 12a6 6 0 016-6h2a6 6 0 010 12h-1" />
        </svg>
      );

    case "seedling":
      return (
        <svg {...props}>
          <path d="M12 21V12M12 12C12 8 8 4 4 4c0 4 4 8 8 8zM12 12c0-4 4-8 8-8-4 0-8 4-8 8z" />
        </svg>
      );

    case "bird":
      return (
        <svg {...props}>
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1" />
          <path d="M3 20l2-4M21 20l-2-4" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      );

    case "butterfly":
      return (
        <svg {...props}>
          <path d="M12 21V12M12 12C9 12 4 10 4 6s4-2 8 6zM12 12c3 0 8-2 8-6s-4-2-8 6z" />
        </svg>
      );

    case "flower":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 5a3 3 0 00-3 3 3 3 0 003 3M12 5a3 3 0 013 3 3 3 0 01-3 3M12 19a3 3 0 01-3-3 3 3 0 013-3M12 19a3 3 0 003-3 3 3 0 00-3-3M5 12a3 3 0 013-3 3 3 0 013 3M5 12a3 3 0 003 3 3 3 0 003-3M19 12a3 3 0 00-3-3 3 3 0 00-3 3M19 12a3 3 0 01-3 3 3 3 0 01-3-3" />
        </svg>
      );

    case "sun":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );

    case "star":
      return (
        <svg {...props}>
          <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4 5.6 21.2 8 14 2 9.2h7.6L12 2z" />
        </svg>
      );

    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
