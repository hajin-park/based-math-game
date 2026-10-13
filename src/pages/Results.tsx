/**
 * /results — the marked paper. The finished run comes back as a sheet laid
 * on the page: a running head with the drill and the date, the score
 * circled in red pen, the personal-best line, a ruled box of secondary
 * figures, then every exercise down the page with a tick or a cross in the
 * margin and, for misses, the correct answer in red and a worked solution.
 *
 * Reached only from the run screen (router state, or the copy kept for this
 * tab so a reload works); a direct visit redirects to /play. Saves the run
 * exactly once.
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
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  PenCircle,
  PenCross,
  PenTick,
  PenUnderline,
} from "@/components/ui/pen-mark";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { fetchRank, type BestEntry, type SaveRunResult } from "@/data";
import {
  customMode,
  dailyNumber,
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
  exerciseInstruction,
  PEN_DRAW_KEYFRAMES,
  PEN_STROKE_SCALES,
} from "@/features/play/RunExercise";
import {
  isResultsState,
  recallResults,
  runKey,
  saveRunOnce,
  type ResultsState,
} from "@/features/play/session";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

export default function Results() {
  const location = useLocation();
  const routed: unknown = location.state;
  const state = isResultsState(routed) ? routed : recallResults();
  if (!state) return <Navigate to="/play" replace />;
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

/** "Tue, 13 Oct 2026" in UTC, like the cover's date line. */
function longDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

type SaveState =
  | { status: "saving" }
  | { status: "saved"; result: SaveRunResult; rank?: number | null }
  | { status: "error"; error: unknown };

/** Delay before the marks go down: the circle first, then the margin. */
const CIRCLE_DELAY = 140;
const MARKS_DELAY = 620;

