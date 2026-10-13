/**
 * "/leaderboard" — the honour roll. A printed form line picks the board
 * (format, topic or day), and the board is a printed table: rank in
 * typewriter, name, score, accuracy, date. The signed-in player's row is
 * highlighted; notes on how ranking works sit in the margin.
 */
import { useMemo, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
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
import { formatDate, relativeTime } from "@/lib/timeFormat";
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

/** A labelled slot on the form line: small-caps label, then the control. */
function FormSlot({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  const Label = htmlFor ? "label" : "span";
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3",
        className,
      )}
    >
      <Label
        htmlFor={htmlFor}
        aria-hidden={htmlFor ? undefined : true}
        className="smallcaps shrink-0 text-[0.9375rem]"
      >
        {label}
      </Label>
      {children}
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
  const lowerBetter = spec.scoreOrder === "lower-better";

  const status = loading
    ? `Loading ${mode.name}`
    : error
      ? "Couldn’t load the leaderboard"
      : `${entries.length} ${entries.length === 1 ? "player" : "players"} on ${mode.name}`;

  return (
    <div className="container flex flex-col gap-8 py-10 md:gap-10 md:py-14">
      <PageHeader
        eyebrow="Leaderboard"
        folio="Top 50"
        title="Honour roll"
        lede="The best score in every ranked mode. Scores are checked for plausibility before they count."
        divider
        size="md"
      />

      {/* The form line */}
      <section
        aria-label="Choose a leaderboard"
        className="flex flex-col gap-4 border-b border-foreground/20 pb-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6"
      >
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
          <FormSlot label="Format">
            <Segmented
              aria-label="Format"
              id="lb-format"
              value={board}
              onValueChange={onBoard}
              options={BOARD_OPTIONS}
              className="w-full sm:w-auto [&>button]:shrink [&>button]:px-2 xs:[&>button]:px-3"
              fullWidth
            />
          </FormSlot>

          {(board === "sprint" || board === "speedrun") && (
            <FormSlot label="Topic" htmlFor="lb-topic">
              <Select
                value={topicId}
                onValueChange={(t) => setMode(`${t}:${board}`)}
              >
                <SelectTrigger
                  id="lb-topic"
                  className="h-11 sm:h-10 sm:w-56"
                >
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
            </FormSlot>
          )}

          {board === "daily" && (
            <FormSlot label="Day (UTC)" htmlFor="lb-date">
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
            </FormSlot>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isPastDaily && (
            <Button asChild variant="outline" className="flex-1 sm:flex-none">
              <Link to={playHref}>
                Play {board === "daily" ? "today’s daily" : "this mode"}
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

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14">
        <section aria-labelledby="lb-title" className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 id="lb-title" className="text-headline font-bold">
              {mode.name}
            </h2>
            <p className="text-body-sm text-muted-foreground text-pretty">
              {spec.summary}{" "}
              <span className="whitespace-nowrap text-foreground">
                {lowerBetter ? "Lower is better." : "Higher is better."}
              </span>
            </p>
          </div>

          <p className="sr-only" role="status" aria-live="polite">
            {status}
          </p>

          {!authLoading && isGuest && (
            <div className="lg:hidden">
              <GuestNote modeId={modeId} />
            </div>
          )}

          {loading ? (
            <TableSkeleton />
          ) : error ? (
            <EmptyState
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
              title={
                isPastDaily
                  ? "Nobody ranked on this day"
                  : "No scores yet. The top line is blank."
              }
              description={
                isPastDaily
                  ? "Daily challenges can only be ranked on their own day (UTC)."
                  : isGuest
                    ? "Create an account, then set the first score in this mode."
                    : "Set the first score in this mode and your name goes on the first line."
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

        <aside
          aria-label="How the board works"
          className="hidden flex-col gap-6 border-t border-foreground/20 pt-4 lg:flex"
        >
          {!authLoading && isGuest && <GuestNote modeId={modeId} />}
          <MarginNote label="Order">
            {lowerBetter
              ? "Fastest time first."
              : spec.scoreUnit === "cleared"
                ? "Most questions cleared first."
                : "Most correct answers first."}{" "}
            Ties go to whoever set the score first.
          </MarginNote>
          <MarginNote label="Entries">
            One line per player: your best score in this mode. A better run
            replaces it.
          </MarginNote>
          {board === "daily" && (
            <MarginNote label="Daily">
              One ranked attempt per player, on the day itself (UTC).
            </MarginNote>
          )}
        </aside>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function GuestNote({ modeId }: { modeId: string }) {
  return (
    <div role="note">
      <MarginNote label="Note">
        Guest runs stay on this device and aren’t ranked.{" "}
        <Link
          className="link"
          to={`/signup?next=${encodeURIComponent(`/leaderboard?mode=${modeId}`)}`}
        >
          Create a free account
        </Link>{" "}
        and your best scores go up here.
      </MarginNote>
    </div>
  );
}

function rankLabel(rank: number): string {
  return String(rank).padStart(2, "0");
}

const th = "smallcaps h-9 pb-1.5 align-bottom font-normal text-[0.9375rem]";
const td = "h-12 border-b border-foreground/[0.12]";

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
  return (
    <table className="w-full table-fixed border-collapse text-body tabular-nums">
      <caption className="sr-only">{caption}</caption>
      <colgroup>
        <col className="w-12 sm:w-16" />
        <col />
        <col className="w-[6.5rem] sm:w-32" />
        <col className="hidden w-24 sm:table-column" />
        <col className="hidden w-32 md:table-column" />
      </colgroup>
      <thead>
        <tr className="rule-double text-left">
          <th scope="col" className={cn(th, "pl-1")}>
            No.
          </th>
          <th scope="col" className={cn(th, "px-2")}>
            Name
          </th>
          <th scope="col" className={cn(th, "px-2 text-right")}>
            {unitLabel}
          </th>
          <th
            scope="col"
            className={cn(th, "hidden px-2 text-right sm:table-cell")}
          >
            Accuracy
          </th>
          <th
            scope="col"
            className={cn(th, "hidden pl-2 pr-1 text-right md:table-cell")}
          >
            Date
          </th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e, i) => (
          <Row
            key={e.uid}
            rank={rankLabel(i + 1)}
            entry={e}
            mine={e.uid === myUid}
            top={i < 3}
            format={format}
          />
        ))}
      </tbody>
      {pinned && <tfoot>{pinned}</tfoot>}
    </table>
  );
}

function Row({
  rank,
  entry,
  mine,
  top,
  format,
  className,
}: {
  rank: string;
  entry: LeaderboardEntry;
  mine: boolean;
  top?: boolean;
  format: (score: number) => string;
  className?: string;
}) {
  return (
    <tr aria-current={mine ? "true" : undefined} className={className}>
      <td
        className={cn(
          td,
          "pl-1 font-mono text-mono-sm",
          top || mine ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {rank}
      </td>
      <td className={cn(td, "min-w-0 px-2")}>
        <span className="flex min-w-0 items-baseline gap-2">
          <span
            className={cn(
              "truncate",
              mine && "highlighter font-bold text-foreground",
            )}
          >
            {entry.displayName || (mine ? "You" : "Player")}
          </span>
          {mine && (
            <span className="smallcaps shrink-0 text-[0.9375rem] text-primary">
              you
            </span>
          )}
        </span>
      </td>
      <td
        className={cn(
          td,
          "whitespace-nowrap px-2 text-right font-mono text-mono-md text-foreground",
        )}
      >
        {format(entry.score)}
      </td>
      <td
        className={cn(
          td,
          "hidden px-2 text-right font-mono text-mono-sm text-muted-foreground sm:table-cell",
        )}
      >
        {percent(entry.accuracy)}
      </td>
      <td
        className={cn(
          td,
          "hidden whitespace-nowrap pl-2 pr-1 text-right font-mono text-mono-sm text-muted-foreground md:table-cell",
        )}
      >
        {entry.updatedAt ? (
          <time
            dateTime={new Date(entry.updatedAt).toISOString()}
            title={relativeTime(entry.updatedAt)}
          >
            {formatDate(entry.updatedAt)}
          </time>
        ) : (
          "—"
        )}
      </td>
    </tr>
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
    <Row
      rank={rank === null ? "100+" : rankLabel(rank)}
      entry={entry}
      mine
      format={format}
      className="[&>td]:border-t-[3px] [&>td]:border-double [&>td]:border-t-foreground/50"
    />
  );
}

function TableSkeleton() {
  const widths = useMemo(
    () => Array.from({ length: 8 }, (_, i) => 30 + ((i * 37) % 40)),
    [],
  );
  return (
    <div aria-hidden data-testid="leaderboard-loading">
      <div className="rule-double h-9" />
      {widths.map((w, i) => (
        <div
          key={i}
          className="flex h-12 items-center gap-4 border-b border-foreground/[0.12] px-1"
        >
          <Skeleton className="h-3 w-6 rounded-sm" />
          <Skeleton className="h-3 rounded-sm" style={{ width: `${w}%` }} />
          <Skeleton className="ml-auto h-3 w-14 rounded-sm" />
        </div>
      ))}
    </div>
  );
}
