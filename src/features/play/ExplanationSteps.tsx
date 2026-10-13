import { memo, useMemo } from "react";

import { explainQuestion, type Question } from "@/game";
import { cn } from "@/lib/utils";

/**
 * Worked solution for a question (engine `explainQuestion`), set like a
 * textbook example: numbered steps, the working in typewriter on a slip of
 * paper, and a plain-language note. Sits inside a tint "Worked solution"
 * box on the run screen and the results.
 */
export const ExplanationSteps = memo(function ExplanationSteps({
  question,
  className,
}: {
  question: Question;
  className?: string;
}) {
  const steps = useMemo(() => explainQuestion(question), [question]);
  return (
    <ol className={cn("flex flex-col gap-4", className)}>
      {steps.map((step, i) => (
        <li key={i} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-1">
          <span
            aria-hidden
            className="font-mono text-mono-sm font-medium tabular-nums leading-snug text-primary"
          >
            {i + 1}.
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="font-serif text-body-sm font-bold leading-snug text-foreground">
              {step.title}
            </p>
            {step.work && step.work.length > 0 && (
              <pre
                tabIndex={0}
                aria-label={`Working for step ${i + 1}`}
                className="max-w-full overflow-x-auto whitespace-pre rounded-sm border border-border bg-card px-3 py-2 font-mono text-[0.8125rem] leading-relaxed text-foreground"
              >
                {step.work.join("\n")}
              </pre>
            )}
            {step.note && (
              <p className="text-body-sm text-foreground/80 text-pretty">
                {step.note}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
});
