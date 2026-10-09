/**
 * bitwise: AND / OR / XOR on fixed-width operands (binary or hex), and logical
 * shifts on binary operands. Results are masked to the operand width, and the
 * answer is given in the operands' base.
 */
import { digitsForBits, parseInBase, toBase } from "../bases";
import type { SeededRng } from "../rng";
import type { ExplanationStep, Question } from "../types";
import {
  type KindParams,
  alignColumns,
  answerStep,
  chunks,
  clampDifficulty,
  hexDigit,
  isWarm,
  numberPart,
  promptNumbers,
  show,
} from "./shared";

export type BitwiseOp = "and" | "or" | "xor" | "shl" | "shr";

export interface BitwiseParams extends KindParams {
  /** Operations to draw from with weights (default and/or/xor 2 each, shl/shr 1 each). */
  ops?: Partial<Record<BitwiseOp, number>>;
  /** Operand base for AND/OR/XOR (shifts are always shown in binary). Default 2. */
  base?: 2 | 16;
  /** Operand width, a multiple of 4 between 4 and 16 (default 8). */
  bits?: number;
  /** Shift amounts (inclusive, default 1..3). */
  maxShift?: number;
}

const SYMBOL: Record<BitwiseOp, string> = {
  and: "AND",
  or: "OR",
  xor: "XOR",
  shl: "<<",
  shr: ">>",
};
const OP_BY_SYMBOL: Record<string, BitwiseOp> = {
  AND: "and",
  OR: "or",
  XOR: "xor",
  "<<": "shl",
  ">>": "shr",
};
const DEFAULT_OPS: Record<BitwiseOp, number> = {
  and: 2,
  or: 2,
  xor: 2,
  shl: 1,
  shr: 1,
};

export function applyBitwise(
  op: BitwiseOp,
  a: number,
  b: number,
  bits: number,
): number {
  const mask = 2 ** bits - 1;
  switch (op) {
    case "and":
      return a & b & mask;
    case "or":
      return (a | b) & mask;
    case "xor":
      return (a ^ b) & mask;
    case "shl":
      return (a * 2 ** b) % 2 ** bits;
    case "shr":
      return Math.floor(a / 2 ** b);
  }
}

export function generate(rng: SeededRng, p: BitwiseParams): Question {
  const bits = Math.max(4, Math.min(16, Math.round((p.bits ?? 8) / 4) * 4));
  const weights = p.ops ?? DEFAULT_OPS;
  const op = rng.weighted(
    (Object.keys(weights) as BitwiseOp[]).filter((o) => (weights[o] ?? 0) > 0),
    (o) => weights[o] ?? 0,
  );
  const isShift = op === "shl" || op === "shr";
  const base: 2 | 16 = isShift ? 2 : (p.base ?? 2);
  const max = 2 ** bits - 1;
  const warm = isWarm(p);
  const maxShift = Math.max(1, Math.min(bits - 1, p.maxShift ?? 3));

  let a = 0;
  let b = 0;
  let result = 0;
  // Re-roll degenerate cases: zero/all-ones operands after warm-up, equal
  // operands, results equal to an operand or zero.
  for (let attempt = 0; attempt < 12; attempt++) {
    a = rng.int(warm ? 1 : 0, warm ? max - 1 : max);
    b = isShift
      ? rng.int(1, maxShift)
      : rng.int(warm ? 1 : 0, warm ? max - 1 : max);
    result = applyBitwise(op, a, b, bits);
    const degenerate = isShift
      ? result === 0 || result === a
      : a === b ||
        result === 0 ||
        result === a ||
        result === b ||
        result === max;
    if (!degenerate) break;
  }
  const width = digitsForBits(bits, base);
  const aDigits = toBase(a, base, width);
  const bDigits = isShift ? String(b) : toBase(b, base, width);
  return {
    id: `bitwise:${op}:${base}:${aDigits}:${bDigits}`,
    kind: "bitwise",
    topicId: p.topicId,
    instruction: isShift
      ? `Logical shift ${op === "shl" ? "left" : "right"} (${bits}-bit)`
      : `Bitwise ${SYMBOL[op]} (${bits}-bit ${base === 2 ? "binary" : "hex"})`,
    prompt: [
      numberPart(a, base, bits),
      { type: "op", text: SYMBOL[op] },
      isShift
        ? { type: "number", digits: String(b), base: 10 }
        : numberPart(b, base, bits),
    ],
    answerBase: base,
    answerFormat: base === 2 ? "binary" : "hex",
    answerBits: bits,
    answer: toBase(result, base, width),
    maxLength: width,
    difficulty: p.difficulty ?? clampDifficulty(base === 16 ? 4 : 3),
  };
}

