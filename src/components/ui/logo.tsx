import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Logomark — a blue workbook with "10₂" (ten, read in base two) printed on
 * the cover. Same geometry as public/icon.svg (scripts/generate-icons.mjs).
 */
export function Logomark({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      focusable="false"
      className={cn("size-7 shrink-0", className)}
      {...props}
    >
      <rect
        width="64"
        height="64"
        rx="4"
        className="fill-cover dark:fill-foreground"
      />
      <rect
        width="9"
        height="64"
        rx="2"
        className="fill-cover-deep dark:fill-foreground/60"
      />
      <g
        fill="none"
        className="stroke-cover-foreground dark:stroke-background"
        strokeLinecap="square"
        transform="translate(-1.75 -0.5)"
      >
        <path d="M16.5 22 L23 17.5 V46.5" strokeWidth="5" />
        <rect
          x="31.5"
          y="17.5"
          width="13"
          height="29"
          rx="6.5"
          strokeWidth="5"
        />
        <path
          d="M35.9 37.4 L40.1 26.6"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        <path
          d="M51.6 40.4 C51.6 37.9 53.3 36.6 55.3 36.6 C57.4 36.6 59 37.9 59 40 C59 41.9 57.9 43.2 56.3 44.7 L52 48.9 H59.6"
          strokeWidth="3.2"
          strokeLinecap="butt"
        />
      </g>
    </svg>
  );
}

/** Logomark + the title as it is printed on the cover. */
export function Wordmark({
  className,
  compact,
}: {
  className?: string;
  /** Hide the words below `xs` (mark only). */
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Logomark className="size-7" />
      <span
        className={cn(
          "font-serif text-[1.25rem] font-bold leading-none tracking-[-0.01em] text-foreground",
          compact && "sr-only xs:not-sr-only",
        )}
      >
        Based Math
      </span>
    </span>
  );
}
