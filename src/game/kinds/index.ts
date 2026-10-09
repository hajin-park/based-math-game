/**
 * Kind registry: dispatch generation and explanation by QuestionKind, plus the
 * repeat-avoiding generation helper used by streams.
 */
import { createRng, deriveSeed, type SeededRng } from "../rng";
import type { ExplanationStep, Question, QuestionKind } from "../types";
import * as add from "./add";
import * as ascii from "./ascii";
import * as bitwise from "./bitwise";
import * as color from "./color";
import * as convert from "./convert";
import * as power from "./power";
import * as twos from "./twos";
import type { KindParams } from "./shared";

export type { KindParams } from "./shared";
export type { ConvertParams } from "./convert";
export type { PowerParams, PowerVariant } from "./power";
export type { TwosParams, TwosDirection } from "./twos";
export type { BitwiseParams, BitwiseOp } from "./bitwise";
export type { AddParams } from "./add";
export type { ColorParams, Channel } from "./color";
export type { AsciiParams, AsciiDirection } from "./ascii";

export interface KindParamsMap {
  convert: convert.ConvertParams;
  power: power.PowerParams;
  twos: twos.TwosParams;
  bitwise: bitwise.BitwiseParams;
  add: add.AddParams;
  color: color.ColorParams;
  ascii: ascii.AsciiParams;
}

/** A kind plus its parameters, minus the per-question context (topic, index). */
export type KindRecipe = {
  [K in QuestionKind]: {
    kind: K;
    params: Omit<KindParamsMap[K], keyof KindParams> & Partial<KindParams>;
  };
}[QuestionKind];

interface KindModule<P> {
  generate(rng: SeededRng, params: P): Question;
  explain(q: Question): ExplanationStep[];
}

export const KINDS: { [K in QuestionKind]: KindModule<KindParamsMap[K]> } = {
  convert,
  power,
  twos,
  bitwise,
  add,
  color,
  ascii,
};

/** Generate one question of the recipe's kind. */
export function generateFromRecipe(
  rng: SeededRng,
  recipe: KindRecipe,
  ctx: KindParams,
): Question {
  const params = {
    ...recipe.params,
    ...ctx,
    difficulty: recipe.params.difficulty ?? ctx.difficulty,
  };
  // The mapped union guarantees params match the kind at the call site.
  return (KINDS[recipe.kind] as KindModule<typeof params>).generate(
    rng,
    params,
  );
}

/** Worked solution for any question produced by the engine. */
export function explainQuestion(q: Question): ExplanationStep[] {
  return (KINDS[q.kind] as KindModule<unknown>).explain(q);
}

/**
 * Generate with independent seeded attempts until the question id is not in
 * `recentIds` (at most `maxAttempts`; the last attempt is returned regardless).
 * Deterministic for a given (seed, recentIds).
 */
export function generateAvoiding(
  seed: number,
  recentIds: readonly string[],
  generate: (rng: SeededRng) => Question,
  maxAttempts = 16,
): Question {
  const recent = new Set(recentIds);
  let q: Question | null = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    q = generate(createRng(deriveSeed(seed, attempt)));
    if (!recent.has(q.id)) return q;
  }
  return q!;
}
