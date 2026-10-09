import * as React from "react";
import { Check, Eye, EyeOff, RefreshCw } from "lucide-react";

import {
  answerPrefix,
  checkAnswer,
  explainQuestion,
  formatAnswer,
  inputModeFor,
  isAcceptableKeystroke,
  type PromptPart,
  type TopicId,
} from "@/game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseTag } from "@/components/ui/base-tag";
import { Digits } from "@/components/ui/digits";
import { cn } from "@/lib/utils";
import { exampleQuestion } from "./lessons";

const MINUS = "−";

function NumberPart({
  part,
}: {
  part: Extract<PromptPart, { type: "number" }>;
}) {
  const negative = part.digits.startsWith("-");
  const digits = negative ? part.digits.slice(1) : part.digits;
  return (
    <span className="inline-flex items-center gap-2">
      <BaseTag base={part.base} size="sm" />
      <span className="inline-flex items-baseline">
        {negative && (
          <span className="font-mono text-mono-xl font-medium text-base-dec">
            {MINUS}
          </span>
        )}
        <Digits
          base={part.base}
          value={digits}
          group={part.base === 2 ? 4 : false}
          condensed={part.base === 2 && digits.length > 8}
          size="lg"
        />
      </span>
    </span>
  );
}

/** Renders an engine prompt with the design system's number primitives. */
export function PromptView({ prompt }: { prompt: PromptPart[] }) {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < prompt.length; i++) {
    const part = prompt[i];
    const key = `${i}`;
    if (part.type === "op" && part.text === "2^") {
      // 2^n: superscript the exponent (a number or the unknown "n").
      const next = prompt[i + 1];
      const exp =
        next?.type === "number"
          ? next.digits
          : next?.type === "text"
            ? next.text
            : "";
      out.push(
        <span
          key={key}
          className="font-mono text-mono-xl font-medium text-base-dec"
        >
          2<sup className="ml-0.5 text-[0.6em]">{exp}</sup>
        </span>,
      );
      i++;
      continue;
    }
    switch (part.type) {
      case "number":
        out.push(<NumberPart key={key} part={part} />);
        break;
      case "op":
        out.push(
          <span
            key={key}
            className="font-mono text-[1.25rem] font-medium text-muted-foreground"
          >
            {part.text}
          </span>,
        );
        break;
      case "text":
        out.push(
          <span key={key} className="text-body text-muted-foreground">
            {part.text}
          </span>,
        );
        break;
      case "swatch":
        out.push(
          <span key={key} className="inline-flex items-center gap-2.5">
            <span
              aria-hidden
              className="size-10 rounded-md border border-foreground/15 shadow-xs"
              style={{ backgroundColor: part.hex }}
            />
            <BaseTag base="hex" size="sm" />
            <span className="inline-flex items-baseline font-mono text-mono-xl font-medium text-base-hex">
              <span className="opacity-45">#</span>
              <Digits base="hex" value={part.hex.slice(1)} size="inherit" />
            </span>
          </span>,
        );
        break;
      case "char":
        out.push(
          <span
            key={key}
            className="inline-flex h-14 min-w-14 items-center justify-center rounded-md border bg-sunken px-3 font-mono text-mono-xl font-medium"
          >
            <span className="sr-only">character </span>
            {part.char}
          </span>,
        );
        break;
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-3">{out}</div>
  );
}

/**
 * TryOne — a generated example from the engine: answer it, or reveal the
 * worked solution from `explainQuestion`.
 */
export function TryOne({
  topicId,
  className,
}: {
  topicId: TopicId;
  className?: string;
}) {
  const [n, setN] = React.useState(0);
  const q = React.useMemo(() => exampleQuestion(topicId, n), [topicId, n]);
  const [value, setValue] = React.useState("");
  const [revealed, setRevealed] = React.useState(false);
  const steps = React.useMemo(
    () => (revealed ? explainQuestion(q) : []),
    [q, revealed],
  );
  const solved = value !== "" && checkAnswer(q, value);
  const id = React.useId();
  const stepsId = `${id}-steps`;
  const prefix = answerPrefix(q);

  const next = () => {
    setN((x) => x + 1);
    setValue("");
    setRevealed(false);
  };

  return (
    <div className={cn("rounded-lg border bg-card shadow-xs", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 sm:px-5">
        <p className="eyebrow text-foreground">Try one</p>
        <p className="text-[0.8125rem] text-muted-foreground">
          {q.instruction}
        </p>
      </div>

      <div className="flex flex-col gap-5 p-4 sm:p-5">
        <PromptView prompt={q.prompt} />

        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!solved) setRevealed(true);
          }}
        >
          <Label
            htmlFor={`${id}-answer`}
            className="text-label text-muted-foreground"
          >
            Your answer
            {q.answerBase === 2 && q.answerBits
              ? ` (${q.answerBits} bits)`
              : ""}
          </Label>
          <div className="flex flex-col gap-2 xs:flex-row xs:items-center">
            <div className="relative min-w-0 flex-1 xs:max-w-[18rem]">
              {prefix && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-mono text-[0.9375rem] text-muted-foreground"
                >
                  {prefix}
                </span>
              )}
              <Input
                id={`${id}-answer`}
                value={value}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (isAcceptableKeystroke(raw, q)) setValue(raw);
                }}
                inputMode={inputModeFor(q.answerFormat)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-describedby={`${id}-status`}
                className={cn(
                  "h-11 font-mono text-[1rem]",
                  prefix && "pl-9",
                  solved && "border-success focus-visible:border-success",
                )}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                aria-expanded={revealed}
                aria-controls={stepsId}
                onClick={() => setRevealed((r) => !r)}
                className="h-11"
              >
                {revealed ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                {revealed ? "Hide steps" : "Show steps"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={next}
                className="h-11"
              >
                <RefreshCw aria-hidden />
                Another
              </Button>
            </div>
          </div>
          <p
            id={`${id}-status`}
            aria-live="polite"
            className={cn(
              "flex min-h-5 items-center gap-1.5 text-[0.8125rem]",
              solved ? "text-success" : "text-muted-foreground",
            )}
          >
            {solved ? (
              <>
                <Check aria-hidden className="size-4" />
                Correct. In a game this would advance on its own.
              </>
            ) : (
              "Prefixes, leading zeros and spaces are optional."
            )}
          </p>
        </form>

        <div id={stepsId} hidden={!revealed}>
          {revealed && (
            <ol className="flex flex-col border-t">
              {steps.map((step, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 border-b border-dashed py-4 last:border-b-0 last:pb-0"
                >
                  <span
                    aria-hidden
                    className="pt-0.5 font-mono text-[0.75rem] text-muted-foreground"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex min-w-0 flex-col gap-2">
                    <p
                      className={cn(
                        "text-body-sm font-semibold",
                        step.title === "Answer" && "text-foreground",
                      )}
                    >
                      {step.title}
                    </p>
                    {step.work && step.work.length > 0 && (
                      <pre
                        tabIndex={
                          Math.max(...step.work.map((l) => l.length)) > 36
                            ? 0
                            : undefined
                        }
                        className={cn(
                          "overflow-x-auto rounded-md bg-sunken px-3 py-2.5 font-mono text-[0.8125rem] leading-relaxed text-foreground",
                          step.title === "Answer" && "text-base",
                        )}
                      >
                        {step.title === "Answer"
                          ? formatAnswer(q, { prefix: true })
                          : step.work.join("\n")}
                      </pre>
                    )}
                    {step.note && (
                      <p className="text-body-sm text-muted-foreground text-pretty">
                        {step.note}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
