import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ROOM_CODE_LENGTH, normalizeRoomCode } from "./roomCode";

export interface RoomCodeInputProps {
  id: string;
  value: string;
  onValueChange: (code: string) => void;
  invalid?: boolean;
  describedBy?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  size?: "md" | "lg";
  className?: string;
}

/**
 * Eight-character room code field, printed like the candidate-number boxes on
 * an exam paper: two runs of four square, ruled boxes, one typewriter letter
 * in each. It is one real text input (so paste, select-all, autofill and
 * screen readers behave normally) laid over the eight boxes. Pasting an
 * invite link extracts its code.
 */
export const RoomCodeInput = forwardRef<HTMLInputElement, RoomCodeInputProps>(
  function RoomCodeInput(
    {
      id,
      value,
      onValueChange,
      invalid,
      describedBy,
      autoFocus,
      disabled,
      size = "lg",
      className,
    },
    ref,
  ) {
    const [focused, setFocused] = useState(false);
    const chars = value.split("");
    const active = Math.min(value.length, ROOM_CODE_LENGTH - 1);

    return (
      <div
        className={cn(
          "relative grid w-full grid-cols-[repeat(4,minmax(0,1fr))_1.25rem_repeat(4,minmax(0,1fr))]",
          size === "lg" ? "max-w-[27rem]" : "max-w-[24rem]",
          disabled && "opacity-60",
          className,
        )}
      >
        {Array.from({ length: ROOM_CODE_LENGTH }, (_, i) => (
          <Cell
            key={i}
            char={chars[i]}
            caret={focused && i === active && value.length < ROOM_CODE_LENGTH}
            current={focused && i === active}
            invalid={invalid}
            size={size}
            gapAfter={i === 3}
            groupStart={i === 0 || i === 4}
          />
        ))}
        <input
          ref={ref}
          id={id}
          name="roomCode"
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          autoFocus={autoFocus}
          disabled={disabled}
          value={value}
          onChange={(e) => onValueChange(normalizeRoomCode(e.target.value))}
          onFocus={(e) => {
            setFocused(true);
            // Keep the caret at the end so typing always appends.
            const el = e.currentTarget;
            requestAnimationFrame(() =>
              el.setSelectionRange(el.value.length, el.value.length),
            );
          }}
          onBlur={() => setFocused(false)}
          className="absolute inset-0 h-full w-full cursor-text rounded-none bg-transparent text-base text-transparent caret-transparent outline-none selection:bg-transparent focus-visible:outline-none"
        />
      </div>
    );
  },
);

function Cell({
  char,
  caret,
  current,
  invalid,
  size,
  gapAfter,
  groupStart,
}: {
  char?: string;
  caret: boolean;
  current: boolean;
  invalid?: boolean;
  size: "md" | "lg";
  gapAfter: boolean;
  groupStart: boolean;
}) {
  return (
    <>
      <span
        aria-hidden
        data-box
        className={cn(
          // Square boxes that share their rules, like a printed grid.
          "relative flex aspect-square items-center justify-center border-y border-r bg-card font-mono font-medium uppercase leading-none text-foreground transition-[background-color,border-color] duration-fast dark:bg-sunken/60",
          groupStart && "border-l",
          size === "lg"
            ? "text-[1.375rem] sm:text-[1.75rem]"
            : "text-[1.125rem] sm:text-[1.375rem]",
          invalid ? "border-pen/70" : "border-foreground/45",
          current && "bg-tint dark:bg-tint",
        )}
      >
        {char ??
          (caret ? (
            <span className="h-[1.05em] w-[2px] animate-pulse bg-primary motion-reduce:animate-none" />
          ) : null)}
        {current && (
          <span className="absolute inset-x-0 bottom-0 h-[2px] bg-primary" />
        )}
      </span>
      {gapAfter && (
        <span aria-hidden className="flex items-center justify-center">
          <span className="h-px w-2.5 bg-foreground/50" />
        </span>
      )}
    </>
  );
}
