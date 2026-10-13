/**
 * Pure run state machine behind useRun. All time values come in through
 * actions (`now` from performance.now(), `wall` from Date.now()), so the
 * reducer is deterministic and testable without React or timers.
 *
 * Time model: "active time" is wall time since start minus time spent paused.
 * Every timer (sprint clock, survival per-question clock, speedrun time) is
 * derived from active time at the moment of each action, so throttled timers
 * in background tabs never drift: the next tick or keystroke catches up.
 */
import { checkAnswer, isAcceptableKeystroke } from "./answer";
import { survivalTimeLimitMs } from "./formats";
import { summarizeRun } from "./scoring";
import { createQuestionStream, type QuestionStream } from "./stream";
import type { GameMode, Question, QuestionOutcome, RunSummary } from "./types";

export type RunStatus = "ready" | "running" | "finished";

/** The last question that was skipped or timed out, for the UI to reveal. */
export interface RunReveal {
  question: Question;
  result: "skipped" | "timeout";
}

export interface RunState {
  /** Increments on every reset, so consumers can tell runs apart. */
  runId: number;
  status: RunStatus;
  mode: GameMode;
  /** Effective seed (daily modes use the date seed). */
  seed: number;
  stream: QuestionStream;
  index: number;
  question: Question | null;
  input: string;
  /** performance.now() at start; null before start. */
  startedAt: number | null;
  pausedAt: number | null;
  pausedTotal: number;
  /** Latest performance.now() seen by the reducer. */
  now: number;
  /** Active ms at which the current question appeared. */
  questionShownAt: number;
  lives: number | null;
  correct: number;
  skipped: number;
  timeouts: number;
  penaltyMs: number;
  keystrokes: number;
  deletions: number;
  outcomes: QuestionOutcome[];
  reveal: RunReveal | null;
  /** Active ms at finish. */
  finishedAt: number | null;
  /** Date.now() at finish. */
  endedAt: number | null;
  completed: boolean;
}

export type RunAction =
  | { type: "reset"; mode: GameMode; seed: number }
  /** `elapsedMs`: the run began that long before `now` (a shared start passed). */
  | { type: "start"; now: number; elapsedMs?: number }
  /** Rebuild a run in progress `elapsedMs` after its start (see restoreRun). */
  | {
      type: "restore";
      snapshot: RunSnapshot | null;
      now: number;
      wall: number;
      elapsedMs: number;
    }
  | { type: "input"; raw: string; now: number; wall: number }
  | { type: "skip"; now: number; wall: number }
  | { type: "tick"; now: number; wall: number }
  | { type: "pause"; now: number }
  | { type: "resume"; now: number }
  | { type: "finish"; now: number; wall: number }
  | { type: "dismissReveal" };

export function createRunState(
  mode: GameMode,
  seed: number,
  runId = 0,
): RunState {
  const stream = createQuestionStream(mode, seed);
  return {
    runId,
    status: "ready",
    mode,
    seed: stream.seed,
    stream,
    index: 0,
    question: null,
    input: "",
    startedAt: null,
    pausedAt: null,
    pausedTotal: 0,
    now: 0,
    questionShownAt: 0,
    lives: mode.format === "survival" ? (mode.spec.lives ?? 3) : null,
    correct: 0,
    skipped: 0,
    timeouts: 0,
    penaltyMs: 0,
    keystrokes: 0,
    deletions: 0,
    outcomes: [],
    reveal: null,
    finishedAt: null,
    endedAt: null,
    completed: false,
  };
}

/** Active (unpaused) ms since start at time `now`. */
export function activeMs(s: RunState, now: number = s.now): number {
  if (s.finishedAt !== null) return s.finishedAt;
  if (s.startedAt === null) return 0;
  const pausedNow = s.pausedAt !== null ? now - s.pausedAt : 0;
  return Math.max(0, now - s.startedAt - s.pausedTotal - pausedNow);
}

/** Survival time limit of the current question (null for other formats). */
export function questionLimitMs(s: RunState): number | null {
  if (s.mode.format !== "survival" || !s.question) return null;
  return survivalTimeLimitMs(s.index, s.question);
}

export interface RunClock {
  elapsedMs: number;
  /** Sprint: remaining run time. */
  timeLeftMs: number | null;
  /** Survival: remaining time on the current question. */
  questionTimeLeftMs: number | null;
  questionTimeLimitMs: number | null;
}

export function runClock(s: RunState, now: number = s.now): RunClock {
  const elapsed = activeMs(s, now);
  const duration =
    s.mode.format === "sprint" ? s.mode.spec.durationMs : undefined;
  const limit = questionLimitMs(s);
  return {
    elapsedMs: elapsed,
    timeLeftMs: duration !== undefined ? Math.max(0, duration - elapsed) : null,
    questionTimeLeftMs:
      limit !== null
        ? s.status === "running"
          ? Math.max(0, limit - (elapsed - s.questionShownAt))
          : limit
        : null,
    questionTimeLimitMs: limit,
  };
}

