import * as React from "react";

import { cn } from "@/lib/utils";
import { bitAt } from "./lessons";

export type BitRow =
  | {
      kind: "bits";
      /** Row label, e.g. "A". Also used in accessible names. */
      label: string;
      /** Longer accessible name for the row (defaults to label). */
      name?: string;
      value: number;
      /** Makes each bit a toggle button. */
      onToggle?: (position: number) => void;
      /** Visual emphasis for result rows. */
      tone?: "default" | "result";
      /** Highlight specific bit positions (e.g. bits that changed). */
      highlight?: (position: number) => boolean;
    }
  | {
      kind: "weights";
      label?: string;
      /** Text for each position (index = bit position). */
      text: (position: number) => React.ReactNode;
    }
  | {
      kind: "carry";
      label?: string;
      /** Carry into each column (index = bit position). */
      carries: (0 | 1)[];
    }
  | { kind: "rule"; label?: string };

/**
 * BitMatrix — rows of bits aligned in columns, split into nibble blocks. Two
 * blocks sit side by side from `sm` up and stack on phones, which keeps every
 * bit toggle at least 44px wide down to 320px screens.
 */
export function BitMatrix({
  bits,
  rows,
  className,
  caption,
}: {
  bits: number;
  rows: BitRow[];
  className?: string;
  caption?: string;
}) {
  const blocks = Math.ceil(bits / 4);
  return (
    <div
      role="group"
      aria-label={caption}
      className={cn("flex flex-wrap gap-x-3 gap-y-4", className)}
    >
      {Array.from({ length: blocks }, (_, block) => {
        // Block 0 holds the most significant nibble.
        const high = bits - 1 - block * 4;
        const positions = Array.from({ length: 4 }, (_, i) => high - i).filter(
          (p) => p >= 0,
        );
        return (
          <div
            key={block}
            className={cn(
              "grid items-center gap-x-1 gap-y-1",
              block === 0
                ? "grid-cols-[2.25rem_repeat(4,2.75rem)]"
                : "grid-cols-[2.25rem_repeat(4,2.75rem)] sm:grid-cols-[repeat(4,2.75rem)]",
            )}
          >
            {rows.map((row, ri) => (
              <React.Fragment key={ri}>
                <span
                  aria-hidden
                  className={cn(
                    "pr-1 text-right font-mono text-[0.75rem] text-muted-foreground",
                    block > 0 && "sm:hidden",
                  )}
                >
                  {row.label}
                </span>
                {positions.map((p) => (
                  <Cell key={p} row={row} position={p} />
                ))}
              </React.Fragment>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Cell({ row, position }: { row: BitRow; position: number }) {
  if (row.kind === "rule") {
    return <span aria-hidden className="h-px bg-border-strong" />;
  }
  if (row.kind === "weights") {
    return (
      <span
        aria-hidden
        className="flex h-4 items-end justify-center font-mono text-[0.6875rem] leading-none text-muted-foreground"
      >
        {row.text(position)}
      </span>
    );
  }
  if (row.kind === "carry") {
    const c = row.carries[position];
    return (
      <span
        aria-hidden
        className="h-4 text-center font-mono text-[0.75rem] leading-4 text-foreground"
      >
        {c ? "1" : ""}
      </span>
    );
  }
  const bit = bitAt(row.value, position);
  const on = bit === 1;
  const highlighted = row.highlight?.(position);
  const box = cn(
    "flex h-12 w-11 items-center justify-center rounded-md border font-mono text-[1.25rem] font-medium tabular-nums transition-[background-color,border-color,color] duration-fast",
    on
      ? "border-base-bin/35 bg-base-bin/10 text-base-bin"
      : "border-border bg-card text-muted-foreground",
    row.tone === "result" && "border-dashed",
    highlighted && "ring-2 ring-highlight/70 ring-offset-1 ring-offset-card",
  );
  if (row.onToggle) {
    const toggle = row.onToggle;
    return (
      <button
        type="button"
        aria-pressed={on}
        aria-label={`${row.name ?? row.label}, bit ${position}`}
        onClick={() => toggle(position)}
        className={cn(box, "hover:border-base-bin/50 active:translate-y-px")}
      >
        {bit}
      </button>
    );
  }
  return (
    <span aria-hidden className={box}>
      {bit}
    </span>
  );
}
