/**
 * /daily — today's numbered sheet: the ten rungs (topic names only), your
 * attempt (Start, or your time circled in red pen with your rank), today's
 * class results, and the time until the next sheet. Rolls over at 00:00 UTC
 * even when left open.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Kbd } from "@/components/ui/kbd";
import { PageHeader } from "@/components/ui/page-header";
import { PenCircle } from "@/components/ui/pen-mark";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useLeaderboard } from "@/data";
import {
  DAILY_LADDER,
  DAILY_QUESTION_COUNT,
  DAILY_SKIP_PENALTY_MS,
  dailyNumber,
  formatMs,
  getTopic,
} from "@/game";
import { sectionNumber } from "@/features/play/ContentsShared";
import { DailyRank } from "@/features/play/DailyStatus";
import { useDailyAttempts } from "@/features/play/useDailyAttempts";
import { msUntilUtcMidnight, useUtcDateKey } from "@/hooks/useUtcDateKey";
import { cn } from "@/lib/utils";

/** "Tuesday 13 October 2026" for a UTC date key. */
function longDate(key: string) {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function ResetCountdown() {
  const [left, setLeft] = useState(() => msUntilUtcMidnight());
  useEffect(() => {
    const t = window.setInterval(() => setLeft(msUntilUtcMidnight()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const s = Math.floor(left / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return (
    <p className="flex items-baseline gap-2 text-body-sm">
      <span className="text-muted-foreground">New sheet in</span>
      <span aria-hidden className="leader" />
      <span
        className="font-mono text-mono-md tabular-nums text-foreground"
        role="timer"
        aria-label={`${Number(hh)} hours ${Number(mm)} minutes until the next daily sheet`}
      >
        {hh}:{mm}:{ss}
      </span>
    </p>
  );
}

export default function Daily() {
  const navigate = useNavigate();
  const date = useUtcDateKey();
  const sheetNo = dailyNumber(date);
  const dailyId = `daily:${date}`;
  const playPath = `/play/${dailyId}`;
  const { first, attempts, loading } = useDailyAttempts(dailyId);
  const played = !!first;

  useEffect(() => {
    document.title = `Daily sheet No. ${sheetNo} · Based Math Game`;
  }, [sheetNo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.defaultPrevented || e.repeat) return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        t !== document.body &&
        t.closest("a,button,input,textarea,select,[role=dialog]")
      )
        return;
      e.preventDefault();
      navigate(playPath);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, playPath]);

  return (
    <div className="container flex max-w-[60rem] flex-col gap-10 py-10 md:gap-12 md:py-14">
      <PageHeader
        eyebrow="Daily sheet"
        folio={
          <time dateTime={date} data-testid="daily-date">
            {longDate(date)}
          </time>
        }
        title={<>Daily sheet No. {sheetNo}</>}
        lede={`Ten problems, the same for everyone today, one per rung from nibbles to ASCII. Your first attempt is ranked; each skip adds ${DAILY_SKIP_PENALTY_MS / 1000} s.`}
        divider
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-14">
        <div className="flex flex-col gap-10">
          <section aria-labelledby="your-daily" className="flex flex-col gap-5">
            <h2 id="your-daily" className="sr-only">
              Your attempt
            </h2>
            {loading ? (
              <Skeleton className="h-16 w-2/3" />
            ) : played ? (
              <div className="flex flex-col gap-3">
                <p className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <span className="sr-only">Your time: </span>
                  <PenCircle className="-ml-[0.32em]">
                    <span className="font-mono text-mono-2xl font-medium tabular-nums">
                      {(first.score / 1000).toFixed(2)}
                      <span className="ml-1 font-sans text-body text-muted-foreground">
                        s
                      </span>
                    </span>
                  </PenCircle>
                  <span className="font-sans text-label text-muted-foreground">
                    <DailyRank dailyId={dailyId} />
                  </span>
                </p>
                <p className="text-body-sm text-muted-foreground">
                  Ranked attempt done
                  {attempts.length > 1 &&
                    ` · ${attempts.length - 1} practice ${attempts.length === 2 ? "replay" : "replays"}`}
                  .
                </p>
              </div>
            ) : (
              <p className="max-w-[34rem] text-body text-muted-foreground">
                Not attempted yet. The clock starts after the countdown and
                stops on your tenth answer.
              </p>
            )}
            <div className="flex flex-col gap-3 xs:flex-row xs:items-center">
              <Button
                asChild
                size="xl"
                variant={played ? "outline" : "default"}
                className={cn(!played && "justify-between xs:min-w-[16rem]")}
              >
                <Link to={playPath}>
                  {played
                    ? "Replay (unranked)"
                    : `Start sheet No. ${sheetNo}`}
                  {!played && (
                    <Kbd
                      size="sm"
                      tone="inverse"
                      className="hidden pointer-fine:inline-flex"
                      aria-hidden
                    >
                      Enter ↵
                    </Kbd>
                  )}
                  {played && <ArrowRight aria-hidden />}
                </Link>
              </Button>
              {played && (
                <Button asChild variant="ghost">
                  <Link to="/play">Practise a topic instead</Link>
                </Button>
              )}
            </div>
          </section>

          <section aria-labelledby="ladder" className="flex flex-col gap-3">
            <h2
              id="ladder"
              className="border-b border-foreground/70 pb-2 font-serif text-title font-bold"
            >
              The ten problems
            </h2>
            <ol className="flex flex-col">
              {DAILY_LADDER.slice(0, DAILY_QUESTION_COUNT).map((topicId, i) => {
                const topic = getTopic(topicId);
                return (
                  <li
                    key={i}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline border-b border-primary/25 py-2.5"
                  >
                    <span className="font-mono text-mono-md tabular-nums text-primary">
                      {i + 1}.
                    </span>
                    <span className="text-body">{topic.name}</span>
                    <span className="font-mono text-[0.8125rem] text-muted-foreground">
                      <span className="sr-only">Contents section </span>§{" "}
                      {sectionNumber(topic)}
                    </span>
                  </li>
                );
              })}
            </ol>
            <ResetCountdown />
          </section>
        </div>

        <ClassResults dailyId={dailyId} />
      </div>
    </div>
  );
}

function ClassResults({ dailyId }: { dailyId: string }) {
  const { entries, me, loading, error, refresh } = useLeaderboard(dailyId, {
    limit: 10,
  });
  const { user } = useAuth();
  return (
    <section aria-labelledby="top-ten" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3 border-b border-foreground/70 pb-2">
        <h2 id="top-ten" className="font-serif text-title font-bold">
          Class results
        </h2>
        <Link
          to={`/leaderboard?mode=${encodeURIComponent(dailyId)}`}
          className="link text-body-sm"
        >
          Full board
        </Link>
      </div>
      {loading ? (
        <div
          className="flex flex-col gap-2"
          aria-busy="true"
          role="status"
          aria-label="Loading leaderboard"
        >
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          size="sm"
          title="Couldn't load the results"
          description="Check your connection."
          action={
            <Button variant="outline" size="sm" onClick={refresh}>
              Try again
            </Button>
          }
        />
      ) : entries.length === 0 ? (
        <EmptyState
          size="sm"
          title="No times yet today"
          description="Finish today's ten with an account and your time is entered here."
        />
      ) : (
        <table className="w-full border-collapse text-body-sm">
          <caption className="sr-only">Today's top ten times</caption>
          <thead className="rule-double">
            <tr className="smallcaps">
              <th scope="col" className="w-10 pb-1 text-left font-medium">
                No.
              </th>
              <th scope="col" className="pb-1 text-left font-medium">
                Name
              </th>
              <th scope="col" className="pb-1 text-right font-medium">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => {
              const mine = e.uid === user?.uid;
              return (
                <tr key={e.uid} className="border-b border-border">
                  <td className="py-2 font-mono text-[0.8125rem] tabular-nums text-muted-foreground">
                    {i + 1}
                  </td>
                  <td className="max-w-0 truncate py-2 pr-3">
                    <span className={cn(mine && "highlighter")}>
                      {e.displayName || "Player"}
                    </span>
                    {mine && (
                      <span className="ml-1.5 font-sans text-[0.75rem] text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-right font-mono text-[0.875rem] tabular-nums">
                    {formatMs(e.score)}
                  </td>
                </tr>
              );
            })}
            {me && me.rank !== null && me.rank > entries.length && (
              <tr className="border-t-2 border-dotted border-foreground/30">
                <td className="py-2 font-mono text-[0.8125rem] tabular-nums text-muted-foreground">
                  {me.rank}
                </td>
                <td className="py-2 pr-3">
                  <span className="highlighter">You</span>
                </td>
                <td className="py-2 text-right font-mono text-[0.875rem] tabular-nums">
                  {formatMs(me.entry.score)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
