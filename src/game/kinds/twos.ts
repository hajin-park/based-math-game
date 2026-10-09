/**
 * twos: fixed-width two's complement.
 *   to-decimal  bit pattern -> signed decimal   (10110110 -> -74)
 *   to-binary   signed decimal -> bit pattern   (-74 -> 10110110)
 */
import { toBase } from "../bases";
import type { SeededRng } from "../rng";
import type { ExplanationStep, Question } from "../types";
import {
  type KindParams,
  MINUS,
  alignColumns,
  answerStep,
  clampDifficulty,
  isWarm,
  promptNumbers,
  show,
  signed,
} from "./shared";
import { subtractPowersSteps } from "./steps";

export type TwosDirection = "to-decimal" | "to-binary";

export interface TwosParams extends KindParams {
  /** Register width, 4..16 (default 8). */
  bits?: number;
  /** Omit to pick either direction with equal probability. */
  direction?: TwosDirection;
  /** Probability of a negative value (default 0.7: negatives are the point). */
  negativeRate?: number;
}

/** Bit pattern of a signed value in `bits`-bit two's complement. */
export function encodeTwos(value: number, bits: number): string {
  const mod = 2 ** bits;
  return toBase(((value % mod) + mod) % mod, 2, bits);
}

/** Signed value of a `bits`-bit pattern. */
export function decodeTwos(pattern: string): number {
  const bits = pattern.length;
  const u = parseInt(pattern, 2);
  return u >= 2 ** (bits - 1) ? u - 2 ** bits : u;
}

export function generate(rng: SeededRng, p: TwosParams): Question {
  const bits = Math.max(2, Math.min(16, p.bits ?? 8));
  const direction =
    p.direction ?? (rng.chance(0.5) ? "to-decimal" : "to-binary");
  const half = 2 ** (bits - 1);
  const warm = isWarm(p);
  let value: number;
  if (rng.chance(p.negativeRate ?? 0.7)) {
    value = rng.int(-half, -1); // -1 (all ones) is a classic, keep it
  } else {
    value = rng.int(warm && bits > 3 ? 2 : 0, half - 1);
  }
  const pattern = encodeTwos(value, bits);
  const common = {
    kind: "twos" as const,
    topicId: p.topicId,
    difficulty:
      p.difficulty ?? clampDifficulty(bits <= 4 ? 2 : bits <= 8 ? 4 : 5),
  };
  if (direction === "to-decimal") {
    return {
      ...common,
      id: `twos:${bits}:b>d:${pattern}`,
      instruction: `${bits}-bit two's complement → Decimal`,
      prompt: [{ type: "number", digits: pattern, base: 2, bits }],
      answerBase: 10,
      answerFormat: "signed-decimal",
      answer: String(value),
      maxLength: String(-half).length,
    };
  }
  return {
    ...common,
    id: `twos:${bits}:d>b:${value}`,
    instruction: `Decimal → ${bits}-bit two's complement`,
    prompt: [{ type: "number", digits: String(value), base: 10 }],
    answerBase: 2,
    answerFormat: "binary",
    answerBits: bits,
    answer: pattern,
    maxLength: bits,
  };
}

function weightTable(pattern: string): string[] {
  const bits = pattern.length;
  const weights = [...pattern].map((_, i) =>
    i === 0 ? `${MINUS}${2 ** (bits - 1)}` : String(2 ** (bits - 1 - i)),
  );
  return alignColumns([weights, [...pattern]]);
}

function invert(pattern: string): string {
  return [...pattern].map((b) => (b === "1" ? "0" : "1")).join("");
}

function addOne(pattern: string): string {
  const bits = pattern.length;
  return toBase((parseInt(pattern, 2) + 1) % 2 ** bits, 2, bits);
}

export function explain(q: Question): ExplanationStep[] {
  const bits = Number(q.id.split(":")[1]);
  const [n] = promptNumbers(q);
  const steps: ExplanationStep[] = [];
  if (n.base === 2) {
    const pattern = n.digits;
    const value = decodeTwos(pattern);
    if (pattern[0] === "0") {
      steps.push({
        title: "Sign bit is 0: the value is positive",
        work: alignColumns([
          [...pattern].map((_, i) => String(2 ** (bits - 1 - i))),
          [...pattern],
        ]),
        note: "A leading 0 means the pattern reads exactly like ordinary unsigned binary.",
      });
      const parts = [...pattern]
        .map((b, i) => (b === "1" ? 2 ** (bits - 1 - i) : 0))
        .filter(Boolean);
      steps.push({
        title: "Add the weights of the 1 bits",
        work: [`${parts.join(" + ") || "0"} = ${value}`],
      });
    } else {
      const parts = [...pattern]
        .map((b, i) =>
          b === "1"
            ? i === 0
              ? `${MINUS}${2 ** (bits - 1)}`
              : String(2 ** (bits - 1 - i))
            : "",
        )
        .filter(Boolean);
      steps.push({
        title: `Give the sign bit a weight of ${MINUS}${2 ** (bits - 1)}`,
        work: [
          ...weightTable(pattern),
          `${parts.join(" + ")} = ${signed(value)}`,
        ],
        note: "In two's complement the most significant bit counts negative; every other bit keeps its usual weight.",
      });
      const inv = invert(pattern);
      const mag = addOne(inv);
      steps.push({
        title: "Check: invert and add one",
        work: [
          `${show(pattern, 2)}  pattern`,
          `${show(inv, 2)}  invert every bit`,
          `${show(mag, 2)}  add 1  = ${parseInt(mag, 2)}`,
        ],
        note: `Negating gives the magnitude ${-value}, so the original value is ${signed(value)}.`,
      });
    }
  } else {
    const value = Number(n.digits);
    const pattern = encodeTwos(value, bits);
    if (value >= 0) {
      steps.push(...subtractPowersSteps(value, Math.min(bits, 8)));
      steps.push({
        title: `Pad to ${bits} bits`,
        work: [show(pattern, 2)],
        note: "Non-negative values are plain binary with a 0 sign bit.",
      });
    } else {
      const mag = -value;
      const magBits = toBase(mag % 2 ** bits, 2, bits);
      const inv = invert(magBits);
      steps.push({
        title: `Write the magnitude ${mag} in ${bits} bits`,
        work: [`${show(magBits, 2)}  = ${mag}`],
      });
      steps.push({
        title: "Invert every bit, then add one",
        work: [`${show(inv, 2)}  inverted`, `${show(pattern, 2)}  + 1`],
        note: "Inverting and adding one negates a number in two's complement.",
      });
      steps.push({
        title: `Check with the ${MINUS}${2 ** (bits - 1)} sign weight`,
        work: [
          `${MINUS}${2 ** (bits - 1)} + ${value + 2 ** (bits - 1)} = ${signed(value)}`,
        ],
      });
    }
  }
  steps.push(answerStep(q));
  return steps;
}
