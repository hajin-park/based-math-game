import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { GUEST_RUN_LIMIT, useUserStats } from "@/data";
import { useStartTarget } from "@/features/play/useStartTarget";
import { formatScore } from "@/game";
import { bestsList } from "@/lib/statsDerive";
import { formatPracticeTime, relativeTime } from "@/lib/timeFormat";

const nf = new Intl.NumberFormat();

/** One ledger line: label, dot leaders, a typewritten figure. */
function LedgerRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-foreground/[0.12] py-2.5">
      <dt className="shrink-0">{label}</dt>
      <span aria-hidden className="leader" />
      <dd className="shrink-0 font-mono text-mono-md text-foreground">
        {value}
      </dd>
    </div>
  );
}

function SectionHead({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="border-b border-foreground/25 pb-2 text-title font-bold"
    >
      {children}
    </h2>
  );
}

const LINKS = [
  {
    to: "/stats",
    title: "Stats",
    body: "Your report card: grades per topic, attendance, pace and every saved run.",
  },
  {
    to: "/leaderboard",
    title: "Leaderboard",
    body: "The honour roll for each sprint, speedrun, survival and daily board.",
  },
  {
    to: "/profile/game-settings",
    title: "Game settings",
    body: "Digit grouping, place-value hints, countdown and sound.",
  },
];

/** "/profile": a summary page in the book. */
export default function ProfileOverview() {
  const { isGuest, loading: authLoading } = useAuth();
  const { stats, loading } = useUserStats();
  const start = useStartTarget();
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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
      {!authLoading && isGuest && (
        <section
          aria-labelledby="guest-title"
          className="flex flex-col gap-4 bg-tint/60 px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-8"
        >
          <div className="flex max-w-xl flex-col gap-1.5">
            <h2 id="guest-title" className="text-title font-bold">
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

      <div className="grid gap-12 md:grid-cols-2 md:gap-10">
        <section
          aria-labelledby="summary-title"
          className="flex flex-col gap-3"
        >
          <SectionHead id="summary-title">
            {isGuest ? "On this device" : "All time"}
          </SectionHead>
          {loading ? (
            <div aria-hidden className="flex flex-col">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="flex h-11 items-center gap-4 border-b border-foreground/[0.12]"
                >
                  <Skeleton className="h-3 w-28 rounded-sm" />
                  <Skeleton className="ml-auto h-3 w-12 rounded-sm" />
                </div>
              ))}
            </div>
          ) : (
            <dl className="flex flex-col">
              <LedgerRow label="Runs" value={nf.format(stats.gamesPlayed)} />
              <LedgerRow
                label="Correct answers"
                value={nf.format(stats.totalCorrect)}
              />
              <LedgerRow
                label="Time practised"
                value={`${practice.value} ${practice.unit}`}
              />
              <LedgerRow
                label="Personal bests"
                value={nf.format(bests.length)}
              />
              {stats.gamesPlayed > 0 && (
                <LedgerRow
                  label="Last played"
                  value={
                    <span className="font-sans text-body-sm">
                      {relativeTime(stats.lastPlayedAt)}
                    </span>
                  }
                />
              )}
            </dl>
          )}
        </section>

        {!loading && stats.gamesPlayed === 0 ? (
          <section aria-labelledby="first-run" className="flex flex-col">
            <h2 id="first-run" className="sr-only">
              No runs yet
            </h2>
            <EmptyState
              size="sm"
              title="No runs yet"
              description="Your numbers show up here as soon as you finish one."
              action={
                <Button asChild variant={isGuest ? "outline" : "default"}>
                  <Link to={start.path}>
                    Play {start.title}
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              }
            />
          </section>
        ) : highlights.length > 0 ? (
          <section
            aria-labelledby="recent-bests"
            className="flex flex-col gap-3"
          >
            <SectionHead id="recent-bests">Latest personal bests</SectionHead>
            <ul className="flex flex-col">
              {highlights.map(({ modeId, mode, best }) => (
                <li key={modeId} className="border-b border-foreground/[0.12]">
                  <Link
                    to={`/leaderboard?mode=${encodeURIComponent(modeId)}`}
                    className="group flex min-h-12 items-baseline gap-2 py-2.5 transition-colors duration-fast hover:text-primary"
                  >
                    <span className="min-w-0 shrink truncate">{mode.name}</span>
                    <span aria-hidden className="leader" />
                    <span className="shrink-0 font-mono text-mono-md tabular-nums text-foreground">
                      {formatScore(mode.spec, best.score)}
                    </span>
                    <span className="sr-only">
                      , set {relativeTime(best.endedAt)}; see the leaderboard
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="font-sans text-[0.8125rem] text-muted-foreground">
              Each links to its board on the honour roll.
            </p>
          </section>
        ) : null}
      </div>

      <nav aria-label="More from your profile">
        <ul className="flex flex-col border-t border-foreground/25">
          {LINKS.map((l) => (
            <li key={l.to} className="border-b border-foreground/[0.12]">
              <Link
                to={l.to}
                className="group flex min-h-16 items-center gap-4 py-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-title-sm font-bold transition-colors duration-fast group-hover:text-primary">
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
