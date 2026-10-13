import { describe, expect, it } from "vitest";
import {
  activeMs,
  createRunState,
  getMode,
  parseRunSnapshot,
  progressSnapshot,
  restoreRunState,
  runClock,
  runReducer,
  runSummary,
  snapshotRun,
  survivalTimeLimitMs,
  type GameMode,
  type RunAction,
  type RunSnapshot,
  type RunState,
} from "..";

const WALL0 = 1_700_000_000_000;

/** Drives a run with an explicit clock (performance.now() starts at 1 000). */
function driver(mode: GameMode, seed = 7) {
  let s: RunState = createRunState(mode, seed);
  let t = 1_000;
  const dispatch = (a: RunAction) => (s = runReducer(s, a));
  return {
    get s() {
      return s;
    },
    get t() {
      return t;
    },
    advance(ms: number) {
      t += ms;
      dispatch({ type: "tick", now: t, wall: WALL0 + t });
    },
    start: () => dispatch({ type: "start", now: t }),
    answer() {
      const a = s.question!.answer;
      for (let i = 1; i <= a.length; i++)
        dispatch({
          type: "input",
          raw: a.slice(0, i),
          now: t,
          wall: WALL0 + t,
        });
    },
    type: (raw: string) =>
      dispatch({ type: "input", raw, now: t, wall: WALL0 + t }),
    skip: () => dispatch({ type: "skip", now: t, wall: WALL0 + t }),
  };
}

/** What storage would hand back: the snapshot through JSON. */
function stored(s: RunState): RunSnapshot {
  const snap = parseRunSnapshot(JSON.parse(JSON.stringify(snapshotRun(s))));
  expect(snap).not.toBeNull();
  return snap!;
}

/** Restores `s` in a fresh page, `gapMs` after the snapshot was taken. */
function reload(s: RunState, gapMs: number, now = 50) {
  const elapsedMs = activeMs(s) + gapMs;
  return restoreRunState(s.mode, s.seed, stored(s), {
    now,
    wall: WALL0 + 999_999,
    elapsedMs,
  });
}

const progress = (s: RunState) => ({
  index: s.index,
  question: s.question,
  correct: s.correct,
  skipped: s.skipped,
  timeouts: s.timeouts,
  penaltyMs: s.penaltyMs,
  lives: s.lives,
  outcomes: s.outcomes,
  input: s.input,
  keystrokes: s.keystrokes,
  deletions: s.deletions,
  questionShownAt: s.questionShownAt,
});