const RULE: Record<"and" | "or" | "xor", string> = {
  and: "AND: the result bit is 1 only where both bits are 1. Use it to mask (keep) selected bits.",
  or: "OR: the result bit is 1 where either bit is 1. Use it to set bits.",
  xor: "XOR: the result bit is 1 where the bits differ. Use it to toggle bits.",
};

export function explain(q: Question): ExplanationStep[] {
  const [x, y] = promptNumbers(q);
  const opPart = q.prompt.find((part) => part.type === "op");
  const op = OP_BY_SYMBOL[opPart && opPart.type === "op" ? opPart.text : "AND"];
  const bits = q.answerBits ?? 8;
  const a = parseInBase(x.digits, x.base) ?? 0;
  const steps: ExplanationStep[] = [];

  if (op === "shl" || op === "shr") {
    const n = Number(y.digits);
    const result = applyBitwise(op, a, n, bits);
    const aBits = toBase(a, 2, bits);
    const rBits = toBase(result, 2, bits);
    const lost = op === "shl" ? aBits.slice(0, n) : aBits.slice(bits - n);
    steps.push({
      title: `Move every bit ${n} place${n > 1 ? "s" : ""} to the ${op === "shl" ? "left" : "right"}`,
      work: [`${show(aBits, 2)}  ${SYMBOL[op]} ${n}`, `${show(rBits, 2)}`],
      note:
        op === "shl"
          ? `The leftmost ${n} bit${n > 1 ? "s" : ""} (${lost}) fall off the ${bits}-bit register and ${n} zero${n > 1 ? "s" : ""} enter on the right.`
          : `The rightmost ${n} bit${n > 1 ? "s" : ""} (${lost}) fall off and ${n} zero${n > 1 ? "s" : ""} enter on the left (logical shift).`,
    });
    steps.push({
      title:
        op === "shl"
          ? `Same as multiplying by 2^${n}`
          : `Same as dividing by 2^${n}, rounding down`,
      work: [
        op === "shl"
          ? `${a} × ${2 ** n} = ${a * 2 ** n}${a * 2 ** n > 2 ** bits - 1 ? `, mod ${2 ** bits} = ${result}` : ""}`
          : `${a} ÷ ${2 ** n} = ${result}${a % 2 ** n ? ` remainder ${a % 2 ** n} (discarded)` : ""}`,
      ],
    });
    steps.push(answerStep(q));
    return steps;
  }

  const b = parseInBase(y.digits, y.base) ?? 0;
  const result = applyBitwise(op, a, b, bits);
  const aBits = toBase(a, 2, bits);
  const bBits = toBase(b, 2, bits);
  const rBits = toBase(result, 2, bits);
  if (x.base === 16) {
    steps.push({
      title: "Expand each hex digit to 4 bits",
      work: alignColumns([
        [x.digits.toUpperCase(), "→", show(aBits, 2)],
        [y.digits.toUpperCase(), "→", show(bBits, 2)],
      ]),
    });
  }
  const label = SYMBOL[op];
  steps.push({
    title: `Apply ${label} column by column`,
    work: alignColumns([
      ["", show(aBits, 2)],
      [label, show(bBits, 2)],
      ["", "-".repeat(show(aBits, 2).length)],
      ["", show(rBits, 2)],
    ]),
    note: RULE[op],
  });
  if (x.base === 16) {
    const groups = chunks(rBits, 4);
    steps.push({
      title: "Regroup the result into hex digits",
      work: [
        groups.join(" "),
        groups.map((g) => hexDigit(parseInt(g, 2)).padStart(4)).join(" "),
      ],
    });
  }
  steps.push(answerStep(q));
  return steps;
}
