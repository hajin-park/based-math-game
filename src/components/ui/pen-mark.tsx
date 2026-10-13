import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Pen marks — the teacher's red pen (red chalk on the chalkboard). Hand-set
 * strokes drawn once with stroke-dashoffset; under reduced motion they simply
 * appear. Marks are permanent: they never animate away.
 *
 *   <PenTick />                         a tick beside a correct answer
 *   <PenCross />                        a cross beside a skipped one
 *   <PenCircle>27</PenCircle>           a circled score
 *   <PenUnderline>personal best</PenUnderline>
 *
 * Marks are decorative (aria-hidden); always pair them with text that says
 * the same thing for screen readers.
 */

type MarkProps = React.SVGProps<SVGSVGElement> & {
  /** Draw the stroke on mount (default true). */
  animate?: boolean;
  /** Delay before the stroke starts, in ms. */
  delay?: number;
};

const strokeBase =
  "fill-none stroke-pen [stroke-dasharray:1] [stroke-linecap:round] [stroke-linejoin:round]";

function drawStyle(animate: boolean, delay: number, duration?: number) {
  return animate
    ? ({
        strokeDashoffset: 1,
        animation: `pen-draw ${duration ?? 320}ms cubic-bezier(0.65,0,0.35,1) ${delay}ms both`,
      } as React.CSSProperties)
    : ({ strokeDashoffset: 0 } as React.CSSProperties);
}

export function PenTick({
  className,
  animate = true,
  delay = 0,
  ...props
}: MarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      focusable="false"
      className={cn("size-6 shrink-0 overflow-visible", className)}
      {...props}
    >
      <path
        d="M5.5 17.2c2.1 1.6 4.2 3.9 6 6.6 3.6-7.4 8.4-13.6 15-18.6"
        pathLength={1}
        strokeWidth={3}
        className={strokeBase}
        style={drawStyle(animate, delay, 260)}
      />
    </svg>
  );
}

export function PenCross({
  className,
  animate = true,
  delay = 0,
  ...props
}: MarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      focusable="false"
      className={cn("size-6 shrink-0 overflow-visible", className)}
      {...props}
    >
      <path
        d="M7.5 7.8c5.4 5 11 10.6 16.6 16.9"
        pathLength={1}
        strokeWidth={3}
        className={strokeBase}
        style={drawStyle(animate, delay, 180)}
      />
      <path
        d="M24.6 7.2C18.4 12.4 13 18.3 7.4 25"
        pathLength={1}
        strokeWidth={3}
        className={strokeBase}
        style={drawStyle(animate, delay + 160, 180)}
      />
    </svg>
  );
}

/** Circles its children like a mark at the top of a returned test. */
export function PenCircle({
  children,
  className,
  animate = true,
  delay = 0,
  strokeWidth = 2.4,
}: {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
  strokeWidth?: number;
}) {
  return (
    <span className={cn("relative inline-grid place-items-center", className)}>
      <span className="relative z-[1] px-[0.32em]">{children}</span>
      <svg
        viewBox="0 0 120 80"
        preserveAspectRatio="none"
        aria-hidden
        focusable="false"
        className="pointer-events-none absolute -inset-x-[14%] -inset-y-[22%] h-[144%] w-[128%] overflow-visible"
      >
        <path
          d="M64 9C35 6.5 9.5 17 7.6 39.5 5.8 61 33 73.5 63 72.5 92 71.6 114.5 58 112.6 37 110.9 18.4 86 7.3 58.6 8.9 46 9.7 37.4 12.6 31 16.8"
          pathLength={1}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
          className={strokeBase}
          style={drawStyle(animate, delay, 560)}
        />
      </svg>
    </span>
  );
}

/** A quick underline stroke beneath inline text. */
export function PenUnderline({
  children,
  className,
  animate = true,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
}) {
  return (
    <span className={cn("relative inline-block", className)}>
      {children}
      <svg
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
        aria-hidden
        focusable="false"
        className="pointer-events-none absolute -bottom-[0.28em] left-[-2%] h-[0.42em] w-[104%] overflow-visible"
      >
        <path
          d="M2 5.2C24 3.4 52 2.6 98 3.6"
          pathLength={1}
          strokeWidth={2.2}
          vectorEffect="non-scaling-stroke"
          className={strokeBase}
          style={drawStyle(animate, delay, 300)}
        />
      </svg>
    </span>
  );
}
