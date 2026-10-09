/**
 * convert: a value shown in one base, answered in another.
 */
import { BASES, bitLength, digitsForBits, parseInBase, toBase } from "../bases";
import type { SeededRng } from "../rng";
import type { Base, ExplanationStep, Question } from "../types";
import {
  type KindParams,
  answerStep,
  clampDifficulty,
  interestingMinBits,
  isWarm,
  numberPart,
  promptNumbers,
  sampleValue,
} from "./shared";
import {
  bitsToGroupsStep,
  groupsToBitsSteps,
  placeValueSteps,
  repeatedDivisionSteps,
  subtractPowersSteps,
} from "./steps";

export interface ConvertParams extends KindParams {
  from: Base;
  to: Base;
  /** Inclusive decimal range of the value. */
  min: number;
  max: number;
  /**
   * Show the prompt zero-padded to this many bits (binary 8 -> "00101101",
   * hex 16 -> "002D") and allow answers of that width. Decimal is never padded.
   */
  padBits?: number;
}

/** Relative effort of converting between two bases, for default difficulty. */
function pairCost(from: Base, to: Base): number {
  const grouping = (a: Base, b: Base) =>
    (a === 2 && (b === 8 || b === 16)) || (b === 2 && (a === 8 || a === 16));
  if (grouping(from, to)) return 0;
  if (to === 10) return 1;
  if (from === 10 && to === 2) return 1;
  if (from === 10) return 2; // decimal -> hex / octal: repeated division
  return 1.5; // hex <-> octal via binary
}

export function generate(rng: SeededRng, p: ConvertParams): Question {
  if (p.from === p.to) throw new Error("convert: from and to must differ");
  const warm = isWarm(p);
  const value = sampleValue(rng, p.min, p.max, {
    avoidTrivial: warm,
    minBits: warm && p.from === 2 ? interestingMinBits(p.max) : undefined,
  });
  const promptBits = p.from === 10 ? undefined : p.padBits;
  const answerDigits = Math.max(
    toBase(p.max, p.to).length,
    p.padBits && p.to !== 10 ? digitsForBits(p.padBits, p.to) : 0,
  );
  const bits = bitLength(p.max);
  return {
    id: `convert:${p.from}>${p.to}:${toBase(value, p.from)}`,
    kind: "convert",
    topicId: p.topicId,
    instruction: `${BASES[p.from].name} → ${BASES[p.to].name}`,
    prompt: [numberPart(value, p.from, promptBits)],
    answerBase: p.to,
    answerFormat: formatFor(p.to),
    answer: toBase(value, p.to),
    maxLength: answerDigits,
    difficulty:
      p.difficulty ??
      clampDifficulty(1 + Math.floor(bits / 6) + pairCost(p.from, p.to)),
  };
}

export function formatFor(base: Base): Question["answerFormat"] {
  return base === 2
    ? "binary"
    : base === 8
      ? "octal"
      : base === 16
        ? "hex"
        : "decimal";
}

export function explain(q: Question): ExplanationStep[] {
  const [n] = promptNumbers(q);
  const from = n.base;
  const to = q.answerBase as Base;
  const value = parseInBase(n.digits, from) ?? 0;
  const steps: ExplanationStep[] = [];

  if (to === 10) {
    steps.push(...placeValueSteps(n.digits, from));
  } else if (from === 10 && to === 2) {
    steps.push(...subtractPowersSteps(value));
    steps.push({
      title: "Alternative: repeated division",
      note: "Dividing by 2 repeatedly and reading the remainders from the bottom up gives the same bits.",
    });
  } else if (from === 10) {
    steps.push(repeatedDivisionSteps(value, to));
    if (value < 256 && to === 16) {
      steps.push({
        title: "Check",
        work: [`${Math.floor(value / 16)}×16 + ${value % 16} = ${value}`],
      });
    }
  } else if (from === 2) {
    steps.push(bitsToGroupsStep(n.digits, to as 8 | 16));
  } else if (to === 2) {
    steps.push(...groupsToBitsSteps(n.digits, from as 8 | 16));
  } else {
    // hex <-> octal: go through binary, then regroup.
    const bin = toBase(value, 2);
    steps.push(...groupsToBitsSteps(n.digits, from as 8 | 16).slice(0, 1));
    steps.push({
      ...bitsToGroupsStep(bin, to as 8 | 16),
      title: `Regroup the bits into ${to === 16 ? "fours" : "threes"} from the right`,
    });
  }
  steps.push(answerStep(q));
  return steps;
}
