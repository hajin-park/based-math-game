/**
 * Answer input handling: normalising typed text, filtering keystrokes and
 * checking answers. Answers are compared by value, so leading zeros, digit
 * separators, the base's own prefix and hex letter case never matter.
 */
import { BASES, digitsForBits, parseInBase } from "./bases";
import { isPrintableAscii } from "./kinds/ascii";
import type { AnswerFormat, Base, Question } from "./types";

export { formatAnswer } from "./kinds/shared";

const FORMAT_BASE: Record<Exclude<AnswerFormat, "char">, Base> = {
  binary: 2,
  octal: 8,
  decimal: 10,
  "signed-decimal": 10,
  hex: 16,
};

/** Prefix accepted (and stripped) for each numeric format. */
const PREFIX: Partial<Record<AnswerFormat, string>> = {
  binary: "0b",
  octal: "0o",
  hex: "0x",
};

/**
 * Canonicalise raw input for comparison: trim, lowercase, remove the format's
 * own prefix (0x for hex, 0b for binary, 0o for octal; never another base's,
 * since "0b1" is a valid hex number) and spaces/underscores used as digit
 * separators. `char` input is returned untouched (case and spaces matter).
 */
export function normalizeInput(raw: string, format: AnswerFormat): string {
  if (format === "char") return raw;
  let s = raw
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "");
  let sign = "";
  if (format === "signed-decimal" && s.startsWith("-")) {
    sign = "-";
    s = s.slice(1);
  }
  const prefix = PREFIX[format];
  if (prefix && s.startsWith(prefix)) s = s.slice(prefix.length);
  return sign + s;
}

/** Characters allowed while typing, per format (prefix and separators included). */
const TYPING_PATTERN: Record<Exclude<AnswerFormat, "char">, RegExp> = {
  binary: /^\s*(0b?)?[01_ ]*$/i,
  octal: /^\s*(0o?)?[0-7_ ]*$/i,
  decimal: /^\s*[0-9_ ]*$/,
  "signed-decimal": /^\s*-?[0-9_ ]*$/,
  hex: /^\s*(0x?)?[0-9a-f_ ]*$/i,
};

/**
 * Whether `raw` is an acceptable state of the answer field for `q`: only
 * characters valid for the answer format, and no more than `q.maxLength`
 * significant characters (digits plus a minus sign; prefix and separators do
 * not count). Use it to reject keystrokes before updating the input.
 */
export function isAcceptableKeystroke(raw: string, q: Question): boolean {
  if (raw === "") return true;
  if (q.answerFormat === "char")
    return raw.length <= 1 && isPrintableAscii(raw);
  if (raw.length > q.maxLength * 2 + 4) return false;
  if (!TYPING_PATTERN[q.answerFormat].test(raw)) return false;
  return normalizeInput(raw, q.answerFormat).length <= q.maxLength;
}

/**
 * Parse normalised input to a number in the format's base, or null if it is
 * not a complete number. "-0" parses to 0.
 */
export function parseAnswer(
  raw: string,
  format: Exclude<AnswerFormat, "char">,
): number | null {
  const s = normalizeInput(raw, format);
  const negative = format === "signed-decimal" && s.startsWith("-");
  const digits = negative ? s.slice(1) : s;
  const value = parseInBase(digits, FORMAT_BASE[format]);
  if (value === null) return null;
  return negative && value !== 0 ? -value : value;
}

/**
 * True when `raw` is a correct answer to `q`.
 *  - numeric answers compare by value, so "0x0F", "f", "00001111" (for a hex
 *    or binary answer of 15) are all fine;
 *  - fixed-width answers (`answerBits`) must also fit in that many bits' worth
 *    of digits, so a 9-digit binary answer to an 8-bit question is wrong even
 *    if it is "000000101";
 *  - hex is case-insensitive, `char` answers are case-sensitive and exact.
 */
export function checkAnswer(q: Question, raw: string): boolean {
  if (q.answerFormat === "char") return raw === q.answer;
  const format = q.answerFormat;
  const value = parseAnswer(raw, format);
  if (value === null) return false;
  const expected = parseAnswer(q.answer, format);
  if (expected === null || value !== expected) return false;
  const digits = normalizeInput(raw, format).replace(/^-/, "");
  if (q.answerBits && q.answerBase) {
    if (digits.length > digitsForBits(q.answerBits, q.answerBase)) return false;
  }
  return normalizeInput(raw, format).length <= q.maxLength;
}

/** Suggested `inputMode` for the answer field on mobile keyboards. */
export function inputModeFor(format: AnswerFormat): "numeric" | "text" {
  return format === "binary" || format === "octal" || format === "decimal"
    ? "numeric"
    : "text";
}

/** Prefix to show beside the answer field ("0x", "0b", "0o" or ""). */
export function answerPrefix(q: Question): string {
  return q.answerBase && q.answerFormat !== "char"
    ? BASES[q.answerBase].prefix
    : "";
}
