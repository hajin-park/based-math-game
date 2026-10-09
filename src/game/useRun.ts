/**
 * useRun: headless React hook that drives one run of a mode. It owns no UI and
 * does not touch Firebase or routing; render whatever you like from its state
 * and report the RunSummary from `onFinish`.
 *
 * Timing uses performance.now() with a single interval ticker; all clocks are
 * derived from elapsed wall time (see run.ts), so throttled background tabs
 * never make the timers drift.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { isAcceptableKeystroke } from "./answer";
import {
  createRunState,
  runClock,
  runReducer,
  runSummary,
  type RunReveal,
  type RunStatus,
} from "./run";
import type { GameMode, Question, QuestionOutcome, RunSummary } from "./types";

export interface UseRunOptions {
  mode: GameMode;
  /** Run seed. Ignored for daily modes (they use the date seed). Changing mode or seed resets the run. */
  seed: number;
  /** Called once when the run finishes (naturally or via finish()). */
  onFinish?: (summary: RunSummary) => void;
  /** Freeze all clocks and ignore input (countdown overlays, waiting for a room). */
  paused?: boolean;
  /** Start as soon as the hook mounts and is not paused. */
  autoStart?: boolean;
  /** Ticker interval in ms (default 100). */
  tickMs?: number;
}

export interface UseRunResult {
  /** The mode being played (as passed in; custom configs normalised). */
  mode: GameMode;
  status: RunStatus;
  /** Current question; null before start() and after the run ends. */
  question: Question | null;
  index: number;
  input: string;
  /**
   * Update the answer field. Rejects (returns false, input unchanged) characters
   * invalid for the answer format and input longer than maxLength. A correct
   * answer is recorded and the next question appears immediately.
   */
  setInput: (raw: string) => boolean;
  /**
   * Give up on the current question. Sprint: no point. Speedrun / daily: adds
   * spec.skipPenaltyMs. Survival: costs a life. Practice: free. In every
   * format `reveal` is set to the skipped question (practice UIs show its
   * worked solution via explainQuestion; others may flash the answer).
   */
  skip: () => void;
  /** Sprint: remaining time. Null for other formats. */
  timeLeftMs: number | null;
  /** Survival: remaining time on this question. Null for other formats. */
  questionTimeLeftMs: number | null;
  questionTimeLimitMs: number | null;
  /** Survival lives left; null for other formats. */
  lives: number | null;
  correct: number;
  skipped: number;
  timeouts: number;
  /** Accumulated skip penalties (speedrun / daily). */
  penaltyMs: number;
  /** Active run time (pauses excluded). */
  elapsedMs: number;
  outcomes: QuestionOutcome[];
  /** Last skipped / timed-out question; cleared by the next correct answer or dismissReveal(). */
  reveal: RunReveal | null;
  dismissReveal: () => void;
  /** Set once the run has finished. */
  summary: RunSummary | null;
  /** Effective seed (daily: the date seed). */
  seed: number;
  start: () => void;
  /** End the run now. Only practice counts an early finish as completed. */
  finish: () => void;
  /** Throw away the current run and get ready to start a new one with the same mode and seed. */
  reset: () => void;
}

const now = () => performance.now();

export function useRun({
  mode,
  seed,
  onFinish,
  paused = false,
  autoStart = false,
  tickMs = 100,
}: UseRunOptions): UseRunResult {
  const [state, dispatch] = useReducer(runReducer, undefined, () =>
    createRunState(mode, seed),
  );

  // Reset when the mode (including a custom config) or seed changes.
  const key = `${mode.id}|${seed}|${mode.custom ? JSON.stringify(mode.custom) : ""}`;
  const keyRef = useRef(key);
  useEffect(() => {
    if (keyRef.current === key) return;
    keyRef.current = key;
    dispatch({ type: "reset", mode, seed });
  }, [key, mode, seed]);

  // Pause / resume follow the prop (idempotent in the reducer).
  useEffect(() => {
    dispatch(
      paused ? { type: "pause", now: now() } : { type: "resume", now: now() },
    );
  }, [paused, state.status, state.runId]);

  useEffect(() => {
    if (autoStart && !paused && state.status === "ready")
      dispatch({ type: "start", now: now() });
  }, [autoStart, paused, state.status, state.runId]);

  // Single ticker while running; also tick immediately when the tab becomes visible.
  const ticking = state.status === "running" && !paused;
  useEffect(() => {
    if (!ticking) return;
    const tick = () => dispatch({ type: "tick", now: now(), wall: Date.now() });
    const id = setInterval(tick, tickMs);
    const onVisible = () => {
      if (
        typeof document === "undefined" ||
        document.visibilityState === "visible"
      )
        tick();
    };
    if (typeof document !== "undefined")
      document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      if (typeof document !== "undefined")
        document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ticking, tickMs]);

  const summary = useMemo(
    () => (state.status === "finished" ? runSummary(state) : null),
    [state],
  );

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);
  const reportedRunRef = useRef<number | null>(null);
  useEffect(() => {
    if (summary && reportedRunRef.current !== state.runId) {
      reportedRunRef.current = state.runId;
      onFinishRef.current?.(summary);
    }
  }, [summary, state.runId]);

  const question = state.question;
  const setInput = useCallback(
    (raw: string) => {
      if (!question || state.status !== "running" || paused) return false;
      if (!isAcceptableKeystroke(raw, question)) return false;
      dispatch({ type: "input", raw, now: now(), wall: Date.now() });
      return true;
    },
    [question, state.status, paused],
  );
  const skip = useCallback(
    () => dispatch({ type: "skip", now: now(), wall: Date.now() }),
    [],
  );
  const start = useCallback(() => dispatch({ type: "start", now: now() }), []);
  const finish = useCallback(
    () => dispatch({ type: "finish", now: now(), wall: Date.now() }),
    [],
  );
  const dismissReveal = useCallback(
    () => dispatch({ type: "dismissReveal" }),
    [],
  );
  const reset = useCallback(
    () => dispatch({ type: "reset", mode, seed }),
    [mode, seed],
  );

  const clock = runClock(state);
  return {
    mode: state.mode,
    status: state.status,
    question: state.status === "running" ? question : null,
    index: state.index,
    input: state.input,
    setInput,
    skip,
    timeLeftMs: clock.timeLeftMs,
    questionTimeLeftMs: clock.questionTimeLeftMs,
    questionTimeLimitMs: clock.questionTimeLimitMs,
    lives: state.lives,
    correct: state.correct,
    skipped: state.skipped,
    timeouts: state.timeouts,
    penaltyMs: state.penaltyMs,
    elapsedMs: clock.elapsedMs,
    outcomes: state.outcomes,
    reveal: state.reveal,
    dismissReveal,
    summary,
    seed: state.seed,
    start,
    finish,
    reset,
  };
}
