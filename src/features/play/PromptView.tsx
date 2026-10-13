import { memo, type ReactNode } from "react";

import { BaseTag } from "@/components/ui/base-tag";
import { Digits } from "@/components/ui/digits";
import type { PromptPart } from "@/game";
import { cn } from "@/lib/utils";
import { baseTagKey } from "./describe";

export interface PromptViewProps {
  prompt: PromptPart[];
  /** Group digits (nibbles / bytes / thousands). */
  grouped: boolean;
  /** Show the weight of each digit under it. */
  placeValues: boolean;
  /** Visual size: xl on the game surface, sm in review lists. */
  size?: "xl" | "lg" | "sm";
  /**
   * Horizontal alignment (default "center"). The exercise page sets
   * "start": the problem is typeset flush with its number in the margin.
   */
  align?: "center" | "start";
  className?: string;
}

/** Long values switch to the condensed cut so 16-bit binary fits a phone. */
function isLong(digits: string, size: PromptViewProps["size"]) {
  return size === "sm" ? digits.length > 16 : digits.length > 8;
}

/** Operators that are worked in columns, like a sum on paper. */
const COLUMN_OPS = new Set(["+", "AND", "OR", "XOR"]);

function isColumnSum(prompt: PromptPart[]) {
  return (
    prompt.length === 3 &&
    prompt[0].type === "number" &&
    prompt[1].type === "op" &&
    COLUMN_OPS.has(prompt[1].text) &&
    prompt[2].type === "number"
  );
}

/**
 * PromptView renders an engine prompt (`PromptPart[]`) the way a textbook
 * typesets an exercise: numbers in typewriter, in their base ink, labelled
 * with a BaseTag; sums and bitwise operations of two operands set in
 * columns over a rule; colour swatches and ASCII characters in a ruled box.
 * It is purely visual: the caller supplies the accessible name (see
 * `questionLabel`).
 */
