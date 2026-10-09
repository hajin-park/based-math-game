import { Digits } from "@/components/ui/digits";
import { answerPrefix, type Question } from "@/game";
import { cn } from "@/lib/utils";
import { baseTagKey } from "./describe";

/** The correct answer of a question, typeset like a prompt number. */
export function AnswerValue({
  question,
  size = "sm",
  className,
}: {
  question: Question;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  if (question.answerFormat === "char" || !question.answerBase) {
    return (
      <span
        className={cn(
          "inline-grid min-w-6 place-items-center rounded-sm border border-border-strong bg-card px-1 font-mono font-medium text-foreground",
          className,
        )}
      >
        {question.answer === " " ? "space" : question.answer}
      </span>
    );
  }
  const prefix = answerPrefix(question);
  return (
    <span className={cn("inline-flex items-baseline", className)}>
      {prefix && (
        <span className="font-mono text-[0.85em] text-muted-foreground">
          {prefix}
        </span>
      )}
      <Digits
        base={baseTagKey(question.answerBase)}
        value={question.answer}
        size={size}
        group={question.answer.length > 8}
        condensed={question.answer.length > 12}
      />
    </span>
  );
}