function finish(
  s: RunState,
  at: number,
  wall: number,
  completed: boolean,
): RunState {
  return {
    ...s,
    status: "finished",
    finishedAt: at,
    endedAt: wall,
    completed,
    input: "",
  };
}

/** Record an outcome for the current question at active time `at`, then advance or finish. */
function resolve(
  s: RunState,
  result: QuestionOutcome["result"],
  at: number,
  wall: number,
): RunState {
  const question = s.question!;
  const outcome: QuestionOutcome = {
    question,
    result,
    elapsedMs: Math.max(0, Math.round(at - s.questionShownAt)),
    keystrokes: s.keystrokes,
    deletions: s.deletions,
  };
  const spec = s.mode.spec;
  const next: RunState = {
    ...s,
    outcomes: [...s.outcomes, outcome],
    correct: s.correct + (result === "correct" ? 1 : 0),
    skipped: s.skipped + (result === "skipped" ? 1 : 0),
    timeouts: s.timeouts + (result === "timeout" ? 1 : 0),
    penaltyMs:
      s.penaltyMs + (result === "skipped" ? (spec.skipPenaltyMs ?? 0) : 0),
    lives: s.lives !== null && result !== "correct" ? s.lives - 1 : s.lives,
    reveal: result === "correct" ? null : { question, result },
  };
  const format = s.mode.format;
  if (format === "survival" && next.lives !== null && next.lives <= 0)
    return finish(next, at, wall, true);
  if (
    format === "speedrun" &&
    spec.targetCount &&
    next.correct >= spec.targetCount
  ) {
    return finish(next, at, wall, true);
  }
  if (
    format === "daily" &&
    spec.targetCount &&
    next.outcomes.length >= spec.targetCount
  ) {
    return finish(next, at, wall, true);
  }
  const index = s.index + 1;
  return {
    ...next,
    index,
    question: s.stream.at(index),
    input: "",
    keystrokes: 0,
    deletions: 0,
    questionShownAt: at,
  };
}

/** Apply time-based transitions (sprint clock, survival timeouts) up to `now`. */
function advanceClock(s: RunState, now: number, wall: number): RunState {
  if (s.status !== "running" || s.pausedAt !== null)
    return s.now === now ? s : { ...s, now };
  let state = s.now === now ? s : { ...s, now };
  const elapsed = activeMs(state, now);
  const duration = state.mode.spec.durationMs;
  if (
    state.mode.format === "sprint" &&
    duration !== undefined &&
    elapsed >= duration
  ) {
    return finish(state, duration, wall, true);
  }
  const limit = questionLimitMs(state);
  if (limit !== null && elapsed - state.questionShownAt >= limit) {
    // The timed-out question ends at its deadline; the next one starts now, so
    // returning to a background tab costs one life, not all of them.
    state = resolve(state, "timeout", state.questionShownAt + limit, wall);
    if (state.status === "running")
      state = { ...state, questionShownAt: elapsed };
  }
  return state;
}

export function runReducer(s: RunState, a: RunAction): RunState {
  switch (a.type) {
    case "reset":
      return createRunState(a.mode, a.seed, s.runId + 1);
    case "start": {
      if (s.status !== "ready") return s;
      const late = Math.max(0, a.elapsedMs ?? 0);
      return {
        ...s,
        status: "running",
        startedAt: a.now - late,
        now: a.now,
        pausedAt: null,
        pausedTotal: 0,
        index: 0,
        question: s.stream.at(0),
        // A survival question's own clock starts when it appears, so a late
        // start never costs a life before the first question is seen.
        questionShownAt: s.mode.format === "survival" ? late : 0,
      };
    }
    case "restore":
      return restoreRun(
        { ...createRunState(s.mode, s.seed, s.runId + 1), stream: s.stream },
        a.snapshot,
        a,
      );
    case "pause":
      if (s.status !== "running" || s.pausedAt !== null) return s;
      return { ...s, pausedAt: a.now, now: a.now };
    case "resume":
      if (s.pausedAt === null) return s;
      return {
        ...s,
        pausedTotal: s.pausedTotal + (a.now - s.pausedAt),
        pausedAt: null,
        now: a.now,
      };
    case "tick":
      return advanceClock(s, a.now, a.wall);
    case "dismissReveal":
      return s.reveal ? { ...s, reveal: null } : s;
    case "finish": {
      if (s.status === "finished") return s;
      if (s.status === "ready")
        return finish({ ...s, startedAt: a.now, now: a.now }, 0, a.wall, false);
      const state = advanceClock(s, a.now, a.wall);
      if (state.status === "finished") return state;
      return finish(
        state,
        activeMs(state, a.now),
        a.wall,
        s.mode.format === "practice",
      );
    }
    case "skip": {
      const state = advanceClock(s, a.now, a.wall);
      if (
        state.status !== "running" ||
        state.pausedAt !== null ||
        !state.question
      )
        return state;
      return resolve(state, "skipped", activeMs(state, a.now), a.wall);
    }
    case "input": {
      const state = advanceClock(s, a.now, a.wall);
      if (
        state.status !== "running" ||
        state.pausedAt !== null ||
        !state.question
      )
        return state;
      // A different question may be showing now (survival timeout); keystrokes
      // typed for the old one are dropped.
      if (state.question !== s.question) return state;
      if (
        a.raw === state.input ||
        !isAcceptableKeystroke(a.raw, state.question)
      )
        return state;
      const added = Math.max(0, a.raw.length - state.input.length);
      const removed = Math.max(0, state.input.length - a.raw.length);
      const typed: RunState = {
        ...state,
        input: a.raw,
        keystrokes: state.keystrokes + added,
        deletions: state.deletions + removed,
      };
      if (checkAnswer(state.question, a.raw)) {
        return resolve(typed, "correct", activeMs(typed, a.now), a.wall);
      }
      return typed;
    }
  }
}

