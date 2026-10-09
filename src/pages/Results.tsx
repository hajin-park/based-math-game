/**
 * /results — the end of a run. Reached only from the run screen (router
 * state); a direct visit redirects to /play. Saves the run exactly once.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleAlert,
  Cloud,
  HardDrive,
  RotateCcw,
  Share2,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Stat } from "@/components/ui/stat";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { fetchRank, type BestEntry, type SaveRunResult } from "@/data";
import {
  customMode,
  formatScore,
  getMode,
  getTopic,
  isBetterScore,
  isRankedModeId,
  type CustomConfig,
  type GameMode,
  type QuestionOutcome,
  type RunSummary,
  type TopicId,
} from "@/game";
import { AnswerValue } from "@/features/play/AnswerValue";
import { ExplanationSteps } from "@/features/play/ExplanationSteps";
import { PromptView } from "@/features/play/PromptView";
import {
  formatLine,
  modeTitle,
  questionLabel,
  seconds1,
  spokenAnswer,
} from "@/features/play/describe";
import { absoluteUrl, hubLink, runPath } from "@/features/play/links";
import {
  isResultsState,
  runKey,
  saveRunOnce,
  type ResultsState,
} from "@/features/play/session";
import { cn } from "@/lib/utils";

export default function Results() {
  const location = useLocation();
  const state: unknown = location.state;
  if (!isResultsState(state)) return <Navigate to="/play" replace />;
  return <ResultsView key={runKey(state.summary)} {...state} />;
}

function resolveMode(
  summary: RunSummary,
  custom?: CustomConfig,
): GameMode | null {
  if (summary.modeId === "custom") {
    try {
      return custom ? customMode(custom) : null;
    } catch {
      return null;
    }
  }
  return getMode(summary.modeId) ?? null;
}

/** Big headline number + unit for a score. */
function headline(mode: GameMode, summary: RunSummary) {
  switch (mode.spec.scoreUnit) {
    case "ms":
      return { value: (summary.score / 1000).toFixed(2), unit: "seconds" };
    case "cleared":
      return { value: String(summary.score), unit: "cleared" };
    default:
      return { value: String(summary.score), unit: "correct" };
  }
}

type SaveState =
  | { status: "saving" }
  | { status: "saved"; result: SaveRunResult; rank?: number | null }
  | { status: "error"; error: unknown };