describe("run snapshots", () => {
  it("there is nothing to snapshot before the start", () => {
    expect(snapshotRun(createRunState(getMode("nibbles:sprint")!, 1))).toBe(
      null,
    );
  });

  it("sprint: a restored run is the same run, and its clock kept going", () => {
    const d = driver(getMode("bytes-hex:sprint")!);
    d.start();
    for (let i = 0; i < 6; i++) {
      d.advance(1_200);
      if (i === 2) d.skip();
      else d.answer();
    }
    d.advance(400);
    d.type(d.s.question!.answer.slice(0, 1));
    const r = reload(d.s, 2_500);
    expect(r.status).toBe("running");
    expect(progress(r)).toEqual(progress(d.s));
    // 7.6 s played + 2.5 s reloading.
    expect(runClock(r).timeLeftMs).toBe(60_000 - 7_600 - 2_500);
    // The next question is the one the original run would have shown next.
    const next = runReducer(r, {
      type: "input",
      raw: r.question!.answer,
      now: 60,
      wall: WALL0,
    });
    expect(next.correct).toBe(6);
    expect(next.question).toEqual(d.s.stream.at(7));
  });

  it("sprint: a reload that outlasts the clock ends the run at exactly 60 s", () => {
    const d = driver(getMode("nibbles:sprint")!);
    d.start();
    d.advance(55_000);
    d.answer();
    const r = reload(d.s, 30_000);
    expect(r.status).toBe("finished");
    expect(runSummary(r)).toMatchObject({
      correct: 1,
      durationMs: 60_000,
      completed: true,
    });
  });

  it("speedrun: the time away counts and skip penalties survive", () => {
    const d = driver(getMode("powers:speedrun")!);
    d.start();
    d.advance(1_000);
    d.skip();
    for (let i = 0; i < 5; i++) {
      d.advance(1_000);
      d.answer();
    }
    const r = reload(d.s, 3_000);
    expect(r.penaltyMs).toBe(5_000);
    expect(r.correct).toBe(5);
    expect(activeMs(r)).toBe(6_000 + 3_000);
    let s = r;
    let now = 50;
    for (let i = 0; i < 10; i++) {
      now += 1_000;
      s = runReducer(s, {
        type: "input",
        raw: s.question!.answer,
        now,
        wall: WALL0 + now,
      });
    }
    expect(s.status).toBe("finished");
    expect(runSummary(s)).toMatchObject({
      correct: 15,
      skipped: 1,
      durationMs: 19_000,
      score: 24_000,
      completed: true,
    });
  });

  it("survival: lives are kept, and a question that ran out meanwhile costs one life", () => {
    const d = driver(getMode("survival")!);
    d.start();
    d.advance(1_000);
    d.answer();
    d.skip();
    d.advance(500);
    expect(d.s.lives).toBe(2);
    const quick = reload(d.s, 1_000);
    expect(quick.lives).toBe(2);
    expect(progress(quick)).toEqual(progress(d.s));
    const limit = survivalTimeLimitMs(2, d.s.question!);
    expect(runClock(quick).questionTimeLeftMs).toBe(limit - 1_500);

    const slow = reload(d.s, 10 * 60_000);
    expect(slow.status).toBe("running");
    expect(slow.lives).toBe(1);
    expect(slow.timeouts).toBe(1);
    expect(slow.index).toBe(3);
  });

  it("a finished run comes back finished with the same summary", () => {
    const d = driver(getMode("powers:speedrun")!);
    d.start();
    for (let i = 0; i < 15; i++) {
      d.advance(900);
      if (i === 3) d.skip();
      d.answer();
    }
    expect(d.s.status).toBe("finished");
    const r = reload(d.s, 120_000);
    expect(r.status).toBe("finished");
    expect(runSummary(r)).toEqual(runSummary(d.s));
  });

  it("restoring with nothing answered starts at question 1 on the shared clock", () => {
    const mode = getMode("octal:sprint")!;
    const r = restoreRunState(mode, 3, null, {
      now: 10,
      wall: WALL0,
      elapsedMs: 4_000,
    });
    expect(r.status).toBe("running");
    expect(r.index).toBe(0);
    expect(r.question).toEqual(createRunState(mode, 3).stream.at(0));
    expect(runClock(r).timeLeftMs).toBe(56_000);

    // Survival: the first question's own clock starts when it appears.
    const sv = restoreRunState(getMode("survival")!, 3, null, {
      now: 10,
      wall: WALL0,
      elapsedMs: 40_000,
    });
    expect(sv.lives).toBe(3);
    expect(runClock(sv).questionTimeLeftMs).toBe(
      runClock(sv).questionTimeLimitMs,
    );
  });

  it("a late start keeps the shared clock", () => {
    let s = createRunState(getMode("nibbles:sprint")!, 1);
    s = runReducer(s, { type: "start", now: 5_000, elapsedMs: 1_500 });
    expect(runClock(s).timeLeftMs).toBe(58_500);
    let sv = createRunState(getMode("survival")!, 1);
    sv = runReducer(sv, { type: "start", now: 5_000, elapsedMs: 20_000 });
    sv = runReducer(sv, { type: "tick", now: 5_100, wall: WALL0 });
    expect(sv.lives).toBe(3);
  });

  it("progress alone (another tab) continues after the last correct answer", () => {
    const mode = getMode("bytes-bin:speedrun")!;
    const snap = progressSnapshot(3, [1_000, 2_500, 4_000]);
    const r = restoreRunState(mode, 9, snap, {
      now: 0,
      wall: WALL0,
      elapsedMs: 6_000,
    });
    expect(r.correct).toBe(3);
    expect(r.index).toBe(3);
    expect(r.outcomes.map((o) => o.elapsedMs)).toEqual([1_000, 1_500, 1_500]);
    expect(r.questionShownAt).toBe(4_000);
    expect(r.question).toEqual(createRunState(mode, 9).stream.at(3));
    // Missing marks never move time backwards.
    expect(progressSnapshot(3, [1_000]).outcomes).toEqual([
      ["c", 1_000, 0, 0],
      ["c", 0, 0, 0],
      ["c", 0, 0, 0],
    ]);
  });

  it("progress that already reached the target finishes the run", () => {
    const r = restoreRunState(
      getMode("powers:speedrun")!,
      1,
      progressSnapshot(
        15,
        Array.from({ length: 15 }, (_, i) => (i + 1) * 1_000),
      ),
      { now: 0, wall: WALL0, elapsedMs: 16_000 },
    );
    expect(r.status).toBe("finished");
    expect(runSummary(r)).toMatchObject({
      durationMs: 15_000,
      completed: true,
    });
  });

  it("rejects anything that is not a snapshot", () => {
    const good = progressSnapshot(1, [500]);
    expect(parseRunSnapshot(good)).toEqual(good);
    for (const bad of [
      null,
      "x",
      { ...good, v: 2 },
      { ...good, outcomes: [["x", 1, 0, 0]] },
      { ...good, outcomes: [["c", -1, 0, 0]] },
      { ...good, outcomes: [["c", 1, 0]] },
      { ...good, shownAt: Number.NaN },
      { ...good, input: 5 },
      { ...good, end: [1, 2] },
      { ...good, end: [1, 2, "yes"] },
    ])
      expect(parseRunSnapshot(bad)).toBeNull();
  });
});
