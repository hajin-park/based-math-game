import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import {
  baseMeta,
  formatInBase,
  groupDigits,
  placeValue,
  type BaseLike,
} from "@/lib/bases";

const digitsVariants = cva(
  "inline-flex items-baseline whitespace-nowrap font-mono font-medium tabular-nums leading-none",
  {
    variants: {
      size: {
        xs: "text-[0.75rem]",
        sm: "text-mono-md",
        md: "text-mono-lg",
        lg: "text-mono-xl",
        xl: "text-mono-2xl",
        inherit: "",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface DigitsProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, "children" | "prefix">,
    VariantProps<typeof digitsVariants> {
  /** Digits already in `base` (string) or an integer to format. */
  value: string | number;
  /** Which base the digits are in. Drives colour, prefix and grouping. */
  base: BaseLike;
  /**
   * Group digits from the right: `true` uses the base default (bin 4,
   * oct 3, dec 3, hex 2); a number sets a custom size; `false` disables.
   */
  group?: boolean | number;
  /** Show the conventional prefix (0b / 0o / 0x) in the muted ink. */
  prefix?: boolean;
  /** Show the place value (weight) of each digit underneath it. */
  placeValues?: boolean;
  /** Colour digits with the base identity colour (default true). */
  colored?: boolean;
  /** Zero-pad to this many digits; leading pad zeros render dimmed. */
  pad?: number;
  /** Use Martian Mono's condensed width — for long binary strings. */
  condensed?: boolean;
  /** Dim leading zeros (default true when `pad` is set). */
  dimLeadingZeros?: boolean;
}

/**
 * Digits — renders a number in a base with instrument-grade typesetting.
 * Copying the text yields the bare digits (grouping is visual only).
 *
 *   <Digits base="bin" value={42} pad={8} group />   → 0010 1010
 *   <Digits base="hex" value="FF" prefix />          → 0xFF
 *   <Digits base={2} value="1011" placeValues />     → 1 0 1 1 / 8 4 2 1
 */
const Digits = React.forwardRef<HTMLSpanElement, DigitsProps>(
  (
    {
      value,
      base,
      group = false,
      prefix = false,
      placeValues = false,
      colored = true,
      pad,
      condensed,
      dimLeadingZeros,
      size,
      className,
      ...props
    },
    ref,
  ) => {
    const meta = baseMeta(base);
    const raw =
      typeof value === "number"
        ? formatInBase(value, meta.key, pad ?? 0)
        : value.toUpperCase().padStart(pad ?? 0, "0");
    const groupSize =
      group === true ? meta.group : typeof group === "number" ? group : 0;
    const groups = groupDigits(raw, groupSize);
    const shouldDim = dimLeadingZeros ?? pad !== undefined;
    const firstSignificant = shouldDim
      ? Math.min(
          raw.search(/[^0]/) === -1 ? raw.length - 1 : raw.search(/[^0]/),
          raw.length - 1,
        )
      : 0;

    let index = 0;
    const groupGap = meta.key === "dec" ? "ml-[0.28ch]" : "ml-[0.45ch]";

    return (
      <span
        ref={ref}
        data-numeric
        className={cn(
          digitsVariants({ size }),
          colored ? meta.text : "text-foreground",
          condensed && "mono-condensed",
          className,
        )}
        {...props}
      >
        {prefix && meta.prefix && (
          <span className="mr-[0.08ch] font-normal text-muted-foreground">
            {meta.prefix}
          </span>
        )}
        <span className="inline-flex items-baseline">
          {groups.map((g, gi) => (
            <span
              key={gi}
              className={cn("inline-flex items-baseline", gi > 0 && groupGap)}
            >
              {g.split("").map((digit) => {
                const i = index++;
                const position = raw.length - 1 - i;
                const dim = i < firstSignificant;
                const pv = placeValues
                  ? placeValue(meta.radix, position)
                  : null;
                return (
                  <span
                    key={i}
                    className={cn(
                      "inline-flex flex-col items-center",
                      dim && "opacity-35",
                    )}
                  >
                    <span>{digit}</span>
                    {pv && (
                      <span
                        aria-hidden
                        className="mt-[0.45em] select-none whitespace-nowrap font-mono text-[max(0.28em,0.5625rem)] font-normal leading-none tracking-tight text-muted-foreground"
                      >
                        {pv.kind === "weight" ? (
                          pv.text
                        ) : (
                          <>
                            {pv.radix}
                            <sup className="text-[0.8em]">{pv.exp}</sup>
                          </>
                        )}
                      </span>
                    )}
                  </span>
                );
              })}
            </span>
          ))}
        </span>
      </span>
    );
  },
);
Digits.displayName = "Digits";

export { Digits, digitsVariants };