// ---------------------------------------------------------------------------
// Snapshots: a compact, JSON-safe record of a run in progress, so a page that
// reloads mid-run (a multiplayer round) can continue where it was. Questions
// are not stored: the stream is deterministic, so outcome k is question k.

type OutcomeCode = "c" | "s" | "t";
const CODE: Record<QuestionOutcome["result"], OutcomeCode> = {
  correct: "c",
  skipped: "s",
  timeout: "t",
};
const RESULT: Record<OutcomeCode, QuestionOutcome["result"]> = {
  c: "correct",
  s: "skipped",
  t: "timeout",
};

export interface RunSnapshot {
  v: 1;
  /** Resolved questions in order: [result, elapsedMs, keystrokes, deletions]. */
  outcomes: Array<[OutcomeCode, number, number, number]>;
  /** Active ms at which the current question appeared. */
  shownAt: number;
  /** Partial answer typed for the current question. */
  input: string;
  keystrokes: number;
  deletions: number;
  /** Set once finished: [active ms at finish, Date.now() at finish, completed]. */
  end?: [number, number, boolean];
}

/** Longest run a snapshot may describe (survival tops out far below this). */
const MAX_SNAPSHOT_OUTCOMES = 5000;

/** Snapshot of `s`; null before the run has started. */
export function snapshotRun(
  s: Pick<
    RunState,
    | "status"
    | "outcomes"
    | "questionShownAt"
    | "input"
    | "keystrokes"
    | "deletions"
    | "finishedAt"
    | "endedAt"
    | "completed"
  >,
): RunSnapshot | null {
  if (s.status === "ready") return null;
  const snap: RunSnapshot = {
    v: 1,
    outcomes: s.outcomes.map((o) => [
      CODE[o.result],
      o.elapsedMs,
      o.keystrokes,
      o.deletions,
    ]),
    shownAt: s.questionShownAt,
    input: s.input,
    keystrokes: s.keystrokes,
    deletions: s.deletions,
  };
  if (s.status === "finished" && s.finishedAt !== null)
    snap.end = [s.finishedAt, s.endedAt ?? 0, s.completed];
  return snap;
}

const isCount = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n) && n >= 0;

/** Validates stored data as a snapshot (null when it is not one). */
export function parseRunSnapshot(value: unknown): RunSnapshot | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Partial<RunSnapshot>;
  if (v.v !== 1 || !Array.isArray(v.outcomes)) return null;
  if (v.outcomes.length > MAX_SNAPSHOT_OUTCOMES) return null;
  for (const o of v.outcomes as unknown[]) {
    if (
      !Array.isArray(o) ||
      o.length !== 4 ||
      !(o[0] === "c" || o[0] === "s" || o[0] === "t") ||
      !isCount(o[1]) ||
      !isCount(o[2]) ||
      !isCount(o[3])
    )
      return null;
  }
  if (!isCount(v.shownAt) || !isCount(v.keystrokes) || !isCount(v.deletions))
    return null;
  if (typeof v.input !== "string" || v.input.length > 64) return null;
  const e = v.end as unknown;
  if (
    e !== undefined &&
    !(
      Array.isArray(e) &&
      e.length === 3 &&
      isCount(e[0]) &&
      isCount(e[1]) &&
      typeof e[2] === "boolean"
    )
  )
    return null;
  return {
    v: 1,
    outcomes: v.outcomes.map((o) => [o[0], o[1], o[2], o[3]]),
    shownAt: v.shownAt,
    input: v.input,
    keystrokes: v.keystrokes,
    deletions: v.deletions,
    ...(v.end ? { end: [v.end[0], v.end[1], v.end[2]] } : {}),
  };
}