function ResultsView({ summary, custom, previousBest }: ResultsState) {
  const navigate = useNavigate();
  const { user, loading: authLoading, isGuest } = useAuth();
  const mode = useMemo(() => resolveMode(summary, custom), [summary, custom]);
  const [save, setSave] = useState<SaveState>({ status: "saving" });
  const ranked = isRankedModeId(summary.modeId);

  const doSave = useCallback(() => {
    setSave({ status: "saving" });
    saveRunOnce(summary)
      .then(async (result) => {
        let rank: number | null | undefined;
        if (result.leaderboard === "updated" && user && !user.isAnonymous) {
          rank = await fetchRank(summary.modeId, user.uid)
            .then((r) => (r ? r.rank : undefined))
            .catch(() => undefined);
        }
        setSave({ status: "saved", result, rank });
      })
      .catch((error) => {
        console.error("Saving the run failed:", error);
        setSave({ status: "error", error });
      });
  }, [summary, user]);

  // Wait for auth to settle so a signed-in player's run is not stored as a guest's.
  const started = useRef(false);
  useEffect(() => {
    if (authLoading || started.current) return;
    started.current = true;
    doSave();
  }, [authLoading, doSave]);

  useEffect(() => {
    if (save.status !== "error") return;
    toast({
      variant: "destructive",
      title: "Couldn't save this run",
      description:
        "Check your connection and try again. Your result is still on this page.",
      action: (
        <ToastAction altText="Retry saving" onClick={doSave}>
          Retry
        </ToastAction>
      ),
    });
  }, [save.status, doSave]);

  const playAgainPath = mode ? runPath(summary.modeId, custom) : "/play";
  const isDaily = summary.format === "daily";

  // Enter plays again (outside controls).
  useEffect(() => {
    if (isDaily) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.defaultPrevented || e.repeat) return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        t !== document.body &&
        t.closest(
          "a,button,input,textarea,select,summary,[role=dialog],[contenteditable=true]",
        )
      )
        return;
      e.preventDefault();
      navigate(playAgainPath);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, playAgainPath, isDaily]);

  useEffect(() => {
    document.title = "Results · Based Math Game";
  }, []);

  if (!mode) return <Navigate to="/play" replace />;

  const big = headline(mode, summary);
  const comparable = mode.format !== "practice" && mode.topicId !== "custom";
  const isPB =
    comparable &&
    !!previousBest &&
    isBetterScore(mode.spec, summary.score, previousBest.score);
  const firstRun = comparable && !previousBest;
  const answered = summary.outcomes.length;
  const misses = summary.outcomes.filter((o) => o.result !== "correct");
  const timeouts = misses.filter((o) => o.result === "timeout").length;
  const avgMs = answered ? summary.durationMs / answered : 0;
  const leaderboardHref = `/leaderboard?mode=${encodeURIComponent(summary.modeId)}`;

  return (
    <div className="container flex max-w-5xl flex-col gap-10 py-10 md:gap-12 md:py-14">
      <header className="flex flex-col gap-8 border-b pb-8 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 flex-col gap-4">
          <p className="eyebrow">
            {modeTitle(mode)} · {formatLine(mode)}
          </p>
          <h1 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="sr-only">Results: </span>
            <span
              className={cn(
                "font-mono text-[clamp(3.5rem,2.4rem+5vw,6rem)] font-medium leading-none tracking-[-0.03em] tabular-nums text-foreground",
                isPB &&
                  "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-90 motion-safe:duration-500",
              )}
            >
              {big.value}
            </span>
            <span className="font-serif text-headline italic text-muted-foreground">
              {big.unit}
            </span>
          </h1>
          <PersonalBestLine
            mode={mode}
            summary={summary}
            previousBest={previousBest}
            isPB={isPB}
            firstRun={firstRun}
          />
          <SaveLine
            save={save}
            ranked={ranked}
            isGuest={isGuest}
            mode={mode}
            leaderboardHref={leaderboardHref}
            onRetry={doSave}
          />
        </div>
        <div className="flex w-full flex-col gap-2 xs:flex-row md:w-auto md:flex-col md:items-stretch lg:flex-row">
          {isDaily ? (
            <ShareButton summary={summary} />
          ) : (
            <Button asChild size="lg">
              <Link to={playAgainPath}>
                <RotateCcw aria-hidden />
                Play again
                <Kbd
                  size="sm"
                  tone="inverse"
                  className="hidden pointer-fine:inline-flex"
                  aria-hidden
                >
                  ↵
                </Kbd>
              </Link>
            </Button>
          )}
          <Button asChild size="lg" variant="outline">
            <Link to={isDaily ? "/daily" : hubLink(summary.modeId, custom)}>
              {isDaily ? "Back to daily" : "Change mode"}
            </Link>
          </Button>
          {ranked && (
            <Button asChild size="lg" variant="ghost">
              <Link to={leaderboardHref}>
                Leaderboard
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          )}
        </div>
      </header>

      <section
        aria-label="Run statistics"
        className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4"
      >
        <Stat
          label="Accuracy"
          value={Math.round(summary.accuracy * 100)}
          unit="%"
          hint={`${summary.correct} of ${answered} answered`}
        />
        <Stat
          label="Pace"
          value={(avgMs / 1000).toFixed(1)}
          unit="s / question"
          hint={
            mode.format === "sprint"
              ? `${(summary.correct / Math.max(1, summary.durationMs / 60_000)).toFixed(0)} per minute`
              : undefined
          }
        />
        <Stat
          label={timeouts ? "Skipped · timed out" : "Skipped"}
          value={
            timeouts ? `${summary.skipped} · ${timeouts}` : summary.skipped
          }
          hint={
            mode.spec.skipPenaltyMs && summary.skipped
              ? `+${(summary.skipped * mode.spec.skipPenaltyMs) / 1000} s penalty`
              : undefined
          }
        />
        <Stat
          label="Time"
          value={(summary.durationMs / 1000).toFixed(1)}
          unit="s"
          hint={`Typing accuracy ${Math.round(summary.typingAccuracy * 100)}%`}
        />
      </section>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <ReviewList summary={summary} misses={misses} />
        <aside className="flex flex-col gap-10">
          {(mode.topicId === "mixed" ||
            isDaily ||
            mode.format === "survival") && (
            <TopicBreakdown outcomes={summary.outcomes} />
          )}
          {isDaily && <DailyStrip summary={summary} />}
          <SlowestList outcomes={summary.outcomes} />
        </aside>
      </div>
    </div>
  );
}

