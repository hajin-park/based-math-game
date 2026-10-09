import { describe, expect, it } from "vitest";
import {
  compareScores,
  createQuestionStream,
  dailyModeFor,
  formatScore,
  FORMATS,
  getMode,
  isBetterScore,
  SCORE_LIMITS,
  summarizeRun,
  survivalTimeLimitMs,
  validateSummary,
  type GameMode,
  type QuestionOutcome,
} from "..";

function outcomes(
  mode: GameMode,
  results: QuestionOutcome["result"][],
  msEach = 2000,
): QuestionOutcome[] {
  const s = createQuestionStream(mode, 1);
  return results.map((result, i) => ({
    question: s.at(i),
    result,
    elapsedMs: msEach,
    keystrokes: 4,
    deletions: 1,
  }));
}

describe("summarizeRun", () => {
  it("sprint scores correct answers", () => {
    const mode = getMode("nibbles:sprint")!;
    const s = summarizeRun({
      mode,
      seed: 9,
      outcomes: outcomes(mode, ["correct", "correct", "skipped", "correct"]),
      durationMs: 60_000,
      completed: true,
      endedAt: 1,
    });
    expect(s).toMatchObject({
      modeId: "nibbles:sprint",
      topicId: "nibbles",
      format: "sprint",
      score: 3,
      correct: 3,
      skipped: 1,
      durationMs: 60_000,
      accuracy: 0.75,
      typingAccuracy: 0.75,
      seed: 9,
      endedAt: 1,
      completed: true,
    });
  });

  it("speedrun scores time plus 5 s per skip", () => {
    const mode = getMode("bytes-hex:speedrun")!;
    const results: QuestionOutcome["result"][] = [
      ...Array(15).fill("correct"),
      "skipped",
      "skipped",
    ];
    const s = summarizeRun({
      mode,
      seed: 1,
      outcomes: outcomes(mode, results),
      durationMs: 30_123.4,
      completed: true,
    });
    expect(s.score).toBe(30_123 + 2 * 5_000);
    expect(s.durationMs).toBe(30_123);
  });

  it("daily scores time plus 10 s per skip", () => {
    const mode = dailyModeFor("2026-10-09");
    const results: QuestionOutcome["result"][] = [
      ...Array(9).fill("correct"),
      "skipped",
    ];
    const s = summarizeRun({
      mode,
      seed: 1,
      outcomes: outcomes(mode, results),
      durationMs: 40_000,
      completed: true,
    });
    expect(s.score).toBe(50_000);
    expect(s.topicId).toBe("mixed");
  });

  it("survival scores cleared questions; timeouts count against accuracy", () => {
    const mode = getMode("survival")!;
    const s = summarizeRun({
      mode,
      seed: 1,
      outcomes: outcomes(mode, [
        "correct",
        "timeout",
        "correct",
        "skipped",
        "timeout",
      ]),
      durationMs: 20_000,
      completed: true,
    });
    expect(s.score).toBe(2);
    expect(s.skipped).toBe(1);
    expect(s.accuracy).toBeCloseTo(0.4);
  });

  it("handles empty runs", () => {
    const s = summarizeRun({
      mode: getMode("twos:practice")!,
      seed: 1,
      outcomes: [],
      durationMs: 0,
      completed: true,
    });
    expect(s.score).toBe(0);
    expect(s.accuracy).toBe(0);
    expect(s.typingAccuracy).toBe(1);
  });
});

describe("compare and format", () => {
  it("orders by the format's direction", () => {
    expect(
      [3, 10, 7].sort((a, b) => compareScores(FORMATS.sprint, a, b)),
    ).toEqual([10, 7, 3]);
    expect(
      [30_000, 12_000, 20_000].sort((a, b) =>
        compareScores(FORMATS.speedrun, a, b),
      ),
    ).toEqual([12_000, 20_000, 30_000]);
    expect(isBetterScore(FORMATS.survival, 18, 17)).toBe(true);
    expect(isBetterScore(FORMATS.daily, 18_000, 17_000)).toBe(false);
    expect(compareScores(FORMATS.sprint, 5, 5)).toBe(0);
  });
  it("formats scores", () => {
    expect(formatScore(FORMATS.sprint, 42)).toBe("42 correct");
    expect(formatScore(FORMATS.speedrun, 38_420)).toBe("38.42 s");
    expect(formatScore(FORMATS.survival, 17)).toBe("17 cleared");
  });
});

describe("plausibility", () => {
  it("exposes the documented limits", () => {
    expect(SCORE_LIMITS).toMatchObject({
      maxCorrectPerSecond: 3,
      minMsPerCorrect: 250,
      sprintMaxCorrect: 180,
      speedrunMinMs: 3_750,
      dailyMinMs: 2_500,
    });
  });
  it("accepts realistic runs and rejects impossible ones", () => {
    const mode = getMode("nibbles:sprint")!;
    const ok = summarizeRun({
      mode,
      seed: 1,
      outcomes: outcomes(mode, Array(40).fill("correct")),
      durationMs: 60_000,
      completed: true,
    });
    expect(validateSummary(ok, mode.spec)).toEqual([]);
    const fast = { ...ok, correct: 400, score: 400 };
    expect(validateSummary(fast, mode.spec).length).toBeGreaterThan(0);
    expect(validateSummary({ ...ok, completed: false }, mode.spec)).toContain(
      "run not completed",
    );
    const sr = getMode("nibbles:speedrun")!;
    const quick = summarizeRun({
      mode: sr,
      seed: 1,
      outcomes: outcomes(sr, Array(15).fill("correct")),
      durationMs: 2_000,
      completed: true,
    });
    expect(validateSummary(quick, sr.spec)).toContain("speedrun time too low");
    expect(validateSummary(ok, FORMATS.practice)).toContain(
      "format not ranked",
    );
  });
});

describe("survival clock", () => {
  it("starts at 15 s and shrinks to a 5 s floor, with difficulty and length allowances", () => {
    expect(survivalTimeLimitMs(0)).toBe(15_000);
    expect(survivalTimeLimitMs(25)).toBe(10_000);
    expect(survivalTimeLimitMs(50)).toBe(5_000);
    expect(survivalTimeLimitMs(500)).toBe(5_000);
    expect(survivalTimeLimitMs(50, { difficulty: 1, answer: "f" })).toBe(5_000);
    expect(
      survivalTimeLimitMs(50, { difficulty: 4, answer: "1111000011110000" }),
    ).toBe(5_000 + 1_500 + 1_800);
  });
});
