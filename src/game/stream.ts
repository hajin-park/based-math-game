/**
 * Deterministic question streams. `createQuestionStream(mode, seed).at(i)`
 * returns the same question for the same (mode, seed, i) on every client, so
 * multiplayer players and daily-challenge players all see identical questions.
 */
import { dailyDateOf } from "./catalog";
import { DAILY_LADDER, survivalTopicAt } from "./formats";
import { generateAvoiding } from "./kinds";
import { WARMUP_QUESTIONS } from "./kinds/shared";
import { deriveSeed, hashSeed, type SeededRng } from "./rng";
import { generateForTopic } from "./topics";
import type { GameMode, Question } from "./types";

/** A question never repeats one of the previous RECENT_WINDOW questions (when the topic allows). */
export const RECENT_WINDOW = 8;

export interface QuestionStream {
  readonly mode: GameMode;
  /** Effective seed (for daily modes this is the date seed, not the one passed in). */
  readonly seed: number;
  at(index: number): Question;
}

/** Seed for the daily challenge of a UTC date key ("2026-10-09"). */
export function dailySeed(dateKey: string): number {
  return hashSeed(`daily:${dateKey}`);
}

/** The seed a run of `mode` actually uses. */
export function effectiveSeed(mode: GameMode, seed: number): number {
  if (mode.format === "daily") {
    const date = dailyDateOf(mode.id);
    if (!date)
      throw new Error(`Daily mode id must be daily:YYYY-MM-DD, got ${mode.id}`);
    return dailySeed(date);
  }
  return seed >>> 0;
}

/** Generate the question at `index` for `mode`, using `rng` (no repeat avoidance). */
export function generateForMode(
  mode: GameMode,
  rng: SeededRng,
  index: number,
): Question {
  switch (mode.format) {
    case "survival":
      return generateForTopic(rng, survivalTopicAt(index, rng), { index });
    case "daily":
      // Daily questions are a fixed competitive set: always past warm-up.
      return generateForTopic(rng, DAILY_LADDER[index % DAILY_LADDER.length], {
        index: index + WARMUP_QUESTIONS,
      });
    default:
      return generateForTopic(rng, mode.topicId, { index }, mode.custom);
  }
}

export function createQuestionStream(
  mode: GameMode,
  seed: number,
): QuestionStream {
  const base = effectiveSeed(mode, seed);
  const cache: Question[] = [];
  const generateNext = (): Question => {
    const i = cache.length;
    const recent = cache.slice(Math.max(0, i - RECENT_WINDOW)).map((q) => q.id);
    return generateAvoiding(deriveSeed(base, i), recent, (rng) =>
      generateForMode(mode, rng, i),
    );
  };
  return {
    mode,
    seed: base,
    at(index: number): Question {
      if (!Number.isInteger(index) || index < 0)
        throw new RangeError(`Invalid question index ${index}`);
      // Questions depend on their predecessors (repeat avoidance), so fill in order.
      while (cache.length <= index) cache.push(generateNext());
      return cache[index];
    },
  };
}
