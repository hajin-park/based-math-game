import { useMemo, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Trophy,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useLeaderboard, type LeaderboardEntry } from "@/data";
import {
  TIERS,
  dailyDateOf,
  formatScore,
  getMode,
  isRankedModeId,
  isValidDateKey,
  parseModeId,
  topicsInTier,
  utcDateKey,
  type GameMode,
  type TopicId,
} from "@/game";
import { relativeTime } from "@/lib/timeFormat";
import { cn } from "@/lib/utils";

type Board = "sprint" | "speedrun" | "survival" | "daily";

const BOARD_OPTIONS: { value: Board; label: string }[] = [
  { value: "sprint", label: "Sprint" },
  { value: "speedrun", label: "Speedrun" },
  { value: "survival", label: "Survival" },
  { value: "daily", label: "Daily" },
];

const TIER_LABEL: Record<string, string> = {
  foundations: "Foundations",
  core: "Core",
  advanced: "Advanced",
  applied: "Applied",
};

const DEFAULT_TOPIC: TopicId = "nibbles";
const DEFAULT_MODE = `${DEFAULT_TOPIC}:sprint`;
const DAY_MS = 24 * 3600_000;

function shiftDay(key: string, days: number): string {
  const t = Date.parse(`${key}T00:00:00Z`) + days * DAY_MS;
  return utcDateKey(new Date(t));
}

/** Resolves `?mode=` to a ranked mode id (future dailies fall back to today). */
function resolveModeId(raw: string | null, today: string): string {
  if (!raw) return DEFAULT_MODE;
  if (raw === "daily") return `daily:${today}`;
  const date = dailyDateOf(raw);
  if (date) return date > today ? `daily:${today}` : raw;
  return isRankedModeId(raw) ? raw : DEFAULT_MODE;
}

const UNIT_LABEL: Record<string, string> = {
  correct: "Correct",
  ms: "Time",
  cleared: "Cleared",
};

