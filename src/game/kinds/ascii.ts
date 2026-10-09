/**
 * ascii: printable ASCII characters (0x21..0x7E, space excluded) and their
 * 2-digit hex codes, in both directions. Character answers are case-sensitive.
 */
import { toBase } from "../bases";
import type { SeededRng } from "../rng";
import type { ExplanationStep, Question } from "../types";
import { type KindParams, answerStep, clampDifficulty } from "./shared";

export type AsciiDirection = "char-to-hex" | "hex-to-char";

export interface AsciiParams extends KindParams {
  /** Omit to pick either direction with equal probability. */
  direction?: AsciiDirection;
  /** Probability of a letter or digit rather than punctuation (default 0.75). */
  alnumRate?: number;
}

export const ASCII_MIN = 0x21;
export const ASCII_MAX = 0x7e;

const PUNCTUATION: number[] = [];
for (let c = ASCII_MIN; c <= ASCII_MAX; c++) {
  if (!/[A-Za-z0-9]/.test(String.fromCharCode(c))) PUNCTUATION.push(c);
}

export function isPrintableAscii(ch: string): boolean {
  if (ch.length !== 1) return false;
  const c = ch.charCodeAt(0);
  return c >= ASCII_MIN && c <= ASCII_MAX;
}

export function generate(rng: SeededRng, p: AsciiParams): Question {
  const direction =
    p.direction ?? (rng.chance(0.5) ? "char-to-hex" : "hex-to-char");
  let code: number;
  if (rng.chance(p.alnumRate ?? 0.75)) {
    const cls = rng.pick(["upper", "lower", "digit"] as const);
    code =
      cls === "upper"
        ? rng.int(0x41, 0x5a)
        : cls === "lower"
          ? rng.int(0x61, 0x7a)
          : rng.int(0x30, 0x39);
  } else {
    code = rng.pick(PUNCTUATION);
  }
  const ch = String.fromCharCode(code);
  const hex = toBase(code, 16, 2);
  const common = { kind: "ascii" as const, topicId: p.topicId };
  if (direction === "char-to-hex") {
    return {
      ...common,
      id: `ascii:c>h:${hex}`,
      instruction: "ASCII character → Hex code",
      prompt: [{ type: "char", char: ch }],
      answerBase: 16,
      answerFormat: "hex",
      answer: hex,
      maxLength: 2,
      difficulty:
        p.difficulty ?? clampDifficulty(/[A-Za-z0-9]/.test(ch) ? 2 : 3),
    };
  }
  return {
    ...common,
    id: `ascii:h>c:${hex}`,
    instruction: "Hex code → ASCII character",
    prompt: [{ type: "number", digits: hex.toUpperCase(), base: 16, bits: 8 }],
    answerFormat: "char",
    answer: ch,
    maxLength: 1,
    difficulty: p.difficulty ?? clampDifficulty(/[A-Za-z0-9]/.test(ch) ? 2 : 3),
  };
}

/** The 16 characters of an ASCII table row (high nibble 2..7). */
function tableRow(high: number): string[] {
  return Array.from({ length: 16 }, (_, lo) => {
    const c = high * 16 + lo;
    if (c === 0x20) return "␠";
    if (c === 0x7f) return "DEL";
    return String.fromCharCode(c);
  });
}

function hx(n: number): string {
  return `0x${n.toString(16).toUpperCase().padStart(2, "0")}`;
}

/** Explain where `code` sits relative to a memorable anchor. */
function anchorWork(
  code: number,
  toHex: boolean,
): { title: string; work: string[]; note: string } {
  const ch = String.fromCharCode(code);
  const q = (c: number) => `'${String.fromCharCode(c)}'`;
  let anchor: number | null = null;
  let note = "";
  if (code >= 0x30 && code <= 0x39) {
    anchor = 0x30;
    note = "Digits start at '0' = 0x30, so digit n is 0x30 + n.";
  } else if (code >= 0x41 && code <= 0x5a) {
    anchor = code >= 0x50 ? 0x50 : 0x41;
    note =
      "Capitals run from 'A' = 0x41 to 'Z' = 0x5A; 'P' = 0x50 is a handy second anchor.";
  } else if (code >= 0x61 && code <= 0x7a) {
    anchor = code >= 0x70 ? 0x70 : 0x61;
    note =
      "Lowercase letters are capitals + 0x20 ('a' = 0x61, 'p' = 0x70): flipping bit 5 changes case.";
  }
  if (anchor !== null) {
    const off = code - anchor;
    const offText =
      off > 9 ? `${off} (0x${off.toString(16).toUpperCase()})` : String(off);
    return {
      title: toHex
        ? `Count from ${q(anchor)} = ${hx(anchor)}`
        : `${hx(code)} is ${offText} after ${hx(anchor)} = ${q(anchor)}`,
      work: [
        toHex
          ? `${q(code)} is ${offText} after ${q(anchor)}: ${hx(anchor)} + ${off} = ${hx(code)}`
          : `${q(anchor)} + ${off} = ${q(code)}`,
      ],
      note,
    };
  }
  const high = code >> 4;
  const low = code & 15;
  const row = tableRow(high);
  return {
    title: `Look it up in row ${high} of the ASCII table`,
    work: [
      `      ${Array.from({ length: 16 }, (_, i) =>
        i.toString(16).toUpperCase().padEnd(3),
      )
        .join("")
        .trimEnd()}`,
      `${high}_    ${row
        .map((c) => c.padEnd(3))
        .join("")
        .trimEnd()}`,
      toHex
        ? `${q(code)} is row ${high}, column ${low.toString(16).toUpperCase()} → ${hx(code)}`
        : `row ${high}, column ${low.toString(16).toUpperCase()} → '${ch}'`,
    ],
    note: "The high hex digit picks the row, the low hex digit picks the column. Punctuation fills the gaps between digits and letters.",
  };
}

export function explain(q: Question): ExplanationStep[] {
  const code = parseInt(q.id.split(":")[2], 16);
  const toHex = q.id.split(":")[1] === "c>h";
  return [
    anchorWork(code, toHex),
    answerStep(q, toHex ? "Hex, 2 digits." : "Character (case-sensitive)."),
  ];
}