function PersonalBestLine({
  mode,
  summary,
  previousBest,
  isPB,
  firstRun,
}: {
  mode: GameMode;
  summary: RunSummary;
  previousBest: BestEntry | null;
  isPB: boolean;
  firstRun: boolean;
}) {
  const lineRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!isPB || !lineRef.current) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    lineRef.current.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      {
        duration: 520,
        delay: 180,
        easing: "cubic-bezier(.2,.8,.2,1)",
        fill: "backwards",
      },
    );
  }, [isPB]);

  if (mode.format === "practice")
    return (
      <p className="text-body text-muted-foreground">
        Practice is never ranked. Skipped questions and their worked solutions
        are below.
      </p>
    );
  if (mode.topicId === "custom")
    return (
      <p className="text-body text-muted-foreground">
        Custom drills are not ranked or compared with personal bests.
      </p>
    );
  if (firstRun)
    return (
      <p className="text-body text-muted-foreground">
        Your first result on this mode. That is the number to beat.
      </p>
    );
  if (!previousBest) return null;
  const lower = mode.spec.scoreOrder === "lower-better";
  const diff = summary.score - previousBest.score;
  const diffText =
    mode.spec.scoreUnit === "ms"
      ? `${(Math.abs(diff) / 1000).toFixed(2)} s`
      : String(Math.abs(diff));
  if (isPB)
    return (
      <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-body">
        <span className="relative inline-flex items-center gap-1.5 font-semibold text-foreground">
          <Trophy aria-hidden className="size-4 text-primary" />
          New personal best
          <span
            ref={lineRef}
            aria-hidden
            className="absolute -bottom-1 left-0 h-0.5 w-full origin-left rounded-full bg-primary"
          />
        </span>
        <span className="font-mono text-[0.9375rem] tabular-nums text-success">
          {lower ? "−" : "+"}
          {diffText}
        </span>
        <span className="text-muted-foreground">
          on {formatScore(mode.spec, previousBest.score)}
        </span>
      </p>
    );
  const tie = diff === 0;
  return (
    <p className="text-body text-muted-foreground">
      Personal best {formatScore(mode.spec, previousBest.score)}
      {tie ? (
        " — tied."
      ) : (
        <>
          {" · "}
          <span className="font-mono tabular-nums">{diffText}</span>
          {lower ? " slower" : " short"}
        </>
      )}
    </p>
  );
}

