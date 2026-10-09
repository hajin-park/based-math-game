/**
 * Helpers shared by the question kinds: parameters common to every kind,
 * value sampling that avoids degenerate questions, prompt/answer display and
 * small formatting utilities for worked explanations.
 */
import { BASES, bitLength, digitsForBits, groupDigits, toBase } from "../bases";
import type { SeededRng } from "../rng";
import type {
  Base,
  ExplanationStep,
  PromptPart,
  Question,
  TopicId,
} from "../types";

export type Difficulty = Question["difficulty"];

/** Parameters every kind accepts in addition to its own. */
export interface KindParams {
  topicId: TopicId;
  /** Position of the question in the run (drives warm-up behaviour). */
  index?: number;
  /** Override the computed difficulty. */
  difficulty?: Difficulty;
}

/**
 * Questions before this index may use trivial values (0, 1, 2^0 …); from this
 * index on, generators steer away from them so runs stay interesting.
 */
export const WARMUP_QUESTIONS = 3;

export function isWarm(params: KindParams): boolean {
  return (params.index ?? 0) >= WARMUP_QUESTIONS;
}

export function clampDifficulty(n: number): Difficulty {
  return Math.max(1, Math.min(5, Math.round(n))) as Difficulty;
}

/**
 * Uniform integer in [min, max] that, when `avoidTrivial` is set, skips 0 and
 * 1, and when `minBits` is set, has at least that many significant bits. Both
 * constraints are dropped if the range cannot satisfy them.
 */
export function sampleValue(
  rng: SeededRng,
  min: number,
  max: number,
  opts: { avoidTrivial?: boolean; minBits?: number; exclude?: number[] } = {},
): number {
  let lo = min;
  if (opts.minBits && opts.minBits > 1) {
    const floor = 2 ** (opts.minBits - 1);
    if (floor <= max && floor > lo) lo = floor;
  }
  // Only when the range leaves enough other values (e.g. not for 0..3).
  if (opts.avoidTrivial && lo < 2 && max >= 5) lo = 2;
  const excluded = new Set(opts.exclude ?? []);
  for (let attempt = 0; attempt < 16; attempt++) {
    const v = rng.int(lo, max);
    if (!excluded.has(v)) return v;
  }
  return rng.int(lo, max);
}

/**
 * Binary prompts after warm-up get at least `width - 3` significant bits
 * (e.g. bytes show values >= 16), so most of the shown digits matter.
 */
export function interestingMinBits(max: number): number {
  return Math.max(2, bitLength(max) - 3);
}

/** A number prompt part: digits in `base`, uppercase hex, padded to `bits` when given. */
export function numberPart(
  value: number,
  base: Base,
  bits?: number,
): PromptPart {
  const minDigits = bits && base !== 10 ? digitsForBits(bits, base) : 0;
  const digits = toBase(value, base, minDigits);
  return {
    type: "number",
    digits: base === 16 ? digits.toUpperCase() : digits,
    base,
    ...(bits ? { bits } : {}),
  };
}

/** Digits of the first number part of a prompt, lowercased (for explanations). */
export function promptNumbers(
  q: Question,
): Array<{ digits: string; base: Base; bits?: number }> {
  const out: Array<{ digits: string; base: Base; bits?: number }> = [];
  for (const part of q.prompt) {
    if (part.type === "number") {
      out.push({
        digits: part.digits.toLowerCase(),
        base: part.base,
        bits: part.bits,
      });
    }
  }
  return out;
}

/** Uppercase hex, binary grouped into nibbles; no prefix. */
export function show(digits: string, base: Base): string {
  if (base === 16) return digits.toUpperCase();
  if (base === 2) return groupDigits(digits, 4);
  return digits;
}

/** Display form of a question's canonical answer (no prefix). */
export function formatAnswer(
  q: Question,
  opts: { prefix?: boolean } = {},
): string {
  if (q.answerFormat === "char") return q.answer;
  if (
    !q.answerBase ||
    q.answerFormat === "decimal" ||
    q.answerFormat === "signed-decimal"
  ) {
    return q.answer;
  }
  return (
    (opts.prefix ? BASES[q.answerBase].prefix : "") +
    show(q.answer, q.answerBase)
  );
}

/** The closing step every explanation ends with. */
export function answerStep(q: Question, note?: string): ExplanationStep {
  const label =
    q.answerFormat === "char"
      ? "Character"
      : q.answerBase
        ? BASES[q.answerBase].name
        : "";
  return {
    title: "Answer",
    work: [formatAnswer(q)],
    note:
      note ??
      (label
        ? `${label}${q.answerBits ? `, ${q.answerBits} bits (leading zeros optional)` : ""}.`
        : undefined),
  };
}

/** Uppercase hex digit for 0..15. */
export function hexDigit(n: number): string {
  return n.toString(16).toUpperCase();
}

/** Right-align a list of columns so values line up under each other. */
export function alignColumns(rows: string[][]): string[] {
  const widths: number[] = [];
  for (const row of rows) {
    row.forEach((cell, i) => {
      widths[i] = Math.max(widths[i] ?? 0, cell.length);
    });
  }
  return rows.map((row) =>
    row
      .map((cell, i) => cell.padStart(widths[i]))
      .join(" ")
      .replace(/\s+$/, ""),
  );
}

/** Pad digits on the left to a multiple of `size` with zeros. */
export function padToMultiple(digits: string, size: number): string {
  const rem = digits.length % size;
  return rem === 0
    ? digits
    : digits.padStart(digits.length + (size - rem), "0");
}

/** Split a digit string into consecutive groups of `size` (assumes already padded). */
export function chunks(digits: string, size: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < digits.length; i += size)
    out.push(digits.slice(i, i + size));
  return out;
}

export function stripLeadingZeros(digits: string): string {
  const s = digits.replace(/^0+/, "");
  return s === "" ? "0" : s;
}

/** U+2212 minus sign for nicer explanations. */
export const MINUS = "−";

export function signed(n: number): string {
  return n < 0 ? `${MINUS}${-n}` : String(n);
}
