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
  className?: string;
}

const DIGIT_SIZE = { xl: "xl", lg: "lg", sm: "sm" } as const;

/** Long values switch to condensed Martian Mono so 16-bit binary fits a phone. */
function isLong(digits: string, size: PromptViewProps["size"]) {
  return size === "sm" ? digits.length > 16 : digits.length > 8;
}

/**
 * PromptView renders an engine prompt (`PromptPart[]`): numbers in their base
 * colour with a BaseTag, operators dimmed, colour swatches and ASCII
 * characters in a box. It is purely visual: the caller supplies the
 * accessible name (see `questionLabel`).
 */
export const PromptView = memo(function PromptView({
  prompt,
  grouped,
  placeValues,
  size = "xl",
  className,
}: PromptViewProps) {
  const numbers = prompt.filter((p) => p.type === "number");
  // A lone decimal number is a conversion source: tag it. Decimals inside an
  // expression (exponents, shift counts, "8-bit") are plain counts.
  const tagDecimal = prompt.length === 1;
  const small = size === "sm";
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
            "inline-flex items-start font-mono font-medium text-base-dec",
            small
              ? "text-mono-md"
              : size === "lg"
                ? "text-mono-xl"
                : "text-mono-2xl",
          )}
        >
          2
          <span
            className={cn(
              "ml-[0.06em] text-[0.55em] leading-none",
              next.type === "text" ? "italic text-primary" : "",
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
        out.push(
          <span
            key={i}
            className={cn(
              "inline-flex items-center",
              small ? "gap-1.5" : "flex-col gap-1.5",
            )}
          >
            {showTag && (
              <BaseTag
                base={baseTagKey(part.base)}
                size={small ? "xs" : "sm"}
                variant={small ? "outline" : "soft"}
                aria-hidden
              />
            )}
            <Digits
              base={baseTagKey(part.base)}
              value={part.digits}
              size={
                numbers.length > 1 && size === "xl" ? "lg" : DIGIT_SIZE[size]
              }
              group={grouped}
              placeValues={placeValues && part.base !== 10 && !small}
              condensed={isLong(part.digits, size)}
              className="max-w-full"
            />
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
              !small && numbers.length > 1 && "self-end pb-[0.35em]",
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
              "text-muted-foreground",
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
                "inline-block rounded-md shadow-xs ring-1 ring-inset ring-foreground/15",
                small ? "size-5" : "size-12 sm:size-14",
              )}
              style={{ backgroundColor: part.hex }}
            />
            <span className="inline-flex flex-col items-start gap-1.5">
              {!small && <BaseTag base="hex" size="sm" aria-hidden />}
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
            </span>
          </span>,
        );
        break;
      case "char":
        out.push(
          <span key={i} className="inline-flex flex-col items-center gap-1.5">
            {!small && (
              <span className="eyebrow text-[0.625rem]" aria-hidden>
                ASCII
              </span>
            )}
            <span
              className={cn(
                "inline-grid place-items-center rounded-md border border-border-strong bg-card font-mono font-medium text-foreground shadow-xs",
                small
                  ? "h-7 min-w-7 px-1.5 text-mono-md"
                  : "h-16 min-w-16 px-3 text-mono-2xl sm:h-20 sm:min-w-20",
              )}
            >
              {part.char === " " ? (
                <span className="text-[0.4em] uppercase tracking-[0.08em] text-muted-foreground">
                  space
                </span>
              ) : (
                part.char
              )}
            </span>
          </span>,
        );
        break;
    }
  }

  return (
    <div
      className={cn(
        "flex max-w-full flex-wrap items-center justify-center",
        small ? "gap-x-2 gap-y-1" : "gap-x-4 gap-y-3",
        className,
      )}
    >
      {out}
    </div>
  );
});
