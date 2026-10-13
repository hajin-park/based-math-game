import type { DayBucket } from "@/lib/statsDerive";
import { cn } from "@/lib/utils";

/**
 * Attendance: the last N days as a class register. One ruled column per day
 * (weekday initial, date), and in the mark row the number of runs played that
 * day; days off are left blank. Today's column is set in the spot colour.
 * It is a real table, so screen readers get every day.
 */
export function ActivityStrip({
  days,
  className,
}: {
  days: DayBucket[];
  className?: string;
}) {
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });
  const long = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const dayOfMonth = (ms: number) => new Date(ms).getDate();
  const present = days.filter((d) => d.runs > 0).length;
  const last = days.length - 1;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <table className="w-full table-fixed border-collapse text-center tabular-nums">
        <caption className="sr-only">
          Attendance over the last {days.length} days: played on {present} of
          them. Each day shows the number of runs.
        </caption>
        <thead>
          <tr>
            {days.map((d, i) => (
              <th
                key={d.key}
                scope="col"
                className={cn(
                  "border-x border-t border-foreground/20 px-0 pb-0.5 pt-1 align-bottom font-sans text-[0.6875rem] font-medium leading-tight sm:text-[0.75rem]",
                  i === last ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span aria-hidden className="block">
                  {weekday.format(d.at)}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "block font-mono font-normal",
                    i === last &&
                      "font-bold underline decoration-primary decoration-[1.5px] underline-offset-2",
                  )}
                >
                  {dayOfMonth(d.at)}
                </span>
                <span className="sr-only">
                  {i === last ? "Today, " : ""}
                  {long.format(d.at)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {days.map((d, i) => (
              <td
                key={d.key}
                title={`${long.format(d.at)}: ${d.runs} ${d.runs === 1 ? "run" : "runs"}, ${d.correct} correct`}
                className={cn(
                  "h-9 border border-foreground/20 p-0 font-mono text-[0.75rem] sm:h-10 sm:text-mono-sm",
                  i === last && "outline outline-[1.5px] -outline-offset-1 outline-primary",
                  d.runs > 0 ? "bg-tint/60 text-foreground" : "text-muted-foreground",
                )}
              >
                {d.runs > 0 ? (
                  <>
                    {d.runs}
                    <span className="sr-only">
                      {d.runs === 1 ? " run" : " runs"}, {d.correct} correct
                    </span>
                  </>
                ) : (
                  <>
                    <span aria-hidden>·</span>
                    <span className="sr-only">no runs</span>
                  </>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="font-sans text-[0.8125rem] text-muted-foreground">
        Present on{" "}
        <span className="font-mono text-foreground">{present}</span> of the
        last <span className="font-mono">{days.length}</span> days. Figures
        are runs played.
      </p>
    </div>
  );
}
