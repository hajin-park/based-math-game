/**
 * power: powers of two in both directions, plus the largest unsigned n-bit value.
 *   value    2^n          -> decimal       ("2^10" -> 1024)
 *   exponent 2^n = v      -> n             ("2^n = 4096" -> 12)
 *   max      n bits       -> 2^n - 1       ("largest unsigned 8-bit value" -> 255)
 */
import type { SeededRng } from "../rng";
import type { ExplanationStep, Question } from "../types";
import {
  type KindParams,
  MINUS,
  answerStep,
  clampDifficulty,
  isWarm,
  promptNumbers,
} from "./shared";

export type PowerVariant = "value" | "exponent" | "max";

export interface PowerParams extends KindParams {
  /** Inclusive exponent range (default 0..16). */
  minExp?: number;
  maxExp?: number;
  /** Variants to draw from with weights (default value 4, exponent 3, max 2). */
  variants?: Partial<Record<PowerVariant, number>>;
}

const DEFAULT_VARIANTS: Record<PowerVariant, number> = {
  value: 4,
  exponent: 3,
  max: 2,
};

export function generate(rng: SeededRng, p: PowerParams): Question {
  const weights = p.variants ?? DEFAULT_VARIANTS;
  const variant = rng.weighted(
    (Object.keys(weights) as PowerVariant[]).filter(
      (v) => (weights[v] ?? 0) > 0,
    ),
    (v) => weights[v] ?? 0,
  );
  const minExp = Math.max(variant === "value" ? 0 : 1, p.minExp ?? 0);
  const maxExp = Math.max(minExp, p.maxExp ?? 16);
  // After warm-up skip 2^0, 2^1 (and 1- or 2-bit maxima) unless the range is tiny.
  const lo = isWarm(p) && maxExp - minExp >= 4 ? Math.max(minExp, 2) : minExp;
  const n = rng.int(lo, maxExp);
  const maxDigits = String(2 ** maxExp).length;
  const base = {
    kind: "power" as const,
    topicId: p.topicId,
    answerBase: 10 as const,
    answerFormat: "decimal" as const,
  };
  const difficultyFor = (e: number) =>
    p.difficulty ?? clampDifficulty(e <= 10 ? 1 : 2);
  if (variant === "value") {
    return {
      ...base,
      id: `power:value:${n}`,
      instruction: "Power of two → Decimal",
      prompt: [
        { type: "op", text: "2^" },
        { type: "number", digits: String(n), base: 10 },
      ],
      answer: String(2 ** n),
      maxLength: maxDigits,
      difficulty: difficultyFor(n),
    };
  }
  if (variant === "exponent") {
    return {
      ...base,
      id: `power:exponent:${n}`,
      instruction: "Find the exponent n",
      prompt: [
        { type: "op", text: "2^" },
        { type: "text", text: "n" },
        { type: "op", text: "=" },
        { type: "number", digits: String(2 ** n), base: 10 },
      ],
      answer: String(n),
      maxLength: 2,
      difficulty: difficultyFor(n),
    };
  }
  return {
    ...base,
    id: `power:max:${n}`,
    instruction: "Largest unsigned value → Decimal",
    prompt: [
      { type: "text", text: "largest unsigned" },
      { type: "number", digits: String(n), base: 10 },
      { type: "text", text: "-bit value" },
    ],
    answer: String(2 ** n - 1),
    maxLength: maxDigits,
    difficulty: p.difficulty ?? clampDifficulty(n <= 8 ? 1 : 2),
  };
}

/** Build 2^n from anchors: doubling for small n, 2^10 = 1024 beyond. */
function powerWork(n: number): string[] {
  if (n <= 10) {
    const chain = Array.from({ length: n + 1 }, (_, i) => String(2 ** i));
    return [`2^0 … 2^${n}: ${chain.join(", ")}`];
  }
  const k = n - 10;
  return [`2^${n} = 2^10 × 2^${k}`, `= 1024 × ${2 ** k}`, `= ${2 ** n}`];
}

export function explain(q: Question): ExplanationStep[] {
  const variant = q.id.split(":")[1] as PowerVariant;
  const nums = promptNumbers(q);
  const steps: ExplanationStep[] = [];
  if (variant === "value") {
    const n = Number(nums[0].digits);
    steps.push({
      title: n <= 10 ? "Double from 1" : "Split off 2^10 = 1024",
      work: powerWork(n),
      note:
        n <= 10
          ? "Each step doubles the previous power. Memorise up to 2^10 = 1024."
          : "Exponents add when powers multiply: 2^(a+b) = 2^a × 2^b. 2^10 = 1024 is the anchor (1 KiB).",
    });
  } else if (variant === "exponent") {
    const v = Number(nums[0].digits);
    const n = Math.round(Math.log2(v));
    steps.push(
      n <= 10
        ? {
            title: "Count the doublings",
            work: [
              Array.from({ length: n + 1 }, (_, i) => `2^${i}=${2 ** i}`).join(
                "  ",
              ),
            ],
            note: `${v} is reached after doubling 1 exactly ${n} times.`,
          }
        : {
            title: "Factor out 1024 = 2^10",
            work: [
              `${v} = 1024 × ${v / 1024}`,
              `= 2^10 × 2^${n - 10}`,
              `= 2^${n}`,
            ],
            note: "Recognising 1024, 2048, 4096, 8192, 16384, 32768, 65536 as 2^10 … 2^16 saves time.",
          },
    );
  } else {
    const n = Number(nums[0].digits);
    steps.push({
      title: `${n} bits hold 2^${n} different values`,
      work: [`2^${n} = ${2 ** n}`, `values 0 … 2^${n} ${MINUS} 1`],
      note: "Counting starts at 0, so the largest value is one less than the number of values.",
    });
    steps.push({
      title: "All bits set",
      work: [`${"1".repeat(n)} = 2^${n} ${MINUS} 1 = ${2 ** n - 1}`],
    });
  }
  steps.push(answerStep(q, "Decimal."));
  return steps;
}
