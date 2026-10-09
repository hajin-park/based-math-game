import { describe, expect, it } from "vitest";
import {
  createRunState,
  customMode,
  dailyModeFor,
  getMode,
  runClock,
  runReducer,
  runSummary,
  survivalTimeLimitMs,
  type GameMode,
  type RunAction,
  type RunState,
} from "..";

/** Tiny driver: applies actions with an explicit clock. */
function driver(mode: GameMode, seed = 1) {
  let s: RunState = createRunState(mode, seed);
  let t = 1_000; // performance.now()
  const wall = () => 1_700_000_000_000 + t;
  const dispatch = (a: RunAction) => {
    s = runReducer(s, a);
    return s;
  };
  return {
    get s() {
      return s;
    },
    advance(ms: number) {
      t += ms;
      dispatch({ type: "tick", now: t, wall: wall() });
    },
    start: () => dispatch({ type: "start", now: t }),
    type(raw: string) {
      dispatch({ type: "input", raw, now: t, wall: wall() });
    },
    /** Type the current answer character by character. */
    answer() {
      const a = s.question!.answer;
      for (let i = 1; i <= a.length; i++)
        dispatch({ type: "input", raw: a.slice(0, i), now: t, wall: wall() });
    },
    skip: () => dispatch({ type: "skip", now: t, wall: wall() }),
    pause: () => dispatch({ type: "pause", now: t }),
    resume: () => dispatch({ type: "resume", now: t }),
    finish: () => dispatch({ type: "finish", now: t, wall: wall() }),
  };
}

