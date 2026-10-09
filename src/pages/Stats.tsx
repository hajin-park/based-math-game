import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CloudOff, History, Play, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { statValueVariants } from "@/components/ui/stat";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendChart } from "@/components/charts/TrendChart";
import { ActivityStrip } from "@/components/charts/ActivityStrip";
import { useAuth } from "@/contexts/AuthContext";
import { GUEST_RUN_LIMIT, useRunHistory, useUserStats, type RunRecord } from "@/data";
import { FORMATS, formatScore, getMode } from "@/game";
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

function pct(n: number | null | undefined): string {
  return n === null || n === undefined ? "—" : `${Math.round(n * 100)}%`;
}

function SectionTitle({
  id,
  title,
  meta,
}: {
  id: string;
  title: string;
  meta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-3">
      <h2 id={id} className="text-headline font-serif">
        {title}
      </h2>
      {meta && <p className="text-body-sm text-muted-foreground">{meta}</p>}
    </div>
  );
}

export default function Stats() {
  const { isGuest, loading: authLoading } = useAuth();
  const { stats, loading: statsLoading, error: statsError } = useUserStats();
  const {
    runs,
    loading: runsLoading,
    error: runsError,
    refresh,
  } = useRunHistory({ limit: HISTORY_LIMIT });

  const loading = authLoading || statsLoading || runsLoading;
  const error = statsError || runsError;

  const derived = useMemo(() => {
    const now = Date.now();
    return {
      streak: dayStreak(runs, now),
      activity: activityByDay(runs, 14, now),
      topics: topicBreakdown(runs),
      pace: paceTrend(runs, 30),
      bests: bestsList(stats.bests || {}),
      daily: dailySummary(stats.bests || {}),
    };
  }, [runs, stats.bests]);

  const practice = formatPracticeTime(stats.totalDurationMs);
  const empty = !loading && !error && stats.gamesPlayed === 0 && runs.length === 0;

  return (
    <div className="container flex flex-col gap-10 py-10 md:gap-14 md:py-14">
      <PageHeader
        eyebrow="Stats"
        title={
          <>
            Your <em>numbers</em>
          </>
        }
        lede="Every run you finish, where you’re fast, and where a little practice would pay off."
        divider
        size="md"
      />

      {!authLoading && isGuest && (
        <div
          role="note"
          className="flex flex-col gap-3 rounded-lg border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <div className="flex gap-3">
            <CloudOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="flex flex-col gap-0.5">
              <p className="text-[0.9375rem] font-semibold">
                Saved on this device. Create an account to keep them.
              </p>
              <p className="text-body-sm text-muted-foreground">
                Guest stats cover your last {GUEST_RUN_LIMIT} runs in this
                browser and disappear if you clear its data.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link to="/signup?next=%2Fstats">Create an account</Link>
          </Button>
        </div>
      )}

      {error ? (
        <EmptyState
          icon={<RotateCw />}
          title="Couldn’t load your stats"
          description="Check your connection, then try again."
          action={
            <Button variant="outline" onClick={refresh}>
              Try again
            </Button>
          }
        />
      ) : empty ? (
        <section aria-labelledby="empty-title">
        <h2 id="empty-title" className="sr-only">Your runs</h2>
        <EmptyState
          icon={<History />}
          title="No runs yet"
          description="Finish a sprint and your scores, pace and personal bests show up here."
          action={
            <Button asChild>
              <Link to="/play">
                Start a sprint
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          }
        />
        </section>
      ) : (
        <>
          {/* Overview */}
          <section aria-labelledby="overview-title" className="flex flex-col gap-5">
            <h2 id="overview-title" className="sr-only">
              Overview
            </h2>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-4">
              {loading ? (
                Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="flex flex-col gap-3 bg-card p-4 sm:p-5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                ))
              ) : (
                <>
                  <OverviewTile label="Runs" value={nf.format(stats.gamesPlayed)} />
                  <OverviewTile
                    label="Correct answers"
                    value={nf.format(stats.totalCorrect)}
                  />
                  <OverviewTile
                    label="Time practiced"
                    value={practice.value}
                    unit={practice.unit}
                  />
                  <OverviewTile
                    label="Day streak"
                    value={String(derived.streak.current)}
                    unit={derived.streak.current === 1 ? "day" : "days"}
                    hint={
                      derived.streak.current > 0 && !derived.streak.playedToday
                        ? "Play today to keep it"
                        : undefined
                    }
                  />
                </>
              )}
            </dl>
            {!loading && (
              <div className="rounded-lg border bg-card p-4 sm:p-5">
                <p className="mb-3 text-label text-muted-foreground">
                  Correct answers per day
                </p>
                <ActivityStrip days={derived.activity} />
              </div>
            )}
          </section>

          {/* Pace trend */}
          <section aria-labelledby="pace-title" className="flex flex-col gap-5">
            <SectionTitle
              id="pace-title"
              title="Pace"
              meta="Correct answers per minute, last 30 timed runs"
            />
            {loading ? (
              <Skeleton className="h-[168px] w-full" />
            ) : derived.pace.length < 2 ? (
              <EmptyState
                size="sm"
                icon={<History />}
                title="Not enough timed runs yet"
                description="Your pace line appears after two sprints, speedruns or survival runs."
              />
            ) : (
              <div className="rounded-lg border bg-card p-4 sm:p-5">
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
                />
              </div>
            )}
          </section>

          {/* Topics */}
          <section aria-labelledby="topics-title" className="flex flex-col gap-5">
            <SectionTitle
              id="topics-title"
              title="By topic"
              meta="Slowest first. Seconds per correct answer."
            />
            {loading ? (
              <ListSkeleton rows={4} />
            ) : derived.topics.length === 0 ? (
              <EmptyState
                size="sm"
                icon={<History />}
                title="No topics yet"
                description="Play any topic and it shows up here with your accuracy and pace."
              />
            ) : (
              <TopicTable rows={derived.topics} />
            )}
          </section>

          {/* Personal bests */}
          <section aria-labelledby="bests-title" className="flex flex-col gap-5">
            <SectionTitle
              id="bests-title"
              title="Personal bests"
              meta={
                derived.daily.played > 0 && derived.daily.bestMs !== null ? (
                  <>
                    Daily: {derived.daily.played} played, best{" "}
                    <span className="font-mono text-foreground">
                      {formatScore(FORMATS.daily, derived.daily.bestMs)}
                    </span>
                  </>
                ) : undefined
              }
            />
            {loading ? (
              <ListSkeleton rows={3} />
            ) : derived.bests.length === 0 ? (
              <EmptyState
                size="sm"
                icon={<History />}
                title="No personal bests yet"
                description="Finish a sprint, speedrun or survival run to set one."
              />
            ) : (
              <div className="overflow-hidden rounded-lg border bg-card">
                <table className="w-full table-fixed border-collapse text-body-sm tabular-nums">
                  <caption className="sr-only">Personal best per mode</caption>
                  <colgroup>
                    <col />
                    <col className="w-[7.25rem] sm:w-32" />
                    <col className="hidden w-24 sm:table-column" />
                    <col className="hidden w-32 md:table-column" />
                    <col className="w-14 sm:w-16" />
                  </colgroup>
                  <thead className="bg-sunken/60">
                    <tr className="border-b border-border-strong text-left text-[0.75rem] font-medium text-muted-foreground">
                      <th scope="col" className="h-10 pl-4 sm:pl-5">Mode</th>
                      <th scope="col" className="h-10 px-3 text-right">Best</th>
                      <th scope="col" className="hidden h-10 px-3 text-right sm:table-cell">Accuracy</th>
                      <th scope="col" className="hidden h-10 px-3 text-right md:table-cell">Set</th>
                      <th scope="col" className="h-10 pr-3 sm:pr-4">
                        <span className="sr-only">Play</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {derived.bests.map(({ modeId, mode, best }) => (
                      <tr key={modeId} className="border-b last:border-b-0">
                        <td className="h-12 min-w-0 pl-4 sm:pl-5">
                          <span className="block py-1 text-pretty leading-snug">{mode.name}</span>
                        </td>
                        <td className="h-12 whitespace-nowrap px-3 text-right font-mono text-[0.875rem]">
                          {formatScore(mode.spec, best.score)}
                        </td>
                        <td className="hidden h-12 px-3 text-right font-mono text-[0.8125rem] text-muted-foreground sm:table-cell">
                          {pct(best.accuracy)}
                        </td>
                        <td className="hidden h-12 whitespace-nowrap px-3 text-right text-[0.8125rem] text-muted-foreground md:table-cell">
                          {formatDate(best.endedAt)}
                        </td>
                        <td className="h-12 pr-2 text-right sm:pr-3">
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
              </div>
            )}
          </section>

          {/* Recent runs */}
          <section aria-labelledby="recent-title" className="flex flex-col gap-5">
            <SectionTitle
              id="recent-title"
              title="Recent runs"
              meta={
                runs.length
                  ? `${runs.length}${runs.length >= HISTORY_LIMIT ? "+" : ""} ${runs.length === 1 ? "run" : "runs"} ${isGuest ? "on this device" : "saved"}`
                  : undefined
              }
            />
            {loading ? (
              <ListSkeleton rows={5} />
            ) : (
              <RecentRuns runs={runs} />
            )}
          </section>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function OverviewTile({
  label,
  value,
  unit,
  hint,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 bg-card p-4 sm:p-5">
      <dt className="truncate text-label text-muted-foreground">{label}</dt>
      <dd className="flex flex-col gap-1">
        <span className="flex items-baseline gap-1">
          <span className={statValueVariants({ size: "md" })}>{value}</span>
          {unit && (
            <span className="font-mono text-[0.8125rem] text-muted-foreground">
              {unit}
            </span>
          )}
        </span>
        {hint && <span className="text-[0.75rem] text-muted-foreground">{hint}</span>}
      </dd>
    </div>
  );
}

function TopicTable({ rows }: { rows: TopicRow[] }) {
  const maxPace = Math.max(...rows.map((r) => r.secondsPerAnswer ?? 0), 1);
  const slowest = rows.filter((r) => r.secondsPerAnswer !== null).slice(0, 2);
  return (
    <ol className="flex flex-col overflow-hidden rounded-lg border bg-card">
      {rows.map((r) => {
        const isSlow = slowest.includes(r) && rows.length > 2;
        const width = r.secondsPerAnswer ? (r.secondsPerAnswer / maxPace) * 100 : 0;
        return (
          <li
            key={r.topicId}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b px-4 py-3 last:border-b-0 sm:px-5 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_5rem_9rem]"
          >
            <div className="min-w-0">
              <p className="truncate text-[0.9375rem] font-medium">{r.name}</p>
              <p className="text-[0.75rem] tabular-nums text-muted-foreground">
                {r.runs} {r.runs === 1 ? "run" : "runs"} · {pct(r.accuracy)} accuracy
              </p>
              {isSlow && (
                <p className="text-[0.75rem] font-medium text-warning">
                  Among your slowest
                </p>
              )}
            </div>
            <div className="col-start-1 row-start-2 flex items-center gap-3 md:col-start-auto md:row-start-auto">
              <div
                className="h-2 flex-1 overflow-hidden rounded-full bg-sunken"
                aria-hidden
              >
                <div
                  className={cn(
                    "h-full rounded-full",
                    isSlow ? "bg-warning" : "bg-foreground/70",
                  )}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
            <p className="text-right font-mono text-[0.9375rem] tabular-nums md:order-none">
              {r.secondsPerAnswer !== null ? r.secondsPerAnswer.toFixed(1) : "—"}
              <span className="ml-0.5 text-[0.75rem] text-muted-foreground">s</span>
              <span className="sr-only"> per correct answer</span>
            </p>
            <div className="col-start-2 row-start-2 flex items-center justify-end md:col-start-auto md:row-start-auto">
              {r.practiceModeId ? (
                <Button
                  asChild
                  variant={isSlow ? "outline" : "ghost"}
                  size="sm"
                  className="pointer-coarse:h-10"
                >
                  <Link
                    to={`/play?mode=${encodeURIComponent(r.practiceModeId)}`}
                    aria-label={`Practice ${r.name}`}
                  >
                    Practice this
                  </Link>
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function RecentRuns({ runs }: { runs: RunRecord[] }) {
  const [count, setCount] = useState(10);
  if (!runs.length) {
    return (
      <EmptyState
        size="sm"
        icon={<History />}
        title="No runs yet"
        description="Finished runs appear here, newest first."
      />
    );
  }
  const now = Date.now();
  const shown = runs.slice(0, count);
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full table-fixed border-collapse text-body-sm tabular-nums">
          <caption className="sr-only">Recent runs, newest first</caption>
          <colgroup>
            <col className="hidden w-36 sm:table-column" />
            <col />
            <col className="w-[7.25rem] sm:w-32" />
            <col className="hidden w-24 sm:table-column" />
          </colgroup>
          <thead className="bg-sunken/60">
            <tr className="border-b border-border-strong text-left text-[0.75rem] font-medium text-muted-foreground">
              <th scope="col" className="hidden h-10 pl-5 sm:table-cell">When</th>
              <th scope="col" className="h-10 pl-4 pr-2 sm:pl-2">Mode</th>
              <th scope="col" className="h-10 px-3 text-right">Score</th>
              <th scope="col" className="hidden h-10 pr-5 text-right sm:table-cell">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const mode = getMode(r.modeId);
              const spec = mode?.spec ?? FORMATS[r.format];
              return (
                <tr key={r.id} className="border-b last:border-b-0">
                  <td className="hidden h-12 pl-5 text-[0.8125rem] text-muted-foreground sm:table-cell">
                    <time dateTime={new Date(r.endedAt).toISOString()} title={formatDateTime(r.endedAt)}>
                      {relativeTime(r.endedAt, now)}
                    </time>
                  </td>
                  <td className="h-12 min-w-0 py-2 pl-4 pr-2 sm:pl-2">
                    <span className="block text-pretty leading-snug">{modeLabel(r.modeId, r.format)}</span>
                    <span className="block text-[0.75rem] text-muted-foreground">
                      <span className="sm:hidden">{relativeTime(r.endedAt, now)}</span>
                      {r.completed === false && (
                        <>
                          <span className="sm:hidden"> · </span>Quit early
                        </>
                      )}
                    </span>
                  </td>
                  <td className="h-12 whitespace-nowrap px-3 text-right font-mono text-[0.875rem]">
                    {formatScore(spec, r.score)}
                  </td>
                  <td className="hidden h-12 pr-5 text-right font-mono text-[0.8125rem] text-muted-foreground sm:table-cell">
                    {pct(r.accuracy)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex h-14 items-center gap-4 border-b px-4 last:border-b-0 sm:px-5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="ml-auto h-3.5 w-16" />
        </div>
      ))}
    </div>
  );
}
