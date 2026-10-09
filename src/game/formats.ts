/**
 * Formats (ways to play a topic) and the fixed schedules of the survival and
 * daily formats.
 */
import type { Format, FormatSpec, Question, TopicId } from "./types";
import type { SeededRng } from "./rng";

export const SPRINT_DURATION_MS = 60_000;
export const SPEEDRUN_TARGET = 15;
export const SPEEDRUN_SKIP_PENALTY_MS = 5_000;
export const SURVIVAL_LIVES = 3;
export const DAILY_QUESTION_COUNT = 10;
export const DAILY_SKIP_PENALTY_MS = 10_000;

export const FORMATS: Record<Format, FormatSpec> = {
  sprint: {
    format: "sprint",
    name: "Sprint",
    summary:
      "Answer as many as you can in 60 seconds. Skipping costs nothing but time.",
    durationMs: SPRINT_DURATION_MS,
    ranked: true,
    scoreOrder: "higher-better",
    scoreUnit: "correct",
  },
  speedrun: {
    format: "speedrun",
    name: "Speedrun",
    summary:
      "Race to 15 correct answers. Each skip adds 5 seconds to your time.",
    targetCount: SPEEDRUN_TARGET,
    ranked: true,
    scoreOrder: "lower-better",
    scoreUnit: "ms",
    skipPenaltyMs: SPEEDRUN_SKIP_PENALTY_MS,
  },
  survival: {
    format: "survival",
    name: "Survival",
    summary:
      "Three lives and a shrinking clock on every question, from nibbles up to bitwise. A skip or timeout costs a life.",
    lives: SURVIVAL_LIVES,
    ranked: true,
    scoreOrder: "higher-better",
    scoreUnit: "cleared",
  },
  daily: {
    format: "daily",
    name: "Daily",
    summary:
      "Ten questions, the same for everyone today, climbing from nibbles to colors and ASCII. Each skip adds 10 seconds.",
    targetCount: DAILY_QUESTION_COUNT,
    ranked: true,
    scoreOrder: "lower-better",
    scoreUnit: "ms",
    skipPenaltyMs: DAILY_SKIP_PENALTY_MS,
  },
  practice: {
    format: "practice",
    name: "Practice",
    summary:
      "No clock and no leaderboard. Skip to reveal the answer with a worked solution.",
    ranked: false,
    scoreOrder: "higher-better",
    scoreUnit: "correct",
  },
};

export const FORMAT_IDS: readonly Format[] = [
  "sprint",
  "speedrun",
  "survival",
  "daily",
  "practice",
];

export function getFormat(format: Format): FormatSpec {
  return FORMATS[format];
}

export function isFormat(s: string): s is Format {
  return (FORMAT_IDS as readonly string[]).includes(s);
}

/* ------------------------------------------------------------------------ */
/* Survival                                                                  */
/* ------------------------------------------------------------------------ */

/**
 * Survival topic ramp, by question index (every question shown counts,
 * including ones lost to a timeout or skip):
 *
 *   0-4 nibbles, 5-9 powers, 10-14 bytes-bin, 15-19 bytes-hex, 20-24 octal,
 *   25-29 binary-add, 30-34 words, 35-39 twos, 40-44 bitwise,
 *   45+  endless blend of SURVIVAL_ENDGAME.
 *
 * From index 10 on, SURVIVAL_REVIEW_RATE of questions are drawn from an
 * earlier stage instead (spaced review), so foundations stay sharp.
 */
export const SURVIVAL_STAGES: ReadonlyArray<{
  from: number;
  topicId: TopicId;
}> = [
  { from: 0, topicId: "nibbles" },
  { from: 5, topicId: "powers" },
  { from: 10, topicId: "bytes-bin" },
  { from: 15, topicId: "bytes-hex" },
  { from: 20, topicId: "octal" },
  { from: 25, topicId: "binary-add" },
  { from: 30, topicId: "words" },
  { from: 35, topicId: "twos" },
  { from: 40, topicId: "bitwise" },
];
export const SURVIVAL_ENDGAME_FROM = 45;
export const SURVIVAL_ENDGAME: readonly TopicId[] = [
  "bytes-hex",
  "words",
  "twos",
  "bitwise",
  "binary-add",
  "applied",
];
export const SURVIVAL_REVIEW_RATE = 0.25;

/** Topic of the survival question at `index` (deterministic given the rng). */
export function survivalTopicAt(index: number, rng: SeededRng): TopicId {
  if (index >= SURVIVAL_ENDGAME_FROM) return rng.pick(SURVIVAL_ENDGAME);
  let stage = 0;
  for (let i = 0; i < SURVIVAL_STAGES.length; i++) {
    if (index >= SURVIVAL_STAGES[i].from) stage = i;
  }
  if (index >= 10 && stage > 0 && rng.chance(SURVIVAL_REVIEW_RATE)) {
    return SURVIVAL_STAGES[rng.int(0, stage - 1)].topicId;
  }
  return SURVIVAL_STAGES[stage].topicId;
}

export const SURVIVAL_START_MS = 15_000;
export const SURVIVAL_FLOOR_MS = 5_000;
export const SURVIVAL_SHRINK_MS = 200;

/**
 * Per-question time limit in survival:
 *
 *   base   = max(5 000, 15 000 - 200 * index)       (15 s at the start, 5 s from index 50)
 *   bonus  = 500 * (difficulty - 1)                 (harder kinds get up to +2 s)
 *          + 150 * max(0, answerLength - 4)         (long answers: typing time)
 *   limit  = base + bonus
 *
 * So the clock shrinks toward ~5 s while staying fair to 16-digit answers.
 */
export function survivalTimeLimitMs(
  index: number,
  question?: Pick<Question, "difficulty" | "answer">,
): number {
  const base = Math.max(
    SURVIVAL_FLOOR_MS,
    SURVIVAL_START_MS - SURVIVAL_SHRINK_MS * index,
  );
  if (!question) return base;
  return (
    base +
    500 * (question.difficulty - 1) +
    150 * Math.max(0, question.answer.length - 4)
  );
}

/* ------------------------------------------------------------------------ */
/* Daily                                                                     */
/* ------------------------------------------------------------------------ */

/**
 * The daily challenge: ten questions, one per rung, in this order. Questions
 * are seeded by the UTC date, so everyone gets the same ten.
 */
export const DAILY_LADDER: readonly TopicId[] = [
  "nibbles",
  "powers",
  "bytes-bin",
  "bytes-hex",
  "octal",
  "binary-add",
  "words",
  "twos",
  "bitwise",
  "applied",
];
