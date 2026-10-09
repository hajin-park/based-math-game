import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { statValueVariants } from "@/components/ui/stat";
import { useAuth } from "@/contexts/AuthContext";
import { GUEST_RUN_LIMIT, useUserStats } from "@/data";
import { formatScore } from "@/game";
import { bestsList } from "@/lib/statsDerive";
import { formatPracticeTime, relativeTime } from "@/lib/timeFormat";

const nf = new Intl.NumberFormat();

function Tile({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 bg-card p-4 sm:p-5">
      <dt className="truncate text-label text-muted-foreground">{label}</dt>
      <dd className="flex items-baseline gap-1">
        <span className={statValueVariants({ size: "md" })}>{value}</span>
        {unit && (
          <span className="font-mono text-[0.8125rem] text-muted-foreground">
            {unit}
          </span>
        )}
      </dd>
    </div>
  );
}

const LINKS = [
  {
    to: "/stats",
    title: "Stats",
    body: "Pace per topic, personal bests and every saved run.",
  },
  {
    to: "/leaderboard",
    title: "Leaderboard",
    body: "Where your best sprint, speedrun and survival runs rank.",
  },
  {
    to: "/profile/game-settings",
    title: "Game settings",
    body: "Digit grouping, place-value hints, countdown and sound.",
  },
];

export default function ProfileOverview() {
  const { isGuest, loading: authLoading } = useAuth();
  const { stats, loading } = useUserStats();
  const practice = formatPracticeTime(stats.totalDurationMs);
  const bests = useMemo(() => bestsList(stats.bests || {}), [stats.bests]);
  const highlights = useMemo(
    () =>
      bests
        .filter((b) => b.mode.ranked)
        .sort((a, b) => b.best.endedAt - a.best.endedAt)
        .slice(0, 4),
    [bests],
  );

  return (
    <div className="flex flex-col gap-10">
      {!authLoading && isGuest && (
        <section
          aria-labelledby="guest-title"
          className="flex flex-col gap-5 rounded-xl border bg-card p-5 sm:p-6 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex max-w-xl flex-col gap-2">
            <h2 id="guest-title" className="text-title font-semibold">
              You’re playing as a guest
            </h2>
            <p className="text-body-sm text-muted-foreground text-pretty">
              Everything works without an account. Your last {GUEST_RUN_LIMIT}{" "}
              runs and your settings are kept in this browser only. Create a
              free account to keep them for good, use them on any device and
              appear on the leaderboard.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 xs:flex-row md:flex-col lg:flex-row">
            <Button asChild size="lg">
              <Link to="/signup?next=%2Fprofile">Create an account</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/login?next=%2Fprofile">Sign in</Link>
            </Button>
          </div>
        </section>
      )}

      <section aria-labelledby="summary-title" className="flex flex-col gap-4">
        <h2 id="summary-title" className="text-title font-semibold">
          {isGuest ? "On this device" : "All time"}
        </h2>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex flex-col gap-3 bg-card p-4 sm:p-5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-14" />
              </div>
            ))
          ) : (
            <>
              <Tile label="Runs" value={nf.format(stats.gamesPlayed)} />
              <Tile label="Correct answers" value={nf.format(stats.totalCorrect)} />
              <Tile label="Time practiced" value={practice.value} unit={practice.unit} />
              <Tile label="Personal bests" value={nf.format(bests.length)} />
            </>
          )}
        </dl>
        {!loading && stats.gamesPlayed > 0 && (
          <p className="text-body-sm text-muted-foreground">
            Last played {relativeTime(stats.lastPlayedAt)}.
          </p>
        )}
      </section>

      {highlights.length > 0 && (
        <section aria-labelledby="recent-bests" className="flex flex-col gap-4">
          <h2 id="recent-bests" className="text-title font-semibold">
            Latest personal bests
          </h2>
          <ul className="flex flex-col overflow-hidden rounded-lg border bg-card">
            {highlights.map(({ modeId, mode, best }) => (
              <li key={modeId} className="border-b last:border-b-0">
                <Link
                  to={`/leaderboard?mode=${encodeURIComponent(modeId)}`}
                  className="flex min-h-14 items-center gap-3 px-4 py-2 transition-colors duration-fast hover:bg-accent/60 sm:px-5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-pretty leading-snug">{mode.name}</span>
                    <span className="block text-[0.75rem] text-muted-foreground">
                      {relativeTime(best.endedAt)}
                    </span>
                  </span>
                  <span className="whitespace-nowrap font-mono text-[0.9375rem] tabular-nums">
                    {formatScore(mode.spec, best.score)}
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
                  <span className="sr-only">, see the leaderboard</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!loading && stats.gamesPlayed === 0 && (
        <section
          aria-labelledby="first-run"
          className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border-strong p-5 sm:p-6"
        >
          <h2 id="first-run" className="text-title-sm font-semibold">
            No runs yet
          </h2>
          <p className="text-body-sm text-muted-foreground">
            A 60-second sprint is the quickest way in. Your numbers show up here
            as soon as you finish.
          </p>
          <Button asChild variant={isGuest ? "outline" : "default"}>
            <Link to="/play">
              Start a sprint
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </section>
      )}

      <nav aria-label="More from your profile">
        <ul className="flex flex-col border-t">
          {LINKS.map((l) => (
            <li key={l.to} className="border-b">
              <Link
                to={l.to}
                className="group flex min-h-16 items-center gap-4 py-3 transition-colors duration-fast hover:text-foreground"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-title-sm font-semibold">
                    {l.title}
                  </span>
                  <span className="block text-body-sm text-muted-foreground">
                    {l.body}
                  </span>
                </span>
                <ArrowRight
                  className="size-4 text-muted-foreground transition-transform duration-fast group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
