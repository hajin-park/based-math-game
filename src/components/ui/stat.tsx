import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

const statValueVariants = cva(
  "font-mono font-medium tabular-nums leading-none tracking-[-0.02em] text-foreground",
  {
    variants: {
      size: {
        sm: "text-[1.25rem]",
        md: "text-[1.75rem]",
        lg: "text-[clamp(2rem,1.5rem+2vw,2.75rem)]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface StatProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof statValueVariants> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Small unit after the value, e.g. "s", "/min", "%". */
  unit?: React.ReactNode;
  /** Signed change vs. a previous value. Positive = up. */
  delta?: number;
  /** Format for the delta (default: signed integer or 1-dp). */
  formatDelta?: (delta: number) => string;
  /** Text after the delta, e.g. "vs last week". */
  deltaLabel?: React.ReactNode;
  /** Set when a lower number is better (time, misses). Flips delta colour. */
  lowerIsBetter?: boolean;
  /** Extra line under the value. */
  hint?: React.ReactNode;
  /** Optional icon or BaseTag shown beside the label. */
  adornment?: React.ReactNode;
}

const defaultFormat = (d: number) => {
  const abs = Math.abs(d);
  const text = Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
  return `${d > 0 ? "+" : d < 0 ? "−" : "±"}${text}`;
};

/**
 * Stat — label + big tabular number + optional delta.
 *
 *   <Stat label="Best score" value={42} delta={+6} deltaLabel="this week" />
 *   <Stat label="Avg. time" value="2.4" unit="s" delta={-0.3} lowerIsBetter />
 */
const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  (
    {
      label,
      value,
      unit,
      delta,
      formatDelta = defaultFormat,
      deltaLabel,
      lowerIsBetter,
      hint,
      adornment,
      size,
      className,
      ...props
    },
    ref,
  ) => {
    const good =
      delta === undefined || delta === 0
        ? null
        : lowerIsBetter
          ? delta < 0
          : delta > 0;
    const DeltaIcon =
      delta === undefined || delta === 0
        ? Minus
        : delta > 0
          ? ArrowUpRight
          : ArrowDownRight;

    return (
      <div
        ref={ref}
        className={cn("flex min-w-0 flex-col gap-2", className)}
        {...props}
      >
        <div className="flex items-center gap-2 text-label text-muted-foreground">
          {adornment}
          <span className="truncate">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={statValueVariants({ size })}>{value}</span>
          {unit && (
            <span className="font-mono text-[0.8125rem] text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        {(delta !== undefined || hint) && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem]">
            {delta !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-mono tabular-nums",
                  good === null
                    ? "text-muted-foreground"
                    : good
                      ? "text-success"
                      : "text-destructive",
                )}
              >
                <DeltaIcon className="size-3.5" aria-hidden />
                {formatDelta(delta)}
                <span className="sr-only">
                  {good === null
                    ? "(no change)"
                    : good
                      ? "(better)"
                      : "(worse)"}
                </span>
              </span>
            )}
            {deltaLabel && (
              <span className="text-muted-foreground">{deltaLabel}</span>
            )}
            {hint && <span className="text-muted-foreground">{hint}</span>}
          </div>
        )}
      </div>
    );
  },
);
Stat.displayName = "Stat";

export { Stat, statValueVariants };