describe("run state machine", () => {
  it("is ready until started, then shows question 0", () => {
    const d = driver(getMode("nibbles:sprint")!);
    expect(d.s.status).toBe("ready");
    expect(d.s.question).toBeNull();
    d.type("1");
    expect(d.s.input).toBe("");
    d.start();
    expect(d.s.status).toBe("running");
    expect(d.s.question).toEqual(d.s.stream.at(0));
  });

  it("sprint: correct answers advance immediately; time up ends the run at exactly 60 s", () => {
    const d = driver(getMode("bytes-hex:sprint")!);
    d.start();
    for (let i = 0; i < 10; i++) {
      d.advance(1_500);
      d.answer();
    }
    expect(d.s.correct).toBe(10);
    expect(d.s.index).toBe(10);
    d.skip();
    expect(d.s.skipped).toBe(1);
    expect(d.s.penaltyMs).toBe(0);
    expect(d.s.reveal?.result).toBe("skipped");
    d.advance(1_000);
    d.answer();
    expect(d.s.reveal).toBeNull();
    expect(runClock(d.s).timeLeftMs).toBe(60_000 - 16_000);
    d.advance(100_000); // background tab: one late tick
    expect(d.s.status).toBe("finished");
    const sum = runSummary(d.s);
    expect(sum).toMatchObject({
      score: 11,
      correct: 11,
      skipped: 1,
      durationMs: 60_000,
      completed: true,
    });
    expect(sum.outcomes[0].elapsedMs).toBe(1_500);
    expect(sum.outcomes[0].keystrokes).toBe(
      sum.outcomes[0].question.answer.length,
    );
  });

  it("ignores invalid keystrokes and counts deletions", () => {
    const d = driver(getMode("bytes-bin:sprint")!);
    d.start();
    const q = d.s.question!;
    const wrong = q.answerFormat === "binary" ? "2" : "z";
    d.type(wrong);
    expect(d.s.input).toBe("");
    const firstDigit = q.answer[0] === "1" ? "0" : "1";
    d.type(firstDigit);
    d.type("");
    d.answer();
    expect(d.s.outcomes[0]).toMatchObject({
      result: "correct",
      deletions: 1,
      keystrokes: q.answer.length + 1,
    });
  });

  it("finishing a sprint early is not a completed run", () => {
    const d = driver(getMode("nibbles:sprint")!);
    d.start();
    d.advance(5_000);
    d.finish();
    expect(d.s.status).toBe("finished");
    expect(runSummary(d.s)).toMatchObject({
      completed: false,
      durationMs: 5_000,
    });
  });

  it("speedrun: ends on the 15th correct answer; skips add 5 s", () => {
    const d = driver(getMode("powers:speedrun")!);
    d.start();
    d.advance(2_000);
    d.skip();
    for (let i = 0; i < 15; i++) {
      d.advance(1_000);
      d.answer();
    }
    expect(d.s.status).toBe("finished");
    const sum = runSummary(d.s);
    expect(sum).toMatchObject({
      correct: 15,
      skipped: 1,
      durationMs: 17_000,
      score: 22_000,
      completed: true,
    });
  });

  it("daily: ends after 10 questions; skips add 10 s", () => {
    const d = driver(dailyModeFor("2026-10-09"), 12345);
    d.start();
    for (let i = 0; i < 10; i++) {
      d.advance(3_000);
      if (i === 4) d.skip();
      else d.answer();
    }
    expect(d.s.status).toBe("finished");
    const sum = runSummary(d.s);
    expect(sum).toMatchObject({
      correct: 9,
      skipped: 1,
      durationMs: 30_000,
      score: 40_000,
      completed: true,
    });
    expect(sum.seed).toBe(d.s.stream.seed);
  });

  it("survival: timeouts and skips cost lives; three strikes end the run", () => {
    const d = driver(getMode("survival")!);
    d.start();
    d.advance(1_000);
    d.answer();
    expect(d.s.lives).toBe(3);
    const limit = survivalTimeLimitMs(1, d.s.question!);
    expect(runClock(d.s).questionTimeLimitMs).toBe(limit);
    d.advance(limit - 100);
    expect(d.s.lives).toBe(3);
    expect(runClock(d.s).questionTimeLeftMs).toBe(100);
    d.advance(200);
    expect(d.s.lives).toBe(2);
    expect(d.s.timeouts).toBe(1);
    expect(d.s.reveal?.result).toBe("timeout");
    expect(d.s.outcomes[1]).toMatchObject({
      result: "timeout",
      elapsedMs: limit,
    });
    expect(d.s.index).toBe(2);
    d.skip();
    expect(d.s.lives).toBe(1);
    // A long background stint costs one life, not all of them.
    d.advance(10 * 60_000);
    expect(d.s.status).toBe("finished");
    expect(d.s.lives).toBe(0);
    expect(runSummary(d.s)).toMatchObject({ score: 1, completed: true });
  });

  it("survival: a long absence with lives to spare costs exactly one life", () => {
    const d = driver(getMode("survival")!);
    d.start();
    d.advance(10 * 60_000);
    expect(d.s.lives).toBe(2);
    expect(d.s.status).toBe("running");
    expect(runClock(d.s).questionTimeLeftMs).toBe(
      survivalTimeLimitMs(1, d.s.question!),
    );
  });

  it("pause freezes every clock and blocks input", () => {
    const d = driver(getMode("survival")!);
    d.start();
    d.advance(2_000);
    d.pause();
    d.advance(60_000);
    expect(d.s.lives).toBe(3);
    expect(runClock(d.s).elapsedMs).toBe(2_000);
    const q = d.s.question!;
    d.type(q.answer);
    expect(d.s.correct).toBe(0);
    d.resume();
    d.advance(500);
    expect(runClock(d.s).elapsedMs).toBe(2_500);
    d.answer();
    expect(d.s.correct).toBe(1);
    expect(d.s.outcomes[0].elapsedMs).toBe(2_500);
  });

  it("practice: skip reveals, run never ends on its own, finish is completed", () => {
    const d = driver(getMode("twos:practice")!);
    d.start();
    const q = d.s.question!;
    d.skip();
    expect(d.s.reveal).toEqual({ question: q, result: "skipped" });
    d.advance(10 * 60_000);
    expect(d.s.status).toBe("running");
    d.finish();
    expect(runSummary(d.s).completed).toBe(true);
  });

  it("custom speedrun uses its own target", () => {
    const mode = customMode({
      conversions: [{ from: 2, to: 10, min: 0, max: 15 }],
      targetCount: 3,
    });
    const d = driver(mode);
    d.start();
    for (let i = 0; i < 3; i++) {
      d.advance(1_000);
      d.answer();
    }
    expect(d.s.status).toBe("finished");
    expect(runSummary(d.s)).toMatchObject({
      modeId: "custom",
      correct: 3,
      score: 3_000,
    });
  });

  it("reset starts a fresh run with a new runId", () => {
    const d = driver(getMode("nibbles:sprint")!);
    d.start();
    const next = runReducer(d.s, {
      type: "reset",
      mode: getMode("octal:sprint")!,
      seed: 2,
    });
    expect(next.runId).toBe(d.s.runId + 1);
    expect(next.status).toBe("ready");
    expect(next.mode.id).toBe("octal:sprint");
  });
});
