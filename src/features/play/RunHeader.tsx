import { useEffect, useRef, useState } from "react";
import { Pause } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Meter } from "@/components/ui/meter";
import { PenCross } from "@/components/ui/pen-mark";
import type { BestEntry } from "@/data";
import { getTopic } from "@/game";
import { cn } from "@/lib/utils";
import { clockText, formatLine, modeTitle, seconds1 } from "./describe";
import type { RunHandle } from "./GameSurface";
import type { SoundCues } from "./sound";

interface RunHeaderProps {
  run: RunHandle;
  previousBest: BestEntry | null;
  /** Open the pause overlay (also bound to Escape by the run screen). */
  onPause: () => void;
  cues: SoundCues;
}

const SPRINT_MARKS = [30_000, 10_000, 5_000];

/**
 * The head of the exercise page, like the top of a test paper: Pause at the
 * left, the drill title and its format line, and at the right the
 * examiner's box with the live figures (correct, time, lives). The clock is
 * the printed rule under the header: it shortens as time runs out and turns
 * ochre, then red, near the end. Screen readers hear the clock only at
 * 30 / 10 / 5 seconds and when a life is lost.
 */
export function RunHeader({
  run,
  previousBest,
  onPause,
  cues,
}: RunHeaderProps) {
  const { mode } = run;
  const spec = mode.spec;
  const running = run.status === "running";
  const [message, setMessage] = useState({ text: "", n: 0 });
  const say = (text: string) => setMessage((m) => ({ text, n: m.n + 1 }));

  // Sprint thresholds: announce + warning cue at 10 s.
  const passed = useRef<number | null>(null);
  const timeLeft = run.timeLeftMs;
  useEffect(() => {
    if (timeLeft === null || !running) return;
    const crossed = SPRINT_MARKS.filter(
      (m) => timeLeft <= m && (passed.current === null || m < passed.current),
    );
    if (crossed.length === 0) return;
    const mark = Math.min(...crossed);
    passed.current = mark;
    // Skip stale marks (e.g. coming back to a background tab).
    if (timeLeft > mark - 1500) {
      say(`${mark / 1000} seconds left`);
      if (mark === 10_000) cues.play("warn");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, running]);

  // Survival: announce lost lives.
  const lives = run.lives;
  const prevLives = useRef(lives);
  useEffect(() => {
    if (
      lives !== null &&
      prevLives.current !== null &&
      lives < prevLives.current &&
      lives > 0
    )
      say(`${lives} ${lives === 1 ? "life" : "lives"} left`);
    prevLives.current = lives;
  }, [lives]);

  const elapsed = run.elapsedMs + run.penaltyMs;
  const isCustom = mode.topicId === "custom";
  const best = isCustom ? null : previousBest;

  let figures: React.ReactNode = null;
  let meter: React.ReactNode = null;
  let pace: string | null = null;

  switch (mode.format) {
    case "sprint": {
      const duration = spec.durationMs ?? 60_000;
      const left = run.timeLeftMs ?? duration;
      figures = (
        <>
          <Figure label="Correct" value={run.correct} />
          <Figure
            label="Time left"
            value={clockText(left)}
            role="timer"
            tone={
              left <= duration * 0.1
                ? "destructive"
                : left <= duration * 0.25
                  ? "warning"
                  : undefined
            }
          />
        </>
      );
      meter = (
        <Meter
          variant="timer"
          value={left / 1000}
          max={duration / 1000}
          label="Time left"
          valueText={`${Math.ceil(left / 1000)} seconds`}
          size="sm"
        />
      );
      if (best && run.elapsedMs > 5_000) {
        const expected = (best.score * run.elapsedMs) / duration;
        const diff = Math.round(run.correct - expected);
        pace =
          diff === 0
            ? "On best pace"
            : `${diff > 0 ? "+" : "−"}${Math.abs(diff)} vs best`;
      }
      break;
    }
    case "speedrun": {
      const target = spec.targetCount ?? 15;
      figures = (
        <>
          <Figure label="Correct" value={`${run.correct}/${target}`} />
          <Figure label="Time" value={seconds1(elapsed)} role="timer" />
        </>
      );
      meter = (
        <Meter
          value={run.correct}
          max={target}
          label="Progress"
          valueText={`${run.correct} of ${target} correct`}
          size="sm"
        />
      );
      if (best && run.correct >= 2) {
        const expected = (best.score * run.correct) / target;
        const diff = (elapsed - expected) / 1000;
        pace =
          Math.abs(diff) < 0.05
            ? "On best pace"
            : `${diff < 0 ? "−" : "+"}${Math.abs(diff).toFixed(1)} s vs best`;
      }
      break;
    }
    case "daily": {
      const target = spec.targetCount ?? 10;
      const done = run.outcomes.length;
      figures = (
        <>
          <Figure
            label="Question"
            value={`${Math.min(done + 1, target)}/${target}`}
          />
          <Figure label="Time" value={seconds1(elapsed)} role="timer" />
        </>
      );
      meter = (
        <Meter
          value={done}
          max={target}
          label="Daily progress"
          valueText={`${done} of ${target} answered`}
          size="sm"
        />
      );
      break;
    }
    case "survival": {
      const limit = run.questionTimeLimitMs ?? 15_000;
      const left = run.questionTimeLeftMs ?? limit;
      const total = spec.lives ?? 3;
      const have = run.lives ?? 0;
      figures = (
        <>
          <Figure label="Cleared" value={run.correct} />
          <Figure
            label="Lives"
            value={
              <span
                className="flex h-[1.1em] items-center gap-1.5"
                role="img"
                aria-label={`${have} of ${total} lives`}
              >
                {Array.from({ length: total }, (_, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className={cn(
                      "relative inline-block size-3 rounded-[1px] border border-foreground/80 transition-colors duration-base",
                      i < have ? "bg-foreground" : "bg-transparent",
                    )}
                  >
                    {i >= have && (
                      <PenCross className="absolute -inset-1.5 size-6" />
                    )}
                  </span>
                ))}
              </span>
            }
          />
          <Figure label="This one" value={seconds1(left)} role="timer" />
        </>
      );
      meter = (
        <Meter
          key={run.index}
          variant="timer"
          value={left}
          max={limit}
          label="Time for this question"
          valueText={`${Math.ceil(left / 1000)} seconds`}
          size="sm"
        />
      );
      break;
    }
    case "practice":
      figures = <Figure label="Correct" value={run.correct} />;
      break;
  }

  const stage =
    mode.format === "survival" && run.question
      ? run.question.topicId !== "custom" && run.question.topicId !== "mixed"
        ? getTopic(run.question.topicId).name
        : null
      : null;

  return (
    <header>
      <div className="container flex min-h-16 items-center gap-2 py-2.5 sm:gap-4 sm:py-3 [@media(max-height:560px)]:min-h-12 [@media(max-height:560px)]:py-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPause}
          disabled={!running}
          aria-label="Pause"
          aria-keyshortcuts="Escape"
          className="-ml-2 shrink-0 px-2 text-muted-foreground hover:text-foreground sm:-ml-3 sm:px-3"
        >
          <Pause aria-hidden />
          <span className="hidden sm:inline">Pause</span>
          <Kbd size="sm" className="hidden pointer-fine:sm:inline-flex">
            Esc
          </Kbd>
        </Button>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h1 className="truncate font-serif text-[1.0625rem] font-bold leading-tight text-foreground sm:text-title">
            {modeTitle(mode)}
          </h1>
          <p className="smallcaps truncate leading-tight">
            {stage ? `Stage · ${stage}` : formatLine(mode)}
            {pace && (
              <span className="ml-2 font-mono text-[0.8125rem] tabular-nums text-foreground/80 [font-variant-caps:normal]">
                {pace}
              </span>
            )}
          </p>
        </div>
        {mode.format === "practice" && (
          <Button
            variant="outline"
            size="sm"
            onClick={run.finish}
            disabled={!running}
            className="shrink-0"
          >
            Finish
          </Button>
        )}
        <dl
          aria-label="Score"
          className="flex shrink-0 divide-x divide-foreground/25 rounded-[1px] border border-foreground/60 bg-card/60"
        >
          {figures}
        </dl>
      </div>
      <div className="container">
        {meter ?? <div aria-hidden className="h-px bg-foreground/25" />}
      </div>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {message.text && <p key={message.n}>{message.text}</p>}
      </div>
    </header>
  );
}

/** One cell of the examiner's box: a small-caps label over a typewriter figure. */
function Figure({
  label,
  value,
  role,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  role?: "timer";
  tone?: "warning" | "destructive";
}) {
  return (
    <div className="flex min-w-[3.25rem] flex-col items-start px-2 py-1 sm:min-w-[4.5rem] sm:px-3 sm:py-1.5">
      <dt className="smallcaps whitespace-nowrap text-[0.75rem] leading-none">
        {label}
      </dt>
      <dd
        role={role}
        aria-live={role ? "off" : undefined}
        className={cn(
          "mt-1 font-mono text-mono-md font-medium leading-none tabular-nums text-foreground sm:text-mono-lg",
          tone === "warning" && "text-warning",
          tone === "destructive" && "text-pen",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
