import { useEffect, useRef, useState } from "react";
import { Heart, Pause } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Meter } from "@/components/ui/meter";
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
 * Minimal top bar of the run screen: exit, mode name and the format's
 * meter (sprint clock, speedrun progress, survival lives + per-question
 * clock, daily progress, practice count). Screen readers hear the clock only
 * at 30 / 10 / 5 seconds and when a life is lost.
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

  let readout: React.ReactNode = null;
  let meter: React.ReactNode = null;
  let pace: string | null = null;

  switch (mode.format) {
    case "sprint": {
      const duration = spec.durationMs ?? 60_000;
      const left = run.timeLeftMs ?? duration;
      readout = (
        <>
          <Readout label="Correct" value={run.correct} />
          <Readout
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
      readout = (
        <>
          <Readout label="Correct" value={`${run.correct}/${target}`} />
          <Readout label="Time" value={seconds1(elapsed)} role="timer" />
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
      readout = (
        <>
          <Readout
            label="Question"
            value={`${Math.min(done + 1, target)}/${target}`}
          />
          <Readout label="Time" value={seconds1(elapsed)} role="timer" />
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
      readout = (
        <>
          <Readout label="Cleared" value={run.correct} />
          <div className="flex flex-col items-end gap-1">
            <span className="sr-only">Lives</span>
            <span
              className="flex items-center gap-1"
              role="img"
              aria-label={`${run.lives ?? 0} of ${spec.lives ?? 3} lives`}
            >
              {Array.from({ length: spec.lives ?? 3 }, (_, i) => (
                <Heart
                  key={i}
                  aria-hidden
                  className={cn(
                    "size-4 transition-[color,opacity] duration-base",
                    i < (run.lives ?? 0)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground/40",
                  )}
                />
              ))}
            </span>
            <span className="font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
              {seconds1(left)}
            </span>
          </div>
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
          size="md"
        />
      );
      break;
    }
    case "practice":
      readout = (
        <>
          <Readout label="Correct" value={run.correct} />
          <Button
            variant="outline"
            size="sm"
            onClick={run.finish}
            disabled={!running}
          >
            Finish
          </Button>
        </>
      );
      break;
  }

  const stage =
    mode.format === "survival" && run.question
      ? run.question.topicId !== "custom" && run.question.topicId !== "mixed"
        ? getTopic(run.question.topicId).name
        : null
      : null;

  return (
    <header className="border-b bg-background/90">
      <div className="container flex h-14 items-center gap-2 sm:gap-3 [@media(max-height:480px)]:h-12">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPause}
          disabled={!running}
          aria-label="Pause"
          aria-keyshortcuts="Escape"
          className="-ml-2 shrink-0 text-muted-foreground hover:text-foreground"
        >
          <Pause aria-hidden className="size-5" />
        </Button>
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="truncate text-label font-semibold text-foreground">
            {modeTitle(mode)}
          </h1>
          <p className="truncate text-[0.75rem] text-muted-foreground">
            {stage ? `Stage · ${stage}` : formatLine(mode)}
            {pace && (
              <span className="ml-2 font-mono tabular-nums text-foreground/80">
                {pace}
              </span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4 sm:gap-6">
          {readout}
        </div>
      </div>
      {meter && <div className="container pb-2">{meter}</div>}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {message.text && <p key={message.n}>{message.text}</p>}
      </div>
    </header>
  );
}

function Readout({
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
    <div className="flex flex-col items-end leading-none">
      <span className="text-[0.6875rem] text-muted-foreground">{label}</span>
      <span
        role={role}
        aria-live={role ? "off" : undefined}
        className={cn(
          "mt-1 font-mono text-[1.125rem] font-medium tabular-nums text-foreground sm:text-[1.25rem]",
          tone === "warning" && "text-warning",
          tone === "destructive" && "text-destructive",
        )}
      >
        {value}
      </span>
    </div>
  );
}