/**
 * A snapshot from recorded progress alone (a multiplayer score): `correct`
 * answers, `marks[k]` = active ms at which answer k + 1 was given. Skips and
 * timeouts are not recorded there, so the run continues right after the
 * last correct answer.
 */
export function progressSnapshot(
  correct: number,
  marks: readonly number[],
): RunSnapshot {
  const n = Math.max(0, Math.min(Math.floor(correct), MAX_SNAPSHOT_OUTCOMES));
  const outcomes: RunSnapshot["outcomes"] = [];
  let last = 0;
  for (let i = 0; i < n; i++) {
    const at = isCount(marks[i]) ? Math.max(last, marks[i]) : last;
    outcomes.push(["c", Math.round(at - last), 0, 0]);
    last = at;
  }
  return {
    v: 1,
    outcomes,
    shownAt: Math.round(last),
    input: "",
    keystrokes: 0,
    deletions: 0,
  };
}

/** Whether the outcomes alone end the run (lives gone, target reached). */
function outcomesEndRun(s: RunState): boolean {
  const spec = s.mode.spec;
  switch (s.mode.format) {
    case "survival":
      return s.lives !== null && s.lives <= 0;
    case "speedrun":
      return !!spec.targetCount && s.correct >= spec.targetCount;
    case "daily":
      return !!spec.targetCount && s.outcomes.length >= spec.targetCount;
    default:
      return false;
  }
}

/**
 * Rebuilds a run from `snap` (null = nothing answered yet) as if it had
 * started `elapsedMs` before `now`. The clocks keep running across the gap:
 * a sprint loses the time spent away, a speedrun counts it, and a survival
 * question that ran out meanwhile costs one life.
 */
function restoreRun(
  base: RunState,
  snap: RunSnapshot | null,
  at: { now: number; wall: number; elapsedMs: number },
): RunState {
  const elapsed = Math.max(0, at.elapsedMs);
  const outcomes: QuestionOutcome[] = (snap?.outcomes ?? []).map(
    ([code, elapsedMs, keystrokes, deletions], i) => ({
      question: base.stream.at(i),
      result: RESULT[code],
      elapsedMs,
      keystrokes,
      deletions,
    }),
  );
  let correct = 0;
  let skipped = 0;
  let timeouts = 0;
  for (const o of outcomes) {
    if (o.result === "correct") correct++;
    else if (o.result === "skipped") skipped++;
    else timeouts++;
  }
  const index = outcomes.length;
  const question = base.stream.at(index);
  const shownAt = snap
    ? Math.min(snap.shownAt, elapsed)
    : base.mode.format === "survival"
      ? elapsed
      : 0;
  let state: RunState = {
    ...base,
    status: "running",
    startedAt: at.now - elapsed,
    now: at.now,
    pausedAt: null,
    pausedTotal: 0,
    outcomes,
    correct,
    skipped,
    timeouts,
    penaltyMs: skipped * (base.mode.spec.skipPenaltyMs ?? 0),
    lives:
      base.lives !== null ? Math.max(0, base.lives - skipped - timeouts) : null,
    index,
    question,
    questionShownAt: shownAt,
    input: "",
    keystrokes: 0,
    deletions: 0,
    reveal: null,
  };
  if (snap?.end) {
    const [finishedAt, endedAt, completed] = snap.end;
    return finish(state, finishedAt, endedAt, completed);
  }
  if (outcomesEndRun(state)) return finish(state, shownAt, at.wall, true);
  if (
    snap?.input &&
    isAcceptableKeystroke(snap.input, question) &&
    !checkAnswer(question, snap.input)
  ) {
    state = {
      ...state,
      input: snap.input,
      keystrokes: snap.keystrokes,
      deletions: snap.deletions,
    };
  }
  return advanceClock(state, at.now, at.wall);
}

/** A run of `mode` restored from `snap` (see the "restore" action). */
export function restoreRunState(
  mode: GameMode,
  seed: number,
  snap: RunSnapshot | null,
  at: { now: number; wall: number; elapsedMs: number },
): RunState {
  return runReducer(createRunState(mode, seed), {
    type: "restore",
    snapshot: snap,
    ...at,
  });
}

/** Summary of a finished (or in-progress) run. */
export function runSummary(
  s: RunState,
  endedAt: number = s.endedAt ?? Date.now(),
): RunSummary {
  return summarizeRun({
    mode: s.mode,
    seed: s.seed,
    outcomes: s.outcomes,
    durationMs: s.finishedAt ?? activeMs(s),
    completed: s.completed,
    endedAt,
  });
}
