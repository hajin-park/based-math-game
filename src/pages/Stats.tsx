/**
 * "/stats" — the report card. A head with the player's name and the period
 * the card covers; a summary ledger and the attendance register; grades per
 * topic with remarks computed from them (only when there is enough data);
 * the pace plotted on graph paper with new bests circled in red pen;
 * personal bests; and recent runs on ruled lines.
 */
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendChart } from "@/components/charts/TrendChart";
import { ActivityStrip } from "@/components/charts/ActivityStrip";
import { useAuth } from "@/contexts/AuthContext";
import {
  GUEST_RUN_LIMIT,
  useRunHistory,
  useUserStats,
  type BestEntry,
  type RunRecord,
} from "@/data";
import { useStartTarget } from "@/features/play/useStartTarget";
import { FORMATS, TOPICS, formatScore, getMode, type GameMode } from "@/game";
import {
  activityByDay,
  bestsList,
  dailySummary,
  dayStreak,
  modeLabel,
  paceTrend,
  topicBreakdown,
  type TopicRow,
} from "@/lib/statsDerive";
import {
  formatDate,
  formatDateTime,
  formatPracticeTime,
  relativeTime,
} from "@/lib/timeFormat";
import { cn } from "@/lib/utils";

const HISTORY_LIMIT = 200;
const nf = new Intl.NumberFormat();

/** Remarks need this many runs in a topic before it is compared. */
const REMARK_MIN_RUNS = 2;

function pct(n: number | null | undefined): string {
  return n === null || n === undefined ? "—" : `${Math.round(n * 100)}%`;
}

function secs(n: number | null): string {
  return n === null ? "—" : `${n.toFixed(1)} s`;
}

/* -------------------------------------------------------------------------- */

function SectionHead({
  id,
  title,
  meta,
}: {
  id: string;
  title: string;
  meta?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-foreground/25 pb-2">
      <h2 id={id} className="text-title font-bold">
        {title}
      </h2>
      {meta && (
        <p className="font-sans text-[0.8125rem] text-muted-foreground">
          {meta}
        </p>
      )}
    </div>
  );
}

/** A fill-in line on the card's head ("Name ____"). */
function HeadLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-baseline gap-3">
      <span className="smallcaps shrink-0 text-[0.9375rem]">{label}</span>
      <span className="min-w-0 flex-1 truncate border-b border-foreground/35 pb-0.5 font-mono text-[1rem] text-foreground">
        {children}
      </span>
    </div>
  );
}

