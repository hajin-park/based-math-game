/**
 * /daily — today's challenge: the ten rungs, the rules, your status, today's
 * top ten and a countdown to the next UTC reset.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Kbd } from "@/components/ui/kbd";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useLeaderboard } from "@/data";
import {
  DAILY_LADDER,
  DAILY_QUESTION_COUNT,
  DAILY_SKIP_PENALTY_MS,
  formatMs,
  getTopic,
  utcDateKey,
} from "@/game";
import { DailyRank } from "@/features/play/DailyStatus";
import { useDailyAttempts } from "@/features/play/useDailyAttempts";
import { cn } from "@/lib/utils";

function msUntilUtcMidnight(now = Date.now()): number {
  const d = new Date(now);
  const next = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate() + 1,
  );
  return next - now;
}

function ResetCountdown() {
  const [left, setLeft] = useState(msUntilUtcMidnight);
  useEffect(() => {
    const t = window.setInterval(() => setLeft(msUntilUtcMidnight()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const s = Math.floor(left / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return (
    <p className="flex items-baseline justify-between gap-3 text-body-sm">
      <span className="text-muted-foreground">New set in</span>
      <span
        className="font-mono tabular-nums text-foreground"
        role="timer"
        aria-label={`${Number(hh)} hours ${Number(mm)} minutes until the next daily`}
      >
        {hh}:{mm}:{ss}
      </span>
    </p>
  );
}

export default function Daily() {
  const navigate = useNavigate();
  const date = utcDateKey();
  const dailyId = `daily:${date}`;
  const playPath = `/play/${dailyId}`;
  const { first, attempts, loading } = useDailyAttempts(dailyId);
  const played = !!first;

  useEffect(() => {
    document.title = "Daily challenge · Based Math Game";
  }, []);

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
    <div className="container flex flex-col gap-10 py-10 md:gap-14 md:py-14">
      <PageHeader
        eyebrow={<>Daily challenge · {date} UTC</>}
        title={
          <>
            Ten questions. <em>Same</em> for everyone.
          </>
        }
        lede={`One rung per topic, from nibbles to ASCII. Your first attempt today is ranked; each skip adds ${DAILY_SKIP_PENALTY_MS / 1000} s to your time.`}
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
        <div className="flex flex-col gap-10">
          <section
            aria-labelledby="your-daily"
            className="flex flex-col gap-5 rounded-xl border bg-card p-5 shadow-xs sm:p-6"
          >
            <h2 id="your-daily" className="eyebrow">
              Your daily
            </h2>
            {loading ? (
              <Skeleton className="h-12 w-2/3" />
            ) : played ? (
              <div className="flex flex-col gap-1.5">
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-mono text-[2.5rem] font-medium leading-none tabular-nums">
                    {(first.score / 1000).toFixed(2)}
                    <span className="ml-1 font-sans text-body text-muted-foreground">
                      s
                    </span>
                  </span>
                  <span className="text-body-sm text-muted-foreground">
                    <DailyRank dailyId={dailyId} />
                  </span>
                </p>
                <p className="flex items-center gap-1.5 text-body-sm text-muted-foreground">
                  <Check aria-hidden className="size-4 text-success" />
                  Ranked attempt done
                  {attempts.length > 1 &&
                    ` · ${attempts.length - 1} practice ${attempts.length === 2 ? "replay" : "replays"}`}
                  .
                </p>
              </div>
            ) : (
              <p className="text-body text-muted-foreground">
                Not played yet today. The clock starts after the countdown and
                stops on your tenth answer.
              </p>
            )}
            <div className="flex flex-col gap-3 xs:flex-row xs:items-center">
              <Button
                asChild
                size="xl"
                variant={played ? "outline" : "default"}
              >
                <Link to={playPath}>
                  {played ? "Replay (unranked)" : "Start today's daily"}
                  {!played && (
                    <Kbd
                      size="sm"
                      tone="inverse"
                      className="hidden pointer-fine:inline-flex"
                      aria-hidden
                    >
                      ↵
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

          <section aria-labelledby="ladder" className="flex flex-col gap-4">
            <h2 id="ladder" className="font-serif text-headline">
              The ladder
            </h2>
            <ol className="grid gap-x-8 sm:grid-cols-2">
              {DAILY_LADDER.slice(0, DAILY_QUESTION_COUNT).map((topicId, i) => (
                <li
                  key={i}
                  className="flex items-baseline gap-3 border-b py-2.5"
                >
                  <span className="w-6 font-mono text-[0.75rem] tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-body-sm">{getTopic(topicId).name}</span>
                </li>
              ))}
            </ol>
            <ResetCountdown />
          </section>
        </div>

        <TopTen dailyId={dailyId} />
      </div>
    </div>
  );
}

function TopTen({ dailyId }: { dailyId: string }) {
  const { entries, me, loading, error, refresh } = useLeaderboard(dailyId, {
    limit: 10,
  });
  const { user } = useAuth();
  return (
    <section aria-labelledby="top-ten" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="top-ten" className="font-serif text-headline">
          Today's top ten
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
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          size="sm"
          title="Couldn't load the board"
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
          icon={<Trophy />}
          title="No times yet today"
          description="Finish today's ten with an account and your time lands here."
        />
      ) : (
        <ol className="flex flex-col">
          {entries.map((e, i) => {
            const mine = e.uid === user?.uid;
            return (
              <li
                key={e.uid}
                className={cn(
                  "flex items-center gap-3 border-b px-2 py-2.5 last:border-0",
                  mine && "bg-primary/[0.06]",
                )}
              >
                <span className="w-6 font-mono text-[0.75rem] tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-body-sm">
                  {e.displayName || "Player"}
                  {mine && (
                    <span className="ml-2 text-[0.75rem] font-medium text-foreground">
                      you
                    </span>
                  )}
                </span>
                <span className="font-mono text-body-sm tabular-nums">
                  {formatMs(e.score)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
      {me && me.rank !== null && me.rank > entries.length && (
        <p className="flex items-center justify-between border-t pt-3 text-body-sm">
          <span className="text-muted-foreground">You · #{me.rank}</span>
          <span className="font-mono tabular-nums">
            {formatMs(me.entry.score)}
          </span>
        </p>
      )}
    </section>
  );
}
