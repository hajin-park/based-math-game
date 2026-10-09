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
 * Eight-character room code field with a segmented look. It is one real text
 * input (so paste, select-all, autofill and screen readers behave normally)
 * laid over eight display cells. Pasting an invite link extracts its code.
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
          "relative grid w-full max-w-[26rem] grid-cols-[repeat(4,minmax(0,1fr))_0.5rem_repeat(4,minmax(0,1fr))] gap-1 xs:gap-1.5",
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
          className="absolute inset-0 h-full w-full cursor-text rounded-md bg-transparent text-transparent caret-transparent outline-none selection:bg-transparent focus-visible:outline-none"
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
}: {
  char?: string;
  caret: boolean;
  current: boolean;
  invalid?: boolean;
  size: "md" | "lg";
  gapAfter: boolean;
}) {
  return (
    <>
      <span
        aria-hidden
        className={cn(
          "flex items-center justify-center rounded-md border bg-card font-mono font-medium uppercase text-foreground shadow-xs transition-[border-color,box-shadow] duration-fast dark:bg-sunken/60",
          size === "lg"
            ? "h-14 text-[1.375rem] sm:h-16 sm:text-[1.625rem]"
            : "h-12 text-[1.125rem]",
          char ? "border-border-strong" : "border-input",
          current &&
            "border-primary shadow-[0_0_0_3px_rgb(var(--ring)/0.16)]",
          invalid && "border-destructive",
        )}
      >
        {char ?? (caret ? <span className="h-[1.1em] w-px animate-pulse bg-primary motion-reduce:animate-none" /> : null)}
      </span>
      {gapAfter && (
        <span aria-hidden className="flex items-center justify-center">
          <span className="h-px w-2 bg-border-strong" />
        </span>
      )}
    </>
  );
}