function SaveLine({
  save,
  ranked,
  isGuest,
  mode,
  leaderboardHref,
  onRetry,
}: {
  save: SaveState;
  ranked: boolean;
  isGuest: boolean;
  mode: GameMode;
  leaderboardHref: string;
  onRetry: () => void;
}) {
  let icon = <Cloud aria-hidden className="size-4" />;
  let body: React.ReactNode;
  if (save.status === "saving") {
    body = <span className="text-muted-foreground">Saving…</span>;
  } else if (save.status === "error") {
    icon = <CircleAlert aria-hidden className="size-4 text-destructive" />;
    body = (
      <span className="inline-flex flex-wrap items-center gap-x-2">
        <span className="text-destructive">Not saved.</span>
        <Button
          variant="link"
          className="h-auto text-body-sm"
          onClick={onRetry}
        >
          Try again
        </Button>
      </span>
    );
  } else {
    const r = save.result;
    if (r.storedIn === "local") {
      icon = <HardDrive aria-hidden className="size-4" />;
      body =
        ranked && isGuest ? (
          <span>
            Saved on this device.{" "}
            <Link to="/signup" className="link">
              Create a free account to get ranked
            </Link>{" "}
            — your guest runs come with you.
          </span>
        ) : (
          <span>Saved on this device.</span>
        );
    } else {
      switch (r.leaderboard) {
        case "updated":
          icon = <Check aria-hidden className="size-4 text-success" />;
          body = (
            <span>
              Leaderboard updated —{" "}
              <Link to={leaderboardHref} className="link">
                {save.rank === undefined
                  ? "see your rank"
                  : save.rank === null
                    ? "rank 100+"
                    : `rank #${save.rank}`}
              </Link>
              .
            </span>
          );
          break;
        case "not-improved":
          body =
            mode.format === "daily" ? (
              <span>Saved. Only your first daily attempt is ranked.</span>
            ) : (
              <span>Saved. Your leaderboard entry stays at your best.</span>
            );
          break;
        case "rejected":
          icon = <CircleAlert aria-hidden className="size-4 text-warning" />;
          body = (
            <span>
              Saved to your history, but not eligible for the leaderboard.
            </span>
          );
          break;
        case "error":
          icon = <CircleAlert aria-hidden className="size-4 text-warning" />;
          body = (
            <span>
              Saved to your history. The leaderboard could not be updated.
            </span>
          );
          break;
        default:
          body = <span>Saved to your history.</span>;
      }
    }
  }
  return (
    <p
      role="status"
      className="flex items-start gap-2 text-body-sm text-muted-foreground [&>svg]:mt-0.5 [&>svg]:shrink-0"
    >
      {icon}
      {body}
    </p>
  );
}

