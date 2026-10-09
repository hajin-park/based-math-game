import type { DayBucket } from "@/lib/statsDerive";
import { cn } from "@/lib/utils";

/**
 * Last-N-days activity as thin columns (correct answers per day). Today is
 * the accent; empty days are a baseline tick. Each column has a tooltip and
 * the whole strip has a text alternative.
 */
export function ActivityStrip({
  days,
  className,
}: {
  days: DayBucket[];
  className?: string;
}) {
  const max = Math.max(1, ...days.map((d) => d.correct));
  const fmt = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const active = days.filter((d) => d.runs > 0).length;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <ol
        className="flex h-8 items-end gap-[2px]"
        aria-label={`Activity over the last ${days.length} days: played on ${active} of them`}
      >
        {days.map((d, i) => {
          const today = i === days.length - 1;
          const h = d.correct ? Math.max(4, Math.round((d.correct / max) * 32)) : 2;
          return (
            <li
              key={d.key}
              title={`${fmt.format(d.at)}: ${d.runs} ${d.runs === 1 ? "run" : "runs"}, ${d.correct} correct`}
              className="flex h-full flex-1 items-end"
            >
              <span className="sr-only">
                {fmt.format(d.at)}: {d.runs} runs, {d.correct} correct
              </span>
              <span
                aria-hidden
                className={cn(
                  "block w-full rounded-t-[2px]",
                  d.correct === 0
                    ? "bg-border-strong"
                    : today
                      ? "bg-primary"
                      : "bg-foreground/70",
                )}
                style={{ height: h }}
              />
            </li>
          );
        })}
      </ol>
      <div
        aria-hidden
        className="flex justify-between text-[0.6875rem] text-muted-foreground"
      >
        <span>{days.length - 1} days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
