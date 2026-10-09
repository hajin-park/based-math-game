/**
 * add: unsigned binary addition.
 *
 * Both operands and the sum fit in `bits` bits (default 8): the generator
 * never produces a carry out of the top bit, so the answer is always a valid
 * `bits`-bit value (answerBits = bits, leading zeros optional). Overflow is a
 * separate idea and is left to the two's complement topic.
 */
import { toBase } from "../bases";
import type { SeededRng } from "../rng";
import type { ExplanationStep, Question } from "../types";
import {
  type KindParams,
  alignColumns,
  answerStep,
  chunks,
  clampDifficulty,
  isWarm,
  numberPart,
  promptNumbers,
} from "./shared";

export interface AddParams extends KindParams {
  /** Operand and result width, 4..16 (default 8). */
  bits?: number;
}

/** Number of columns that produce a carry when adding a + b. */
export function carryCount(a: number, b: number): number {
  let carries = 0;
  let carry = 0;
  for (
    let x = a, y = b;
    x > 0 || y > 0;
    x = Math.floor(x / 2), y = Math.floor(y / 2)
  ) {
    carry = (x % 2) + (y % 2) + carry >= 2 ? 1 : 0;
    carries += carry;
  }
  return carries;
}

export function generate(rng: SeededRng, p: AddParams): Question {
  const bits = Math.max(4, Math.min(16, p.bits ?? 8));
  const max = 2 ** bits - 1;
  const warm = isWarm(p);
  let a = 1;
  let b = 1;
  for (let attempt = 0; attempt < 12; attempt++) {
    const sum = rng.int(warm ? 2 ** (bits - 2) : 2, max);
    a = rng.int(1, sum - 1);
    b = sum - a;
    const minOperand = warm ? 2 ** (bits - 4) : 1;
    // Prefer sums that exercise carrying (at least two carries after warm-up).
    if (
      a >= minOperand &&
      b >= minOperand &&
      carryCount(a, b) >= (warm ? 2 : 1)
    )
      break;
  }
  const sum = a + b;
  return {
    id: `add:${toBase(a, 2, bits)}+${toBase(b, 2, bits)}`,
    kind: "add",
    topicId: p.topicId,
    instruction: `Binary addition (${bits}-bit)`,
    prompt: [
      numberPart(a, 2, bits),
      { type: "op", text: "+" },
      numberPart(b, 2, bits),
    ],
    answerBase: 2,
    answerFormat: "binary",
    answerBits: bits,
    answer: toBase(sum, 2, bits),
    maxLength: bits,
    difficulty: p.difficulty ?? clampDifficulty(bits <= 4 ? 2 : 3),
  };
}

/** Insert a space every 4 characters from the right (characters may be spaces). */
function nibbleSpaced(s: string): string {
  return chunks(s.padStart(Math.ceil(s.length / 4) * 4, " "), 4).join(" ");
}

export function explain(q: Question): ExplanationStep[] {
  const [x, y] = promptNumbers(q);
  const bits = q.answerBits ?? x.digits.length;
  const a = parseInt(x.digits, 2);
  const b = parseInt(y.digits, 2);
  const sum = a + b;
  const aBits = toBase(a, 2, bits);
  const bBits = toBase(b, 2, bits);
  const sBits = toBase(sum, 2, bits);
  // carryIn[i] is the carry entering column i (0 = rightmost).
  const carryIn: number[] = new Array(bits).fill(0);
  let carry = 0;
  for (let i = 0; i < bits; i++) {
    carryIn[i] = carry;
    const s = Number(aBits[bits - 1 - i]) + Number(bBits[bits - 1 - i]) + carry;
    carry = s >= 2 ? 1 : 0;
  }
  const carryRow = Array.from({ length: bits }, (_, k) =>
    carryIn[bits - 1 - k] ? "1" : " ",
  ).join("");
  return [
    {
      title: "Add column by column from the right, carrying 1s",
      work: alignColumns([
        ["carry", nibbleSpaced(carryRow)],
        ["", nibbleSpaced(aBits)],
        ["+", nibbleSpaced(bBits)],
        ["", "-".repeat(nibbleSpaced(aBits).length)],
        ["", nibbleSpaced(sBits)],
      ]),
      note: "0+0 = 0, 0+1 = 1, 1+1 = 10 (write 0, carry 1), 1+1+1 = 11 (write 1, carry 1).",
    },
    {
      title: "Check in decimal",
      work: [`${a} + ${b} = ${sum}`],
    },
    answerStep(q),
  ];
}