function ShareButton({ summary }: { summary: RunSummary }) {
  const [copied, setCopied] = useState(false);
  const date = summary.modeId.slice(6);
  const strip = summary.outcomes
    .map((o) => (o.result === "correct" ? "▮" : "▯"))
    .join("");
  const text = `Based Math Daily ${date} · ${seconds1(summary.score)} · ${strip}`;
  const url = absoluteUrl("/daily");

  const share = async () => {
    try {
      if (navigator.share && window.matchMedia?.("(pointer: coarse)").matches) {
        await navigator.share({ text, url });
        return;
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      toast({ title: "Copy failed", description: `${text} ${url}` });
    }
  };

  return (
    <Button size="lg" onClick={share}>
      {copied ? <Check aria-hidden /> : <Share2 aria-hidden />}
      {copied ? "Copied to clipboard" : "Share result"}
      <span aria-live="polite" className="sr-only">
        {copied ? "Result copied" : ""}
      </span>
    </Button>
  );
}

function DailyStrip({ summary }: { summary: RunSummary }) {
  return (
    <section aria-labelledby="daily-strip" className="flex flex-col gap-3">
      <h2 id="daily-strip" className="eyebrow">
        Your ten
      </h2>
      <ol className="grid grid-cols-10 gap-1">
        {summary.outcomes.map((o, i) => (
          <li
            key={i}
            title={`${i + 1}: ${o.result}`}
            className={cn(
              "flex h-8 items-end justify-center rounded-sm border pb-1 font-mono text-[0.625rem] tabular-nums",
              o.result === "correct"
                ? "border-foreground/80 bg-foreground text-background"
                : "border-dashed border-border-strong text-muted-foreground",
            )}
          >
            <span className="sr-only">
              Question {i + 1}: {o.result === "correct" ? "correct" : "skipped"}
            </span>
            <span aria-hidden>{i + 1}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function TopicBreakdown({ outcomes }: { outcomes: QuestionOutcome[] }) {
  const rows = useMemo(() => {
    const map = new Map<
      TopicId,
      { correct: number; total: number; ms: number }
    >();
    for (const o of outcomes) {
      const r = map.get(o.question.topicId) ?? { correct: 0, total: 0, ms: 0 };
      r.total++;
      if (o.result === "correct") {
        r.correct++;
        r.ms += o.elapsedMs;
      }
      map.set(o.question.topicId, r);
    }
    return [...map.entries()];
  }, [outcomes]);
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="by-topic" className="flex flex-col gap-3">
      <h2 id="by-topic" className="eyebrow">
        By topic
      </h2>
      <table className="w-full text-body-sm tabular-nums">
        <thead>
          <tr className="border-b border-border-strong text-left text-[0.75rem] text-muted-foreground">
            <th scope="col" className="py-2 font-medium">
              Topic
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Right
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Avg
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([topicId, r]) => (
            <tr key={topicId} className="border-b last:border-0">
              <th scope="row" className="py-2.5 pr-2 text-left font-normal">
                {topicId === "custom" || topicId === "mixed"
                  ? "Mixed"
                  : getTopic(topicId).name}
              </th>
              <td className="py-2.5 text-right font-mono">
                {r.correct}/{r.total}
              </td>
              <td className="py-2.5 text-right font-mono text-muted-foreground">
                {r.correct ? seconds1(r.ms / r.correct) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function SlowestList({ outcomes }: { outcomes: QuestionOutcome[] }) {
  const slowest = useMemo(
    () =>
      outcomes
        .filter((o) => o.result === "correct")
        .sort((a, b) => b.elapsedMs - a.elapsedMs)
        .slice(0, 3),
    [outcomes],
  );
  if (slowest.length < 2) return null;
  return (
    <section aria-labelledby="slowest" className="flex flex-col gap-3">
      <h2 id="slowest" className="eyebrow">
        Slowest correct answers
      </h2>
      <ol className="flex flex-col">
        {slowest.map((o, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-3 border-b py-2.5 last:border-0"
          >
            <span className="flex min-w-0 items-center gap-2">
              <PromptView
                prompt={o.question.prompt}
                grouped={false}
                placeValues={false}
                size="sm"
                className="justify-start"
              />
              <span className="sr-only">{questionLabel(o.question)}</span>
            </span>
            <span className="shrink-0 font-mono text-body-sm tabular-nums text-muted-foreground">
              {seconds1(o.elapsedMs)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ReviewList({
  summary,
  misses,
}: {
  summary: RunSummary;
  misses: QuestionOutcome[];
}) {
  return (
    <section aria-labelledby="review" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="review" className="font-serif text-headline">
          Review
        </h2>
        <span className="text-label text-muted-foreground">
          {misses.length === 0
            ? "Nothing missed"
            : `${misses.length} to look at`}
        </span>
      </div>
      {misses.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-strong px-5 py-8 text-center text-body-sm text-muted-foreground">
          {summary.outcomes.length === 0
            ? "No questions answered this time."
            : "Clean run: every question answered without a skip."}
        </p>
      ) : (
        <ul className="flex flex-col divide-y rounded-lg border bg-card">
          {misses.map((o, i) => (
            <li key={i}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 transition-colors duration-fast hover:bg-accent/60 sm:px-5 [&::-webkit-details-marker]:hidden">
                  <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1.5">
                    <PromptView
                      prompt={o.question.prompt}
                      grouped
                      placeValues={false}
                      size="sm"
                      className="justify-start"
                    />
                    <ArrowRight
                      aria-hidden
                      className="size-3.5 text-muted-foreground"
                    />
                    <AnswerValue question={o.question} size="sm" />
                    <span className="sr-only">
                      {questionLabel(o.question)}. Answer:{" "}
                      {spokenAnswer(o.question)}.
                    </span>
                  </span>
                  <Badge
                    variant={o.result === "timeout" ? "warning" : "outline"}
                    className="shrink-0"
                  >
                    {o.result === "timeout" ? "Timed out" : "Skipped"}
                  </Badge>
                  <ChevronDown
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-base group-open:rotate-180"
                  />
                </summary>
                <div className="border-t bg-background/40 px-4 py-4 sm:px-5">
                  <p className="mb-4 text-label text-muted-foreground">
                    {o.question.instruction} · gave up after{" "}
                    {seconds1(o.elapsedMs)}
                  </p>
                  <ExplanationSteps question={o.question} />
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
