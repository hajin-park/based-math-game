import * as React from "react";

import { cn } from "@/lib/utils";

type Tone = "primary" | "neutral" | "success" | "warning" | "destructive";

const toneBg: Record<Tone, string> = {
  primary: "bg-primary",
  neutral: "bg-foreground/70",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

export interface MeterProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  value: number;
  max?: number;
  /**
   * progress: neutral fill. timer: drains, turns warning ≤25% and
   * destructive ≤10%. lives: discrete pips (value of max).
   */
  variant?: "progress" | "timer" | "lives";
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  /** Accessible name, e.g. "Time remaining". Required. */
  label: string;
  /** Spoken value, e.g. "12 seconds". Defaults to "value of max". */
  valueText?: string;
  /** Render the label and value above the bar. */
  showLabel?: boolean;
  /** Visible value text when showLabel (defaults to value/max). */
  display?: React.ReactNode;
}

const heights = { sm: "h-1", md: "h-1.5", lg: "h-2.5" };

/**
 * Meter — timer / progress / lives. The fill animates via transform only and
 * is instant under prefers-reduced-motion (global rule).
 *
 *   <Meter variant="timer" value={secondsLeft} max={60} label="Time left" />
 *   <Meter variant="lives" value={2} max={3} label="Lives" />
 */
const Meter = React.forwardRef<HTMLDivElement, MeterProps>(
  (
    {
      value,
      max = 100,
      variant = "progress",
      tone,
      size = "md",
      label,
      valueText,
      showLabel,
      display,
      className,
      ...props
    },
    ref,
  ) => {
    const clamped = Math.min(Math.max(value, 0), max);
    const ratio = max > 0 ? clamped / max : 0;
    const resolvedTone: Tone =
      tone ??
      (variant === "timer"
        ? ratio <= 0.1
          ? "destructive"
          : ratio <= 0.25
            ? "warning"
            : "neutral"
        : variant === "lives"
          ? "primary"
          : "primary");

    const header = showLabel && (
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[0.75rem]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums text-foreground">
          {display ?? `${clamped}/${max}`}
        </span>
      </div>
    );

    if (variant === "lives") {
      return (
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {header}
          <div
            role="meter"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={clamped}
            aria-valuetext={valueText ?? `${clamped} of ${max}`}
            className="flex gap-1"
          >
            {Array.from({ length: max }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "flex-1 rounded-full transition-colors duration-base",
                  heights[size],
                  i < clamped ? toneBg[resolvedTone] : "bg-foreground/[0.08]",
                )}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {header}
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={clamped}
          aria-valuetext={valueText ?? `${clamped} of ${max}`}
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-foreground/[0.08]",
            heights[size],
          )}
        >
          <div
            className={cn(
              "absolute inset-0 origin-left rounded-full transition-[transform,background-color] ease-linear",
              variant === "timer" ? "duration-1000" : "duration-slow ease-out",
              toneBg[resolvedTone],
            )}
            style={{ transform: `scaleX(${ratio})` }}
          />
        </div>
      </div>
    );
  },
);
Meter.displayName = "Meter";

export { Meter };