function ResultsView({ summary, custom, previousBest }: ResultsState) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
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
  const comparable =
    mode.format !== "practice" &&
    mode.format !== "daily" &&
    mode.topicId !== "custom";
  const isPB =
    comparable &&
    !!previousBest &&
    isBetterScore(mode.spec, summary.score, previousBest.score);
  const firstRun = comparable && !previousBest;
  const leaderboardHref = `/leaderboard?mode=${encodeURIComponent(summary.modeId)}`;
  const dailyDate = isDaily ? summary.modeId.slice(6) : null;
  let sheetNo: number | null = null;
  if (dailyDate) {
    try {
      sheetNo = dailyNumber(dailyDate);
    } catch {
      sheetNo = null;
    }
  }

  return (
    <div className="container max-w-5xl px-3 py-6 sm:px-6 md:py-12">
      <article
        aria-labelledby="results-title"
        className={cn(
          "paper-sheet rounded-sm px-5 pb-10 pt-5 sm:px-10 sm:pt-7 lg:px-14 lg:pb-14",
          !reduce && "animate-sheet-in",
          PEN_DRAW_KEYFRAMES,
        )}
      >
        {/* Running head: the drill on the left, the date on the right. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-foreground/30 pb-2">
          <p className="smallcaps min-w-0">
            {modeTitle(mode)} · {formatLine(mode)}
          </p>
          <p className="smallcaps">
            {sheetNo !== null && <>Sheet No. {sheetNo} · </>}
            {longDate(summary.endedAt)}
          </p>
        </div>

        <header className="grid gap-8 pt-8 sm:pt-10 md:grid-cols-[minmax(0,1fr)_17rem] md:gap-12">
          <div className="flex min-w-0 flex-col gap-5">
            <h1
              id="results-title"
              className="flex flex-wrap items-baseline gap-x-5 gap-y-2"
            >
              <span className="sr-only">Results: </span>
              <PenCircle
                animate={!reduce}
                delay={CIRCLE_DELAY}
                strokeWidth={1.4}
                className={cn(
                  PEN_STROKE_SCALES,
                  "font-mono text-[clamp(3.5rem,2.4rem+5vw,6rem)] font-medium leading-none tabular-nums text-foreground sm:-ml-[0.32em] [&>span:first-child]:min-w-[1.5ch] [&>span:first-child]:text-center",
                )}
              >
                {big.value}
              </PenCircle>
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
              animate={!reduce}
            />
            <SaveLine
              save={save}
              ranked={ranked}
              isGuest={isGuest}
              mode={mode}
              leaderboardHref={leaderboardHref}
              onRetry={doSave}
            />
            <div className="flex flex-col gap-2 pt-2 xs:flex-row xs:flex-wrap">
              {isDaily ? (
                <ShareButton summary={summary} />
              ) : (
                <Button asChild size="lg">
                  <Link to={playAgainPath}>
                    Play again
                    <Kbd
                      size="sm"
                      tone="inverse"
                      className="hidden pointer-fine:inline-flex"
                      aria-hidden
                    >
                      Enter
                    </Kbd>
                  </Link>
                </Button>
              )}
              <Button asChild size="lg" variant="outline">
                <Link to={isDaily ? "/daily" : hubLink(summary.modeId, custom)}>
                  {isDaily ? "Back to daily" : "Change drill"}
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
          </div>
          <Figures mode={mode} summary={summary} />
        </header>

        <div className="rule-double mt-10 sm:mt-12" aria-hidden />

        <div className="grid gap-12 pt-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-14">
          <Exercises summary={summary} animate={!reduce} />
          <aside className="flex flex-col gap-10" aria-label="Breakdown">
            {(mode.topicId === "mixed" ||
              isDaily ||
              mode.format === "survival") && (
              <TopicBreakdown outcomes={summary.outcomes} />
            )}
            {isDaily && <DailyStrip summary={summary} />}
            <SlowestList outcomes={summary.outcomes} />
          </aside>
        </div>
      </article>
    </div>
  );
}

function PersonalBestLine({
  mode,
  summary,
  previousBest,
  isPB,
  firstRun,
  animate,
}: {
  mode: GameMode;
  summary: RunSummary;
  previousBest: BestEntry | null;
  isPB: boolean;
  firstRun: boolean;
  animate: boolean;
}) {
  const note = "font-serif text-body-lg italic text-foreground/80";
  if (mode.format === "practice")
    return (
      <p className={note}>
        Practice is never ranked. Misses carry their worked solutions below.
      </p>
    );
  if (mode.format === "daily")
    return (
      <p className={note}>
        The same ten for everyone today. A new sheet starts at 00:00 UTC.
      </p>
    );
  if (mode.topicId === "custom")
    return (
      <p className={note}>
        Custom drills are not ranked or compared with personal bests.
      </p>
    );
  if (firstRun)
    return (
      <p className={note}>
        Your first result on this drill. That is the number to beat.
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
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-body-lg">
        <PenUnderline
          animate={animate}
          delay={CIRCLE_DELAY + 520}
          className={cn(
            PEN_STROKE_SCALES,
            "font-serif font-bold text-foreground",
          )}
        >
          New personal best
        </PenUnderline>
        <span className="font-mono text-mono-md tabular-nums text-foreground">
          {lower ? "−" : "+"}
          {diffText}
        </span>
        <span className="text-body text-muted-foreground">
          on {formatScore(mode.spec, previousBest.score)}
        </span>
      </p>
    );
  const tie = diff === 0;
  return (
    <p className="text-body-lg text-foreground/80">
      <span className="font-serif italic">Personal best</span>{" "}
      <span className="font-mono text-mono-md tabular-nums text-foreground">
        {formatScore(mode.spec, previousBest.score)}
      </span>
      {tie ? (
        " — tied."
      ) : (
        <>
          {" · "}
          <span className="font-mono text-mono-md tabular-nums">
            {diffText}
          </span>
          {lower ? " slower" : " short"}
        </>
      )}
    </p>
  );
}

/** The ruled box of secondary figures in the corner of the paper. */
function Figures({ mode, summary }: { mode: GameMode; summary: RunSummary }) {
  const answered = summary.outcomes.length;
  const timeouts = summary.outcomes.filter(
    (o) => o.result === "timeout",
  ).length;
  const avgMs = answered ? summary.durationMs / answered : 0;
  const rows: { label: string; value: string; note?: string }[] = [
    {
      label: "Accuracy",
      value: `${Math.round(summary.accuracy * 100)}%`,
      note: `${summary.correct} of ${answered}`,
    },
    { label: "Per question", value: seconds1(avgMs) },
    {
      label: "Skipped",
      value: String(summary.skipped),
      note:
        [
          timeouts ? `${timeouts} timed out` : null,
          mode.spec.skipPenaltyMs && summary.skipped
            ? `+${(summary.skipped * mode.spec.skipPenaltyMs) / 1000} s`
            : null,
        ]
          .filter(Boolean)
          .join(" · ") || undefined,
    },
    { label: "Time", value: seconds1(summary.durationMs) },
    {
      label: "Typing accuracy",
      value: `${Math.round(summary.typingAccuracy * 100)}%`,
    },
  ];
  return (
    <section
      aria-labelledby="figures-title"
      className="self-start rounded-[1px] border border-foreground/60"
    >
      <h2
        id="figures-title"
        className="smallcaps border-b border-foreground/60 px-4 py-2"
      >
        Figures
      </h2>
      <dl className="divide-y divide-foreground/15">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-baseline justify-between gap-3 px-4 py-2"
          >
            <dt className="text-label text-muted-foreground">{r.label}</dt>
            <dd className="flex items-baseline gap-2 text-right">
              {r.note && (
                <span className="text-[0.8125rem] text-muted-foreground">
                  {r.note}
                </span>
              )}
              <span className="font-mono text-mono-md font-medium tabular-nums text-foreground">
                {r.value}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
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
      <h2 id="daily-strip" className="font-serif text-title-sm font-bold">
        Your ten
      </h2>
      <ol className="grid grid-cols-5 gap-x-1 gap-y-2">
        {summary.outcomes.map((o, i) => (
          <li
            key={i}
            title={`${i + 1}: ${o.result}`}
            className="flex flex-col items-center gap-0.5"
          >
            <span className="sr-only">
              Question {i + 1}: {o.result === "correct" ? "correct" : "missed"}
            </span>
            <span aria-hidden className="grid size-7 place-items-center">
              {o.result === "correct" ? (
                <PenTick animate={false} className="size-5" />
              ) : (
                <PenCross animate={false} className="size-4" />
              )}
            </span>
            <span
              aria-hidden
              className="font-mono text-[0.75rem] tabular-nums text-muted-foreground"
            >
              {i + 1}
            </span>
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
    <section aria-labelledby="by-topic" className="flex flex-col gap-2">
      <h2 id="by-topic" className="font-serif text-title-sm font-bold">
        By topic
      </h2>
      <table className="w-full text-body-sm tabular-nums">
        <thead>
          <tr className="rule-double text-left">
            <th scope="col" className="smallcaps py-1.5 font-medium">
              Topic
            </th>
            <th scope="col" className="smallcaps py-1.5 text-right font-medium">
              Right
            </th>
            <th scope="col" className="smallcaps py-1.5 text-right font-medium">
              Avg
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([topicId, r]) => (
            <tr key={topicId} className="border-b border-border last:border-0">
              <th scope="row" className="py-2 pr-2 text-left font-normal">
                {topicId === "custom" || topicId === "mixed"
                  ? "Mixed"
                  : getTopic(topicId).name}
              </th>
              <td className="py-2 text-right font-mono">
                {r.correct}/{r.total}
              </td>
              <td className="py-2 pl-3 text-right font-mono text-muted-foreground">
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
        .map((o, i) => ({ o, n: i + 1 }))
        .filter(({ o }) => o.result === "correct")
        .sort((a, b) => b.o.elapsedMs - a.o.elapsedMs)
        .slice(0, 3),
    [outcomes],
  );
  if (slowest.length < 2) return null;
  return (
    <section aria-labelledby="slowest" className="flex flex-col gap-2">
      <h2 id="slowest" className="font-serif text-title-sm font-bold">
        Slowest correct
      </h2>
      <ol className="flex flex-col">
        {slowest.map(({ o, n }) => (
          <li
            key={n}
            className="flex items-baseline gap-2 border-b border-border py-2 last:border-0"
          >
            <span className="font-mono text-mono-sm tabular-nums text-primary">
              {n}.
            </span>
            <span className="min-w-0 overflow-hidden whitespace-nowrap [mask-image:linear-gradient(to_right,#000_80%,transparent)]">
              <span className="sr-only">
                {questionLabel(o.question)}. Answer: {spokenAnswer(o.question)}.
              </span>
              <span aria-hidden className="inline-flex items-center">
                <PromptView
                  prompt={o.question.prompt}
                  grouped={false}
                  placeValues={false}
                  size="sm"
                  align="start"
                  className="flex-nowrap"
                />
              </span>
            </span>
            <span aria-hidden className="leader" />
            <span className="shrink-0 font-mono text-mono-sm tabular-nums text-muted-foreground">
              {seconds1(o.elapsedMs)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Every exercise of the run, numbered, with its mark in the margin. */
function Exercises({
  summary,
  animate,
}: {
  summary: RunSummary;
  animate: boolean;
}) {
  const outcomes = summary.outcomes;
  const misses = outcomes.filter((o) => o.result !== "correct").length;
  const practice = summary.format === "practice";
  return (
    <section aria-labelledby="exercises" className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pb-3">
        <h2 id="exercises" className="font-serif text-headline font-bold">
          Exercises
        </h2>
        <p className="smallcaps">
          {outcomes.length === 0
            ? "None answered"
            : misses === 0
              ? `All ${outcomes.length} correct`
              : `${outcomes.length - misses} of ${outcomes.length} correct`}
        </p>
      </div>
      {outcomes.length === 0 ? (
        <p className="border-y border-border py-8 text-center font-serif italic text-muted-foreground">
          No questions answered this time.
        </p>
      ) : (
        <ol className="border-t border-foreground/30">
          {outcomes.map((o, i) => (
            <ResultsExercise
              key={i}
              outcome={o}
              n={i + 1}
              animate={animate && i < 24}
              delay={MARKS_DELAY + Math.min(i, 24) * 45}
              defaultOpen={practice && o.result !== "correct"}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function ResultsExercise({
  outcome: o,
  n,
  animate,
  delay,
  defaultOpen,
}: {
  outcome: QuestionOutcome;
  n: number;
  animate: boolean;
  delay: number;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const miss = o.result !== "correct";
  const panelId = `exercise-${n}-working`;
  return (
    <li className="grid grid-cols-[1.75rem_2rem_minmax(0,1fr)] gap-x-1.5 border-b border-border py-3 sm:grid-cols-[2.25rem_2.5rem_minmax(0,1fr)] sm:gap-x-2">
      <span aria-hidden className="flex h-7 items-center justify-center">
        {miss ? (
          <PenCross
            animate={animate}
            delay={delay}
            className="size-[1.125rem]"
          />
        ) : (
          <PenTick animate={animate} delay={delay} className="size-6" />
        )}
      </span>
      <span
        aria-hidden
        className="flex h-7 items-center justify-end font-mono text-mono-sm font-medium tabular-nums text-primary"
      >
        {n}.
      </span>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="sr-only">
          Exercise {n},{" "}
          {miss
            ? o.result === "timeout"
              ? "time ran out"
              : "skipped"
            : "correct"}
          . {questionLabel(o.question)}. Answer: {spokenAnswer(o.question)}.
        </p>
        <div
          aria-hidden
          className="flex min-h-7 flex-wrap items-center gap-x-3 gap-y-1"
        >
          <PromptView
            prompt={o.question.prompt}
            grouped
            placeValues={false}
            size="sm"
            align="start"
          />
          <span className="font-mono text-mono-sm text-muted-foreground">
            →
          </span>
          {miss ? (
            <>
              <span className="font-serif text-body-sm italic text-muted-foreground">
                {o.result === "timeout" ? "time ran out" : "skipped"}
              </span>
              <span className="font-mono text-mono-sm text-muted-foreground">
                →
              </span>
              <AnswerValue
                question={o.question}
                size="sm"
                className="[&_*]:!text-pen"
              />
            </>
          ) : (
            <AnswerValue question={o.question} size="sm" />
          )}
          <span className="ml-auto pl-2 font-mono text-mono-sm tabular-nums text-muted-foreground">
            {seconds1(o.elapsedMs)}
          </span>
        </div>
        {miss && (
          <>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
              className="-my-1 inline-flex min-h-9 items-center gap-1.5 self-start font-sans text-label text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            >
              {open ? "Hide worked solution" : "Worked solution"}
              <ChevronDown
                aria-hidden
                className={cn(
                  "size-4 transition-transform duration-base",
                  open && "rotate-180",
                )}
              />
            </button>
          </>
        )}
      </div>
      {miss && open && (
        <div
          id={panelId}
          className="col-span-3 mt-2 rounded-sm bg-tint px-4 py-4 motion-safe:animate-rise sm:col-span-1 sm:col-start-3 sm:px-5"
        >
          <p className="mb-3 font-serif text-body text-foreground">
            {exerciseInstruction(o.question)}
            <span className="text-muted-foreground">
              {" "}
              {o.result === "timeout"
                ? "Time ran out after"
                : "Skipped after"}{" "}
              <span className="font-mono text-mono-sm">
                {seconds1(o.elapsedMs)}
              </span>
              .
            </span>
          </p>
          <ExplanationSteps question={o.question} />
        </div>
      )}
    </li>
  );
}
