import { memo, useMemo } from "react";

import { explainQuestion, type Question } from "@/game";
import { cn } from "@/lib/utils";

/**
 * Worked solution for a question (engine `explainQuestion`), as a numbered
 * list: step title, monospace working, plain-language note.
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
        <li key={i} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2">
          <span
            aria-hidden
            className="pt-px font-mono text-[0.75rem] tabular-nums text-muted-foreground"
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="text-label font-medium text-foreground">
              {step.title}
            </p>
            {step.work && step.work.length > 0 && (
              <pre
                tabIndex={0}
                aria-label={`Working for step ${i + 1}`}
                className="max-w-full overflow-x-auto whitespace-pre rounded-md border bg-sunken/70 px-3 py-2 font-mono text-[0.8125rem] leading-relaxed text-foreground"
              >
                {step.work.join("\n")}
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
  );
});
