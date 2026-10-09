import * as React from "react";
import { m } from "framer-motion";

import { useReducedMotion } from "@/lib/useReducedMotion";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  /** Accessible name when `label` is an icon. */
  ariaLabel?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Required: names the group for assistive tech. */
  "aria-label": string;
  size?: "sm" | "md" | "lg";
  /** Stretch segments to fill the container. */
  fullWidth?: boolean;
  className?: string;
  /** Unique id for the sliding indicator when several are on one page. */
  id?: string;
}

const sizes = {
  sm: "h-8 text-[0.75rem] px-2.5",
  md: "h-9 text-label px-3",
  lg: "h-11 text-[0.9375rem] px-4",
};

/**
 * Segmented — a single-choice control (radiogroup). Arrow keys move and
 * select, Home/End jump; one tab stop for the whole group.
 *
 *   <Segmented aria-label="Duration" value={d} onValueChange={setD}
 *     options={[{value:"15",label:"15s"},{value:"30",label:"30s"}]} />
 */
function Segmented<T extends string = string>({
  options,
  value,
  onValueChange,
  size = "md",
  fullWidth,
  className,
  id,
  ...aria
}: SegmentedProps<T>) {
  const reduce = useReducedMotion();
  const autoId = React.useId();
  const layoutId = `segmented-${id ?? autoId}`;
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const enabled = options
    .map((o, i) => ({ o, i }))
    .filter(({ o }) => !o.disabled);

  const move = (from: number, dir: 1 | -1 | "start" | "end") => {
    if (!enabled.length) return;
    let target: number;
    if (dir === "start") target = enabled[0].i;
    else if (dir === "end") target = enabled[enabled.length - 1].i;
    else {
      const pos = enabled.findIndex(({ i }) => i === from);
      target =
        enabled[(pos + dir + enabled.length) % enabled.length]?.i ??
        enabled[0].i;
    }
    onValueChange(options[target].value);
    refs.current[target]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        move(index, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        move(index, -1);
        break;
      case "Home":
        e.preventDefault();
        move(index, "start");
        break;
      case "End":
        e.preventDefault();
        move(index, "end");
        break;
    }
  };

  const hasSelection = options.some((o) => o.value === value);

  return (
    <div
      role="radiogroup"
      aria-label={aria["aria-label"]}
      className={cn(
        "relative inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-lg border bg-sunken/70 p-0.5",
        fullWidth && "flex w-full",
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        const tabbable = selected || (!hasSelection && index === enabled[0]?.i);
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.ariaLabel}
            disabled={option.disabled}
            tabIndex={tabbable ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              "relative inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors duration-fast ease-out focus-visible:outline-offset-0 disabled:pointer-events-none disabled:opacity-40 pointer-coarse:min-h-11 [&_svg]:size-4",
              sizes[size],
              fullWidth && "flex-1",
              selected
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {selected && (
              <m.span
                layoutId={reduce ? undefined : layoutId}
                aria-hidden
                className="absolute inset-0 rounded-md bg-card shadow-[0_0_0_1px_rgb(var(--border)),0_1px_2px_rgb(var(--shadow)/0.08)]"
                transition={{ type: "spring", stiffness: 520, damping: 40 }}
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">
              {option.icon}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export { Segmented };