export const PromptView = memo(function PromptView({
  prompt,
  grouped,
  placeValues,
  size = "xl",
  align = "center",
  className,
}: PromptViewProps) {
  const small = size === "sm";

  if (!small && isColumnSum(prompt)) {
    return (
      <ColumnSum
        prompt={prompt}
        grouped={grouped}
        placeValues={placeValues}
        size={size}
        align={align}
        className={className}
      />
    );
  }

  const numbers = prompt.filter((p) => p.type === "number");
  // A lone decimal number is a conversion source: tag it. Decimals inside an
  // expression (exponents, shift counts, "8-bit") are plain counts.
  const tagDecimal = prompt.length === 1;
  const lone = prompt.length === 1;
  const out: ReactNode[] = [];

  for (let i = 0; i < prompt.length; i++) {
    const part = prompt[i];
    const next = prompt[i + 1];

    // "2^" + exponent renders as a real power: 2 with a raised exponent.
    if (part.type === "op" && part.text === "2^" && next) {
      const exp =
        next.type === "number"
          ? next.digits
          : next.type === "text"
            ? next.text
            : "";
      out.push(
        <span
          key={i}
          className={cn(
            "inline-flex items-start font-mono font-medium leading-none text-base-dec",
            small
              ? "text-mono-md"
              : size === "lg"
                ? "text-mono-xl"
                : "text-mono-3xl",
          )}
        >
          2
          <span
            className={cn(
              "ml-[0.06em] text-[0.5em] leading-none",
              next.type === "text" ? "font-serif italic text-foreground" : "",
            )}
          >
            {exp}
          </span>
        </span>,
      );
      i++;
      continue;
    }

    switch (part.type) {
      case "number": {
        const showTag = part.base !== 10 || tagDecimal;
        const key = baseTagKey(part.base);
        const long = isLong(part.digits, size);
        // The given number of a conversion is the largest thing on the page.
        const hero = !small && size === "xl" && lone && !long;
        const tag = showTag && (
          <BaseTag
            base={key}
            size={small ? "xs" : "sm"}
            variant={small ? "outline" : "soft"}
            aria-hidden
          />
        );
        out.push(
          <span
            key={i}
            className={cn(
              "inline-flex max-w-full",
              small ? "items-center gap-1.5" : "items-baseline gap-2.5",
            )}
          >
            {small && tag}
            <Digits
              base={key}
              value={part.digits}
              size={
                hero
                  ? "inherit"
                  : numbers.length > 1 && size === "xl"
                    ? "lg"
                    : size === "xl"
                      ? "xl"
                      : size
              }
              group={grouped}
              placeValues={placeValues && part.base !== 10 && !small}
              condensed={long}
              className={cn("max-w-full", hero && "text-mono-3xl")}
            />
            {!small && tag}
          </span>,
        );
        break;
      }
      case "op":
        out.push(
          <span
            key={i}
            className={cn(
              "font-mono font-medium text-muted-foreground",
              small ? "text-mono-sm" : "text-mono-lg",
              !small && numbers.length > 1 && "self-center",
            )}
          >
            {part.text}
          </span>,
        );
        break;
      case "text":
        out.push(
          <span
            key={i}
            className={cn(
              "font-serif italic text-foreground/80",
              small ? "text-body-sm" : "text-body-lg",
            )}
          >
            {part.text}
          </span>,
        );
        break;
      case "swatch":
        out.push(
          <span key={i} className="inline-flex items-center gap-3">
            <span
              aria-hidden
              className={cn(
                "inline-block rounded-sm ring-1 ring-inset ring-foreground/25",
                small ? "size-5" : "size-14 sm:size-16",
              )}
              style={{ backgroundColor: part.hex }}
            />
            <span className="inline-flex items-baseline gap-2.5">
              <span className="inline-flex items-baseline">
                <span
                  className={cn(
                    "font-mono text-muted-foreground",
                    small ? "text-mono-md" : "text-mono-xl",
                  )}
                >
                  #
                </span>
                <Digits
                  base="hex"
                  value={part.hex.replace(/^#/, "")}
                  group={2}
                  size={small ? "sm" : "lg"}
                />
              </span>
              {!small && <BaseTag base="hex" size="sm" aria-hidden />}
            </span>
          </span>,
        );
        break;
      case "char":
        out.push(
          <span
            key={i}
            className={cn(
              "inline-flex items-baseline",
              small ? "gap-1.5" : "gap-2.5",
            )}
          >
            <span
              className={cn(
                "inline-grid place-items-center rounded-sm border bg-card font-mono font-medium text-foreground",
                small
                  ? "h-7 min-w-7 border-border-strong px-1.5 text-mono-md"
                  : "h-20 min-w-20 border-foreground/50 px-3 text-mono-3xl sm:h-24 sm:min-w-24",
              )}
            >
              {part.char === " " ? (
                <span className="font-serif text-[0.32em] italic text-muted-foreground">
                  space
                </span>
              ) : (
                part.char
              )}
            </span>
            {!small && (
              <span className="smallcaps" aria-hidden>
                ASCII
              </span>
            )}
          </span>,
        );
        break;
    }
  }

  return (
    <div
      className={cn(
        "flex max-w-full flex-wrap items-center",
        align === "start" ? "justify-start" : "justify-center",
        small ? "gap-x-2 gap-y-1" : "gap-x-4 gap-y-3",
        className,
      )}
    >
      {out}
    </div>
  );
});

/** Two operands worked in columns over a rule, the operator in front. */
function ColumnSum({
  prompt,
  grouped,
  placeValues,
  size,
  align,
  className,
}: Omit<PromptViewProps, "prompt" | "size"> & {
  prompt: PromptPart[];
  size: "xl" | "lg";
}) {
  const [a, op, b] = prompt as [
    Extract<PromptPart, { type: "number" }>,
    Extract<PromptPart, { type: "op" }>,
    Extract<PromptPart, { type: "number" }>,
  ];
  const long = Math.max(a.digits.length, b.digits.length) > 12;
  const digitSize = size === "lg" || long ? "lg" : "xl";
  const row = (part: typeof a, weights: boolean) => (
    <>
      <Digits
        base={baseTagKey(part.base)}
        value={part.digits}
        size={digitSize}
        group={grouped}
        placeValues={weights && placeValues && part.base !== 10}
        condensed={long}
        className="justify-self-end"
      />
      {part.base !== 10 ? (
        <BaseTag
          base={baseTagKey(part.base)}
          size="sm"
          aria-hidden
          className="self-baseline"
        />
      ) : (
        <span />
      )}
    </>
  );
  return (
    <div
      className={cn(
        "flex max-w-full",
        align === "start" ? "justify-start" : "justify-center",
        className,
      )}
    >
      <div className="inline-grid max-w-full grid-cols-[auto_auto_auto] items-baseline gap-x-3 gap-y-2 sm:gap-x-4">
        <span />
        {row(a, false)}
        <span className="justify-self-end font-mono text-mono-lg font-medium text-muted-foreground">
          {op.text}
        </span>
        {row(b, true)}
        <span
          aria-hidden
          className="col-span-2 -mt-1 h-0 border-t-2 border-foreground/80"
        />
      </div>
    </div>
  );
}