/** A margin note: blue small-caps label, pencil text, no box. */
function MarginNote({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 text-body-sm text-muted-foreground text-pretty">
      <p className="smallcaps text-[0.9375rem] text-primary">{label}</p>
      <div>{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface Remark {
  strong: TopicRow;
  weak: TopicRow;
  /** What separates them: accuracy, or pace when accuracy is level. */
  by: "accuracy" | "pace";
}

/**
 * Strongest and weakest topic, from the data only: at least two topics with
 * REMARK_MIN_RUNS runs, an accuracy and a pace. Ranked by accuracy; when two
 * accuracies are within two points, by seconds per answer.
 */
function computeRemark(rows: TopicRow[]): Remark | null {
  const eligible = rows.filter(
    (r) =>
      r.runs >= REMARK_MIN_RUNS &&
      r.accuracy !== null &&
      r.secondsPerAnswer !== null,
  );
  if (eligible.length < 2) return null;
  const sorted = [...eligible].sort((a, b) => {
    const d = (b.accuracy ?? 0) - (a.accuracy ?? 0);
    if (Math.abs(d) >= 0.02) return d;
    return (a.secondsPerAnswer ?? 0) - (b.secondsPerAnswer ?? 0);
  });
  const strong = sorted[0];
  const weak = sorted[sorted.length - 1];
  const accGap = Math.abs((strong.accuracy ?? 0) - (weak.accuracy ?? 0));
  const paceGap = Math.abs(
    (strong.secondsPerAnswer ?? 0) - (weak.secondsPerAnswer ?? 0),
  );
  // Nothing worth saying when the two are level on both counts.
  if (accGap < 0.02 && paceGap < 0.2) return null;
  return { strong, weak, by: accGap >= 0.02 ? "accuracy" : "pace" };
}

/* -------------------------------------------------------------------------- */

export default function Stats() {
  const { user, isGuest, loading: authLoading } = useAuth();
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refresh: refreshStats,
  } = useUserStats();
  const {
    runs,
    loading: runsLoading,
    error: runsError,
    refresh,
  } = useRunHistory({ limit: HISTORY_LIMIT });
  const start = useStartTarget();

  const loading = authLoading || statsLoading || runsLoading;
  const error = statsError || runsError;

  const derived = useMemo(() => {
    const now = Date.now();
    const order = new Map(TOPICS.map((t, i) => [t.id, i]));
    const topics = topicBreakdown(runs);
    return {
      streak: dayStreak(runs, now),
      activity: activityByDay(runs, 14, now),
      topics,
      // Grades read in catalogue order, like subjects on a report card.
      grades: [...topics].sort(
        (a, b) => (order.get(a.topicId) ?? 0) - (order.get(b.topicId) ?? 0),
      ),
      remark: computeRemark(topics),
      pace: paceTrend(runs, 30),
      bests: bestsList(stats.bests || {}),
      daily: dailySummary(stats.bests || {}),
    };
  }, [runs, stats.bests]);

  const practice = formatPracticeTime(stats.totalDurationMs);
  const empty =
    !loading && !error && stats.gamesPlayed === 0 && runs.length === 0;

  const name = isGuest
    ? "Guest"
    : user?.displayName || (authLoading ? "" : "Player");
  const first = runs.length ? formatDate(runs[runs.length - 1].endedAt) : "";
  const latest = runs.length ? formatDate(runs[0].endedAt) : "";
  const period = !runs.length
    ? "—"
    : first === latest
      ? first
      : `${first} – ${latest}`;

  const guestNote = !authLoading && isGuest && (
    <div role="note">
      <MarginNote label="Note">
        Saved on this device: your last {GUEST_RUN_LIMIT} runs in this browser,
        gone if you clear its data.{" "}
        <Link className="link" to="/signup?next=%2Fstats">
          Create an account
        </Link>{" "}
        to keep them.
      </MarginNote>
    </div>
  );

  return (
    <div className="container flex flex-col gap-10 py-10 md:gap-12 md:py-14">
      <PageHeader
        folio={
          runs.length >= HISTORY_LIMIT
            ? `Last ${HISTORY_LIMIT} runs`
            : undefined
        }
        title="Report card"
        divider
        size="md"
      >
        <div className="mt-3 grid max-w-[42rem] gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-6">
          <HeadLine label="Name">
            {name === "Guest" ? (
              <span className="font-serif italic text-muted-foreground">
                Guest
              </span>
            ) : (
              name || " "
            )}
          </HeadLine>
          <HeadLine label="Period">{loading ? " " : period}</HeadLine>
        </div>
      </PageHeader>

      {error ? (
        <EmptyState
          title="Couldn’t load your report card"
          description="Check your connection, then try again."
          action={
            <Button
              variant="outline"
              onClick={() => {
                refresh();
                refreshStats();
              }}
            >
              Try again
            </Button>
          }
        />
      ) : empty ? (
        <section aria-labelledby="empty-title" className="flex flex-col gap-8">
          <h2 id="empty-title" className="sr-only">
            Your runs
          </h2>
          {guestNote}
          <EmptyState
            title="Nothing to report yet"
            description="Finish a run and the card fills in: grades for each topic, attendance, pace and personal bests."
            action={
              <Button asChild>
                <Link to={start.path}>
                  Play {start.title}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            }
          />
        </section>
      ) : (
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14">
          <div className="flex min-w-0 flex-col gap-12 md:gap-14">
            {guestNote && <div className="lg:hidden">{guestNote}</div>}

            {/* Summary + attendance */}
            <div className="grid gap-10 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-10">
              <section
                aria-labelledby="summary-title"
                className="flex flex-col gap-4"
              >
                <SectionHead id="summary-title" title="Summary" />
                {loading ? (
                  <LedgerSkeleton rows={4} />
                ) : (
                  <dl className="flex flex-col">
                    <LedgerRow
                      label="Runs"
                      value={nf.format(stats.gamesPlayed)}
                    />
                    <LedgerRow
                      label="Correct answers"
                      value={nf.format(stats.totalCorrect)}
                    />
                    <LedgerRow
                      label="Time practised"
                      value={`${practice.value} ${practice.unit}`}
                    />
                    <LedgerRow
                      label="Day streak"
                      value={`${derived.streak.current} ${derived.streak.current === 1 ? "day" : "days"}`}
                      note={
                        derived.streak.current > 0 &&
                        !derived.streak.playedToday
                          ? "Play today to keep it."
                          : undefined
                      }
                    />
                    {derived.daily.played > 0 &&
                      derived.daily.bestMs !== null && (
                        <LedgerRow
                          label="Daily sheets"
                          value={`${derived.daily.played} · best ${formatScore(FORMATS.daily, derived.daily.bestMs)}`}
                        />
                      )}
                  </dl>
                )}
              </section>

              <section
                aria-labelledby="attendance-title"
                className="flex min-w-0 flex-col gap-4"
              >
                <SectionHead
                  id="attendance-title"
                  title="Attendance"
                  meta="Last 14 days"
                />
                {loading ? (
                  <Skeleton className="h-[5.5rem] w-full rounded-sm" />
                ) : (
                  <ActivityStrip days={derived.activity} />
                )}
              </section>
            </div>

            {/* Grades */}
            <section
              aria-labelledby="grades-title"
              className="flex flex-col gap-4"
            >
              <SectionHead
                id="grades-title"
                title="Grades"
                meta="By topic, from your saved runs"
              />
              {loading ? (
                <LedgerSkeleton rows={4} />
              ) : derived.grades.length === 0 ? (
                <EmptyState
                  size="sm"
                  title="No topics graded yet"
                  description="Play any topic and it shows up here with your accuracy and time per answer."
                />
              ) : (
                <>
                  <GradesTable rows={derived.grades} bests={derived.bests} />
                  <Remarks remark={derived.remark} />
                </>
              )}
            </section>

            {/* Pace */}
            <section
              aria-labelledby="pace-title"
              className="flex flex-col gap-4"
            >
              <SectionHead
                id="pace-title"
                title="Pace"
                meta="Correct answers per minute, last 30 timed runs"
              />
              {loading ? (
                <Skeleton className="h-[200px] w-full rounded-sm" />
              ) : derived.pace.length < 2 ? (
                <EmptyState
                  size="sm"
                  title="Not enough timed runs to plot"
                  description="Your pace appears after two sprints, speedruns or survival runs."
                />
              ) : (
                <>
                  <TrendChart
                    label="Correct answers per minute over your last timed runs"
                    points={derived.pace.map((p) => ({
                      at: p.endedAt,
                      value: p.value,
                      detail: modeLabel(p.modeId),
                    }))}
                    formatValue={(v) => (v >= 10 ? v.toFixed(0) : v.toFixed(1))}
                    unit="/min"
                    formatDate={formatDate}
                    markBests
                  />
                  <p className="flex items-center gap-2 font-sans text-[0.8125rem] text-muted-foreground">
                    <svg
                      viewBox="0 0 20 14"
                      aria-hidden
                      className="h-3.5 w-5 shrink-0 overflow-visible"
                    >
                      <ellipse
                        cx="10"
                        cy="7"
                        rx="8.5"
                        ry="5.5"
                        className="fill-none stroke-pen"
                        strokeWidth={1.5}
                      />
                    </svg>
                    Circled: a new best pace, faster than every run before it.
                  </p>
                </>
              )}
            </section>

            {/* Personal bests */}
            <section
              aria-labelledby="bests-title"
              className="flex flex-col gap-4"
            >
              <SectionHead id="bests-title" title="Personal bests" />
              {loading ? (
                <LedgerSkeleton rows={3} />
              ) : derived.bests.length === 0 ? (
                <EmptyState
                  size="sm"
                  title="No personal bests yet"
                  description="Finish a sprint, speedrun or survival run to set one."
                />
              ) : (
                <BestsTable rows={derived.bests} />
              )}
            </section>

            {/* Recent runs */}
            <section
              aria-labelledby="recent-title"
              className="flex flex-col gap-4"
            >
              <SectionHead
                id="recent-title"
                title="Recent runs"
                meta={
                  runs.length
                    ? `${runs.length}${runs.length >= HISTORY_LIMIT ? "+" : ""} ${runs.length === 1 ? "run" : "runs"} ${isGuest ? "on this device" : "saved"}`
                    : undefined
                }
              />
              {loading ? (
                <LedgerSkeleton rows={5} />
              ) : (
                <RecentRuns runs={runs} />
              )}
            </section>
          </div>

          <aside
            aria-label="Notes on this card"
            className="hidden flex-col gap-6 border-t border-foreground/20 pt-4 lg:flex"
          >
            {guestNote}
            <MarginNote label="Accuracy">
              Questions answered correctly out of all questions shown; skips and
              time-outs count against it.
            </MarginNote>
            <MarginNote label="Avg time">
              Seconds per correct answer in timed runs. Practice runs count only
              for a topic you haven’t played timed.
            </MarginNote>
            <MarginNote label="Best">
              Your personal best in the topic’s sprint, or its speedrun if you
              haven’t played the sprint.
            </MarginNote>
          </aside>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function LedgerRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col border-b border-foreground/[0.12] py-2.5">
      <div className="flex items-baseline gap-2">
        <dt className="shrink-0 text-body">{label}</dt>
        <span aria-hidden className="leader" />
        <dd className="shrink-0 font-mono text-mono-md text-foreground">
          {value}
        </dd>
      </div>
      {note && (
        <p className="text-right font-sans text-[0.75rem] text-muted-foreground">
          {note}
        </p>
      )}
    </div>
  );
}

const th = "smallcaps h-9 pb-1.5 align-bottom font-normal text-[0.9375rem]";
const td = "h-12 border-b border-foreground/[0.12]";

/** Best per topic: the sprint best, else the speedrun best. */
function topicBest(
  topicId: string,
  bests: { modeId: string; mode: GameMode; best: BestEntry }[],
) {
  return (
    bests.find((b) => b.modeId === `${topicId}:sprint`) ??
    bests.find((b) => b.modeId === `${topicId}:speedrun`) ??
    null
  );
}

function GradesTable({
  rows,
  bests,
}: {
  rows: TopicRow[];
  bests: { modeId: string; mode: GameMode; best: BestEntry }[];
}) {
  return (
    <table className="w-full table-fixed border-collapse text-body tabular-nums">
      <caption className="sr-only">
        Grades by topic: runs, accuracy, average seconds per correct answer and
        personal best
      </caption>
      <colgroup>
        <col />
        <col className="hidden w-16 sm:table-column" />
        <col className="w-[4.5rem] sm:w-24" />
        <col className="w-[4.5rem] sm:w-24" />
        <col className="hidden w-32 md:table-column" />
        <col className="w-11 sm:w-24" />
      </colgroup>
      <thead>
        <tr className="rule-double text-left">
          <th scope="col" className={cn(th, "pl-1")}>
            Topic
          </th>
          <th
            scope="col"
            className={cn(th, "hidden px-2 text-right sm:table-cell")}
          >
            Runs
          </th>
          <th scope="col" className={cn(th, "px-2 text-right")}>
            Accuracy
          </th>
          <th scope="col" className={cn(th, "px-2 text-right")}>
            Avg time
          </th>
          <th
            scope="col"
            className={cn(th, "hidden px-2 text-right md:table-cell")}
          >
            Best
          </th>
          <th scope="col" className={th}>
            <span className="sr-only">Practice</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const best = topicBest(r.topicId, bests);
          return (
            <tr key={r.topicId}>
              <td className={cn(td, "min-w-0 py-2 pl-1 pr-2")}>
                <span className="block truncate font-serif font-bold">
                  {r.name}
                </span>
                <span className="block font-sans text-[0.75rem] text-muted-foreground sm:hidden">
                  {r.runs} {r.runs === 1 ? "run" : "runs"}
                </span>
              </td>
              <td
                className={cn(
                  td,
                  "hidden px-2 text-right font-mono text-mono-sm text-muted-foreground sm:table-cell",
                )}
              >
                {r.runs}
              </td>
              <td className={cn(td, "px-2 text-right font-mono text-mono-md")}>
                {pct(r.accuracy)}
              </td>
              <td
                className={cn(
                  td,
                  "whitespace-nowrap px-2 text-right font-mono text-mono-md",
                )}
              >
                {secs(r.secondsPerAnswer)}
                <span className="sr-only"> per correct answer</span>
              </td>
              <td
                className={cn(
                  td,
                  "hidden whitespace-nowrap px-2 text-right md:table-cell",
                )}
              >
                {best ? (
                  <span className="font-mono text-mono-md">
                    {formatScore(best.mode.spec, best.best.score)}
                    <span className="ml-1.5 font-sans text-[0.75rem] text-muted-foreground">
                      {best.mode.format === "sprint" ? "sprint" : "speedrun"}
                    </span>
                  </span>
                ) : (
                  <span className="font-mono text-muted-foreground">—</span>
                )}
              </td>
              <td className={cn(td, "pl-1 text-right")}>
                {r.practiceModeId ? (
                  <Link
                    to={`/play?mode=${encodeURIComponent(r.practiceModeId)}`}
                    aria-label={`Practice ${r.name}`}
                    className="link inline-flex min-h-11 items-center font-sans text-[0.8125rem] sm:min-h-0"
                  >
                    <span className="hidden sm:inline">Practice</span>
                    <ArrowRight aria-hidden className="size-4 sm:hidden" />
                  </Link>
                ) : null}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Remarks({ remark }: { remark: Remark | null }) {
  return (
    <div className="flex flex-col gap-1.5 bg-tint/60 px-4 py-3.5 sm:px-5">
      <p className="smallcaps text-[0.9375rem] text-primary">Remarks</p>
      {remark ? (
        <p className="font-serif text-body italic text-foreground text-pretty">
          Strongest in{" "}
          <span className="font-bold not-italic">{remark.strong.name}</span>:{" "}
          {pct(remark.strong.accuracy)} accurate,{" "}
          {secs(remark.strong.secondsPerAnswer)} per answer. Weakest in{" "}
          <span className="font-bold not-italic">{remark.weak.name}</span>:{" "}
          {pct(remark.weak.accuracy)} accurate,{" "}
          {secs(remark.weak.secondsPerAnswer)} per answer
          {remark.by === "pace" ? " (level on accuracy, slower)" : ""}.{" "}
          {remark.weak.practiceModeId && (
            <Link
              className="link not-italic"
              to={`/play?mode=${encodeURIComponent(remark.weak.practiceModeId)}`}
            >
              Practise {remark.weak.name}
            </Link>
          )}
        </p>
      ) : (
        <p className="font-serif text-body italic text-muted-foreground text-pretty">
          None yet. Remarks compare your topics once you’ve played at least two
          of them twice or more.
        </p>
      )}
    </div>
  );
}

function BestsTable({
  rows,
}: {
  rows: { modeId: string; mode: GameMode; best: BestEntry }[];
}) {
  return (
    <table className="w-full table-fixed border-collapse text-body tabular-nums">
      <caption className="sr-only">Personal best per mode</caption>
      <colgroup>
        <col />
        <col className="w-[6.5rem] sm:w-28" />
        <col className="hidden w-24 sm:table-column" />
        <col className="hidden w-32 md:table-column" />
        <col className="w-12" />
      </colgroup>
      <thead>
        <tr className="rule-double text-left">
          <th scope="col" className={cn(th, "pl-1")}>
            Mode
          </th>
          <th scope="col" className={cn(th, "px-2 text-right")}>
            Best
          </th>
          <th
            scope="col"
            className={cn(th, "hidden px-2 text-right sm:table-cell")}
          >
            Accuracy
          </th>
          <th
            scope="col"
            className={cn(th, "hidden px-2 text-right md:table-cell")}
          >
            Set
          </th>
          <th scope="col" className={th}>
            <span className="sr-only">Play</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ modeId, mode, best }) => (
          <tr key={modeId}>
            <td className={cn(td, "min-w-0 py-2 pl-1 pr-2")}>
              <span className="block text-pretty leading-snug">
                {mode.name}
              </span>
            </td>
            <td
              className={cn(
                td,
                "whitespace-nowrap px-2 text-right font-mono text-mono-md",
              )}
            >
              {formatScore(mode.spec, best.score)}
            </td>
            <td
              className={cn(
                td,
                "hidden px-2 text-right font-mono text-mono-sm text-muted-foreground sm:table-cell",
              )}
            >
              {pct(best.accuracy)}
            </td>
            <td
              className={cn(
                td,
                "hidden whitespace-nowrap px-2 text-right font-mono text-mono-sm text-muted-foreground md:table-cell",
              )}
            >
              {formatDate(best.endedAt)}
            </td>
            <td className={cn(td, "text-right")}>
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label={`Play ${mode.name}`}
              >
                <Link to={`/play?mode=${encodeURIComponent(modeId)}`}>
                  <Play />
                </Link>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Ruled lines in the book's blue, like exercise paper. */
const ruledRow = "border-b border-[rgb(var(--ruled)/0.28)]";

function RecentRuns({ runs }: { runs: RunRecord[] }) {
  const [count, setCount] = useState(10);
  if (!runs.length) {
    return (
      <EmptyState
        size="sm"
        title="No runs yet"
        description="Finished runs appear here, newest first."
      />
    );
  }
  const now = Date.now();
  const shown = runs.slice(0, count);
  return (
    <div className="flex flex-col gap-3">
      <table className="w-full table-fixed border-collapse text-body tabular-nums">
        <caption className="sr-only">Recent runs, newest first</caption>
        <colgroup>
          <col className="hidden w-36 sm:table-column" />
          <col />
          <col className="w-[6.5rem] sm:w-28" />
          <col className="hidden w-24 sm:table-column" />
        </colgroup>
        <thead>
          <tr className={cn(ruledRow, "text-left")}>
            <th scope="col" className={cn(th, "hidden pl-1 sm:table-cell")}>
              When
            </th>
            <th scope="col" className={cn(th, "pl-1 pr-2 sm:pl-2")}>
              Mode
            </th>
            <th scope="col" className={cn(th, "px-2 text-right")}>
              Score
            </th>
            <th
              scope="col"
              className={cn(th, "hidden pr-1 text-right sm:table-cell")}
            >
              Accuracy
            </th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => {
            const mode = getMode(r.modeId);
            const spec = mode?.spec ?? FORMATS[r.format];
            return (
              <tr key={r.id} className={ruledRow}>
                <td className="hidden h-11 pl-1 font-mono text-mono-sm text-muted-foreground sm:table-cell">
                  <time
                    dateTime={new Date(r.endedAt).toISOString()}
                    title={formatDateTime(r.endedAt)}
                  >
                    {relativeTime(r.endedAt, now)}
                  </time>
                </td>
                <td className="h-11 min-w-0 py-1.5 pl-1 pr-2 sm:pl-2">
                  <span className="block text-pretty leading-snug">
                    {modeLabel(r.modeId, r.format)}
                    {r.completed === false && (
                      <span className="smallcaps ml-2 text-[0.875rem]">
                        quit early
                      </span>
                    )}
                  </span>
                  <span className="block font-mono text-[0.75rem] text-muted-foreground sm:hidden">
                    {relativeTime(r.endedAt, now)}
                  </span>
                </td>
                <td className="h-11 whitespace-nowrap px-2 text-right font-mono text-mono-md">
                  {formatScore(spec, r.score)}
                </td>
                <td className="hidden h-11 pr-1 text-right font-mono text-mono-sm text-muted-foreground sm:table-cell">
                  {pct(r.accuracy)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {runs.length > count && (
        <Button
          variant="ghost"
          className="self-center"
          onClick={() => setCount((c) => c + 20)}
        >
          Show more runs
        </Button>
      )}
    </div>
  );
}

function LedgerSkeleton({ rows }: { rows: number }) {
  return (
    <div aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex h-11 items-center gap-4 border-b border-foreground/[0.12] px-1"
        >
          <Skeleton className="h-3 w-32 rounded-sm" />
          <Skeleton className="ml-auto h-3 w-14 rounded-sm" />
        </div>
      ))}
    </div>
  );
}
