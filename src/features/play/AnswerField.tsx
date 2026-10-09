import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useRef,
  type KeyboardEvent,
} from "react";

import { BaseTag } from "@/components/ui/base-tag";
import { inputVariants } from "@/components/ui/input";
import { answerPrefix, inputModeFor, type Question } from "@/game";
import { cn } from "@/lib/utils";
import { answerWord, baseTagKey } from "./describe";

export interface AnswerFieldHandle {
  focus: () => void;
  /** Subtle horizontal shake (rejected keystroke / wrong Enter). */
  shake: () => void;
  /** Success ring that fades out (correct answer). */
  flash: () => void;
}

export interface AnswerFieldProps {
  question: Question;
  value: string;
  /** Returns false when the engine rejects the new value. */
  onValueChange: (raw: string) => boolean;
  /** A keystroke was rejected (invalid character or too long). */
  onReject?: (raw: string) => void;
  onEnter?: () => void;
  /** Tab (without Shift) skips. Omit to keep Tab as normal focus movement. */
  onTab?: () => void;
  disabled?: boolean;
  invalid?: boolean;
  /** id(s) of elements describing the field (question, shortcut hints). */
  describedBy?: string;
  autoFocus?: boolean;
  className?: string;
}

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * The answer field: big mono input on the raised surface with the answer
 * base's prefix as a non-editable adornment, per-format mobile keyboard and
 * keystroke filtering (the engine decides what is acceptable).
 */
export const AnswerField = forwardRef<AnswerFieldHandle, AnswerFieldProps>(
  function AnswerField(
    {
      question,
      value,
      onValueChange,
      onReject,
      onEnter,
      onTab,
      disabled,
      invalid,
      describedBy,
      autoFocus,
      className,
    },
    ref,
  ) {
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const shellRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLSpanElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => inputRef.current?.focus({ preventScroll: true }),
        shake: () => {
          if (reducedMotion()) return;
          shellRef.current?.animate(
            [
              { transform: "translateX(0)" },
              { transform: "translateX(-5px)" },
              { transform: "translateX(4px)" },
              { transform: "translateX(-2px)" },
              { transform: "translateX(0)" },
            ],
            { duration: 200, easing: "cubic-bezier(.2,.8,.2,1)" },
          );
        },
        flash: () => {
          ringRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: reducedMotion() ? 1 : 260,
            easing: "ease-out",
          });
        },
      }),
      [],
    );

    const prefix = answerPrefix(question);
    const format = question.answerFormat;
    const label = `Answer in ${answerWord(question)}`;
    // Width tracks the longest possible answer so the caret sits centred.
    const chars = Math.max(
      2,
      question.maxLength + (question.maxLength > 8 ? 3 : 1),
    );
    const long = question.maxLength > 12;

    const onKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter?.();
        } else if (
          e.key === "Tab" &&
          !e.shiftKey &&
          !e.altKey &&
          !e.metaKey &&
          !e.ctrlKey &&
          onTab
        ) {
          e.preventDefault();
          onTab();
        }
      },
      [onEnter, onTab],
    );

    return (
      <div className={cn("flex w-full flex-col items-center gap-2", className)}>
        <label
          htmlFor={id}
          className="inline-flex items-center gap-2 text-label text-muted-foreground"
        >
          <span>{label}</span>
          {question.answerBase && format !== "char" && (
            <BaseTag
              base={baseTagKey(question.answerBase)}
              size="xs"
              aria-hidden
            />
          )}
        </label>
        <div
          ref={shellRef}
          data-invalid={invalid || undefined}
          className={cn(
            inputVariants({ variant: "answer" }),
            "relative w-full max-w-md items-center justify-center gap-0 px-3",
            "focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgb(var(--ring)/0.16)]",
            "data-[invalid]:border-destructive data-[invalid]:focus-within:shadow-[0_0_0_3px_rgb(var(--destructive)/0.16)]",
            disabled && "opacity-60",
          )}
          onClick={() => inputRef.current?.focus()}
        >
          <span
            ref={ringRef}
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-md border-2 border-success opacity-0"
          />
          {prefix && (
            <span
              aria-hidden
              className="select-none font-mono text-muted-foreground/70"
            >
              {prefix}
            </span>
          )}
          <input
            ref={inputRef}
            id={id}
            aria-label={label}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            value={value}
            disabled={disabled}
            autoFocus={autoFocus}
            onChange={(e) => {
              const raw = e.target.value;
              if (!onValueChange(raw) && raw.length > value.length)
                onReject?.(raw);
            }}
            onKeyDown={onKeyDown}
            type="text"
            inputMode={inputModeFor(format)}
            enterKeyHint="next"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            className={cn(
              "min-w-0 bg-transparent text-center font-mono text-foreground caret-primary outline-none placeholder:text-muted-foreground/50 focus-visible:outline-none",
              format === "hex" && "uppercase",
              long && "text-mono-lg sm:text-[1.375rem]",
            )}
            style={{ width: `${chars}ch` }}
          />
        </div>
      </div>
    );
  },
);
