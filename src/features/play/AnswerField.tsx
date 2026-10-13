import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { BaseTag } from "@/components/ui/base-tag";
import { Input } from "@/components/ui/input";
import { answerPrefix, inputModeFor, type Question } from "@/game";
import { cn } from "@/lib/utils";
import { answerWord, baseTagKey } from "./describe";
import { answerLabel } from "./RunExercise";

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
  /** Alignment of the label and the answer (default "center"). */
  align?: "center" | "start";
  /** Rendered at the end of the answer line (e.g. the last answer's mark). */
  adornment?: ReactNode;
  className?: string;
}

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * The answer blank: a typewriter answer written on a rule (`Input
 * variant="answer"`), the answer base's prefix printed at the start of the
 * line, a small-caps label above, per-format mobile keyboard and keystroke
 * filtering (the engine decides what is acceptable).
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
      align = "center",
      adornment,
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
    const label = answerLabel(answerWord(question));
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
      <div
        className={cn(
          "flex w-full flex-col gap-1.5",
          align === "start" ? "items-start" : "items-center",
          className,
        )}
      >
        <label
          htmlFor={id}
          className="inline-flex items-center gap-2 font-serif text-eyebrow text-muted-foreground [font-variant-caps:all-small-caps]"
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
        <div className="flex w-full max-w-md items-end gap-3">
          <div
            ref={shellRef}
            className={cn("relative min-w-0 flex-1", disabled && "opacity-60")}
          >
            {prefix && (
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-y-0 left-2 flex select-none items-center font-mono font-medium text-muted-foreground",
                  long ? "text-mono-lg sm:text-[1.375rem]" : "text-mono-xl",
                )}
              >
                {prefix}
              </span>
            )}
            <Input
              ref={inputRef}
              id={id}
              variant="answer"
              data-answer-field=""
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
                "caret-primary",
                align === "start" ? "text-left" : "text-center",
                format === "hex" && "uppercase",
                long && "text-mono-lg sm:text-[1.375rem]",
              )}
              style={
                prefix
                  ? {
                      paddingLeft: `calc(0.5rem + ${prefix.length + 0.35}ch)`,
                      paddingRight:
                        align === "start"
                          ? undefined
                          : `calc(0.5rem + ${prefix.length + 0.35}ch)`,
                    }
                  : undefined
              }
            />
            <span
              ref={ringRef}
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-success opacity-0"
            />
          </div>
          {adornment}
        </div>
      </div>
    );
  },
);