function percent(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export default function Leaderboard() {
  const [params, setParams] = useSearchParams();
  const today = utcDateKey();
  const modeId = resolveModeId(params.get("mode"), today);
  const mode = getMode(modeId) as GameMode;
  const parsed = parseModeId(modeId)!;
  const board: Board =
    parsed.format === "survival" || parsed.format === "daily"
      ? parsed.format
      : (parsed.format as Board);
  const topicId: TopicId =
    board === "sprint" || board === "speedrun" ? parsed.topicId : DEFAULT_TOPIC;
  const dailyDate = parsed.date ?? today;

  const { user, isGuest, loading: authLoading } = useAuth();
  const { entries, me, loading, error, refresh } = useLeaderboard(modeId, {
    limit: 50,
  });

  const setMode = (id: string) => {
    const next = new URLSearchParams(params);
    next.set("mode", id);
    setParams(next, { replace: true });
  };

  const onBoard = (b: Board) => {
    if (b === "survival") setMode("survival");
    else if (b === "daily") setMode(`daily:${today}`);
    else setMode(`${topicId}:${b}`);
  };

  const spec = mode.spec;
  const unit = UNIT_LABEL[spec.scoreUnit] ?? "Score";
  const myUid = user && !isGuest ? user.uid : null;
  const myIndex = myUid ? entries.findIndex((e) => e.uid === myUid) : -1;
  const pinned = myIndex === -1 && me ? me : null;
  const playHref = `/play?mode=${encodeURIComponent(modeId)}`;
  const isPastDaily = board === "daily" && dailyDate < today;

  const status = loading
    ? `Loading ${mode.name}`
    : error
      ? "Couldn’t load the leaderboard"
      : `${entries.length} ${entries.length === 1 ? "player" : "players"} on ${mode.name}`;

  return (
    <div className="container flex flex-col gap-8 py-10 md:gap-10 md:py-14">
      <PageHeader
        eyebrow="Leaderboard"
        title={
          <>
            Fastest <em>hands</em>
          </>
        }
        lede="The top 50 in every ranked mode. Scores are checked for plausibility before they count."
        divider
        size="md"
      />

      {/* Filters */}
      <section
        aria-label="Choose a leaderboard"
        className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-label text-muted-foreground" aria-hidden>
              Format
            </span>
            <Segmented
              aria-label="Format"
              id="lb-format"
              value={board}
              onValueChange={onBoard}
              options={BOARD_OPTIONS}
              className="w-full sm:w-auto [&>button]:shrink [&>button]:px-2 xs:[&>button]:px-3"
              fullWidth
            />
          </div>

          {(board === "sprint" || board === "speedrun") && (
            <div className="flex min-w-0 flex-col gap-2 sm:w-64">
              <label htmlFor="lb-topic" className="text-label text-muted-foreground">
                Topic
              </label>
              <Select
                value={topicId}
                onValueChange={(t) => setMode(`${t}:${board}`)}
              >
                <SelectTrigger id="lb-topic" className="h-11 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIERS.map((tier) => (
                    <SelectGroup key={tier}>
                      <SelectLabel>{TIER_LABEL[tier]}</SelectLabel>
                      {topicsInTier(tier)
                        .filter((t) => t.id !== "custom")
                        .map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {board === "daily" && (
            <div className="flex min-w-0 flex-col gap-2">
              <label htmlFor="lb-date" className="text-label text-muted-foreground">
                Day (UTC)
              </label>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="pointer-coarse:size-11"
                  aria-label="Previous day"
                  onClick={() => setMode(`daily:${shiftDay(dailyDate, -1)}`)}
                >
                  <ChevronLeft />
                </Button>
                <Input
                  id="lb-date"
                  type="date"
                  value={dailyDate}
                  max={today}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (isValidDateKey(v) && v <= today) setMode(`daily:${v}`);
                  }}
                  className="w-auto min-w-0 flex-1 font-mono tabular-nums pointer-coarse:h-11 sm:w-44 sm:flex-none"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="pointer-coarse:size-11"
                  aria-label="Next day"
                  disabled={dailyDate >= today}
                  onClick={() => setMode(`daily:${shiftDay(dailyDate, 1)}`)}
                >
                  <ChevronRight />
                </Button>
                {dailyDate !== today && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 pointer-coarse:h-11"
                    onClick={() => setMode(`daily:${today}`)}
                  >
                    Today
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isPastDaily && (
            <Button asChild variant="outline" className="flex-1 sm:flex-none">
              <Link to={playHref}>
                Play {board === "daily" ? "today’s daily" : mode.name}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh leaderboard"
            onClick={refresh}
            disabled={loading}
          >
            <RotateCw className={cn(loading && "motion-safe:animate-spin")} />
          </Button>
        </div>
      </section>

      <section aria-labelledby="lb-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-3">
          <h2 id="lb-title" className="text-title font-semibold">
            {mode.name}
          </h2>
          <p className="text-body-sm text-muted-foreground">
            {spec.summary}{" "}
            <span className="whitespace-nowrap text-foreground">
              {spec.scoreOrder === "lower-better"
                ? "Lower is better."
                : "Higher is better."}
            </span>
          </p>
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {status}
        </p>

        {!authLoading && isGuest && (
          <Alert variant="info" role="note">
            <UserRound aria-hidden />
            <p className="mb-1 text-[0.9375rem] font-semibold leading-snug">
              Create an account to appear here
            </p>
            <AlertDescription>
              Guest runs are saved on this device only and aren’t ranked.{" "}
              <Link
                className="link"
                to={`/signup?next=${encodeURIComponent(`/leaderboard?mode=${modeId}`)}`}
              >
                Create a free account
              </Link>{" "}
              and your best scores go up here.
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <EmptyState
            icon={<RotateCw />}
            title="Couldn’t load the leaderboard"
            description="Check your connection, then try again."
            action={
              <Button variant="outline" onClick={refresh}>
                Try again
              </Button>
            }
          />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<Trophy />}
            title={
              isPastDaily
                ? "Nobody ranked on this day"
                : "No scores yet. The top spot is open."
            }
            description={
              isPastDaily
                ? "Daily challenges can only be ranked on their own day (UTC)."
                : isGuest
                  ? "Create an account, then set the first score in this mode."
                  : "Set the first score in this mode and it shows up here."
            }
            action={
              isPastDaily ? (
                <Button onClick={() => setMode(`daily:${today}`)}>
                  See today’s daily
                </Button>
              ) : (
                <Button asChild>
                  <Link to={playHref}>
                    Play {mode.name}
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              )
            }
          />
        ) : (
          <LeaderboardTable
            entries={entries}
            myUid={myUid}
            unitLabel={unit}
            format={(s) => formatScore(spec, s)}
            caption={`Top ${entries.length} on ${mode.name}`}
            pinned={
              pinned ? (
                <PinnedRow
                  rank={pinned.rank}
                  entry={pinned.entry}
                  format={(s) => formatScore(spec, s)}
                />
              ) : null
            }
          />
        )}

        {!loading && !error && myUid && myIndex === -1 && !me && (
          <p className="text-body-sm text-muted-foreground">
            You haven’t set a score in this mode yet.{" "}
            {!isPastDaily && (
              <Link className="link" to={playHref}>
                Play it now
              </Link>
            )}
          </p>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function rankLabel(rank: number): string {
  return String(rank).padStart(2, "0");
}

function LeaderboardTable({
  entries,
  myUid,
  unitLabel,
  format,
  caption,
  pinned,
}: {
  entries: LeaderboardEntry[];
  myUid: string | null;
  unitLabel: string;
  format: (score: number) => string;
  caption: string;
  pinned: ReactNode;
}) {
  const now = useMemo(() => Date.now(), []);
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full table-fixed border-collapse text-body-sm tabular-nums">
        <caption className="sr-only">{caption}</caption>
        <colgroup>
          <col className="w-12 sm:w-16" />
          <col />
          <col className="w-[7.25rem] sm:w-32" />
          <col className="hidden w-24 sm:table-column" />
          <col className="hidden w-36 md:table-column" />
        </colgroup>
        <thead className="bg-sunken/60">
          <tr className="border-b border-border-strong text-left text-[0.75rem] font-medium text-muted-foreground">
            <th scope="col" className="h-10 pl-3 sm:pl-5">
              Rank
            </th>
            <th scope="col" className="h-10 px-2">
              Player
            </th>
            <th scope="col" className="h-10 px-3 text-right">
              {unitLabel}
            </th>
            <th
              scope="col"
              className="hidden h-10 px-3 text-right sm:table-cell"
            >
              Accuracy
            </th>
            <th
              scope="col"
              className="hidden h-10 pr-5 text-right md:table-cell"
            >
              Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const mine = e.uid === myUid;
            return (
              <tr
                key={e.uid}
                aria-current={mine ? "true" : undefined}
                className={cn(
                  "border-b last:border-b-0",
                  mine && "bg-primary/[0.06]",
                )}
              >
                <td
                  className={cn(
                    "h-12 pl-3 font-mono text-[0.8125rem] sm:pl-5",
                    i < 3 ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {rankLabel(i + 1)}
                </td>
                <td className="h-12 min-w-0 px-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate">
                      {e.displayName || "Player"}
                    </span>
                    {mine && (
                      <span className="shrink-0 text-[0.75rem] font-medium text-primary">
                        you
                      </span>
                    )}
                  </span>
                </td>
                <td className="h-12 whitespace-nowrap px-3 text-right font-mono text-[0.875rem] text-foreground">
                  {format(e.score)}
                </td>
                <td className="hidden h-12 px-3 text-right font-mono text-[0.8125rem] text-muted-foreground sm:table-cell">
                  {percent(e.accuracy)}
                </td>
                <td className="hidden h-12 whitespace-nowrap pr-5 text-right text-[0.8125rem] text-muted-foreground md:table-cell">
                  <time dateTime={new Date(e.updatedAt).toISOString()}>
                    {relativeTime(e.updatedAt, now)}
                  </time>
                </td>
              </tr>
            );
          })}
        </tbody>
        {pinned && <tfoot>{pinned}</tfoot>}
      </table>
    </div>
  );
}

function PinnedRow({
  rank,
  entry,
  format,
}: {
  rank: number | null;
  entry: LeaderboardEntry;
  format: (score: number) => string;
}) {
  return (
    <tr
      aria-current="true"
      className="border-t-2 border-border-strong bg-primary/[0.06]"
    >
      <td className="h-12 pl-3 font-mono text-[0.8125rem] text-foreground sm:pl-5">
        {rank === null ? "100+" : rankLabel(rank)}
      </td>
      <td className="h-12 min-w-0 px-2">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate">{entry.displayName || "You"}</span>
          <span className="shrink-0 text-[0.75rem] font-medium text-primary">
            you
          </span>
        </span>
      </td>
      <td className="h-12 whitespace-nowrap px-3 text-right font-mono text-[0.875rem]">
        {format(entry.score)}
      </td>
      <td className="hidden h-12 px-3 text-right font-mono text-[0.8125rem] text-muted-foreground sm:table-cell">
        {percent(entry.accuracy)}
      </td>
      <td className="hidden h-12 whitespace-nowrap pr-5 text-right text-[0.8125rem] text-muted-foreground md:table-cell">
        {relativeTime(entry.updatedAt)}
      </td>
    </tr>
  );
}

function TableSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg border bg-card"
      aria-hidden
      data-testid="leaderboard-loading"
    >
      <div className="h-10 border-b border-border-strong bg-sunken/60" />
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="flex h-12 items-center gap-4 border-b px-3 last:border-b-0 sm:px-5"
        >
          <Skeleton className="h-3.5 w-6" />
          <Skeleton className="h-3.5 flex-1 sm:max-w-48" />
          <Skeleton className="ml-auto h-3.5 w-16" />
        </div>
      ))}
    </div>
  );
}

