/**
 * Base metadata and exact integer conversions (safe up to 2^53, the engine
 * never generates values above 32 bits).
 */
import type { Base } from "./types";

export interface BaseInfo {
  base: Base;
  /** "Binary" | "Octal" | "Decimal" | "Hexadecimal" */
  name: string;
  /** "BIN" | "OCT" | "DEC" | "HEX" */
  short: string;
  /** Literal prefix used in code: "0b" | "0o" | "" | "0x" */
  prefix: string;
  /** Matches one valid digit (case-insensitive for hex). */
  digitRegex: RegExp;
  /** Matches a whole non-empty digit string. */
  numberRegex: RegExp;
  /** Digits per display group: binary 4 (nibbles), octal 3, hex 2 (bytes), decimal none. */
  groupSize?: number;
  /** Bits represented by one digit (1, 3, 4); undefined for decimal. */
  bitsPerDigit?: number;
}

export const BASES: Record<Base, BaseInfo> = {
  2: {
    base: 2,
    name: "Binary",
    short: "BIN",
    prefix: "0b",
    digitRegex: /^[01]$/,
    numberRegex: /^[01]+$/,
    groupSize: 4,
    bitsPerDigit: 1,
  },
  8: {
    base: 8,
    name: "Octal",
    short: "OCT",
    prefix: "0o",
    digitRegex: /^[0-7]$/,
    numberRegex: /^[0-7]+$/,
    groupSize: 3,
    bitsPerDigit: 3,
  },
  10: {
    base: 10,
    name: "Decimal",
    short: "DEC",
    prefix: "",
    digitRegex: /^[0-9]$/,
    numberRegex: /^[0-9]+$/,
  },
  16: {
    base: 16,
    name: "Hexadecimal",
    short: "HEX",
    prefix: "0x",
    digitRegex: /^[0-9a-f]$/i,
    numberRegex: /^[0-9a-f]+$/i,
    groupSize: 2,
    bitsPerDigit: 4,
  },
};

export const ALL_BASES: readonly Base[] = [2, 8, 10, 16];

export function baseInfo(base: Base): BaseInfo {
  return BASES[base];
}

export function isBase(n: unknown): n is Base {
  return n === 2 || n === 8 || n === 10 || n === 16;
}

/**
 * Non-negative integer to digits in `base` (lowercase hex, no prefix),
 * left-padded with zeros to `minDigits` when given.
 */
export function toBase(value: number, base: Base, minDigits = 0): string {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(
      `toBase: expected a non-negative safe integer, got ${value}`,
    );
  }
  return value.toString(base).padStart(minDigits, "0");
}

/**
 * Parse an unprefixed digit string in `base`. Returns null for empty or
 * invalid input (unlike parseInt, which silently stops at the first bad digit).
 */
export function parseInBase(digits: string, base: Base): number | null {
  if (!BASES[base].numberRegex.test(digits)) return null;
  const value = parseInt(digits, base);
  return Number.isSafeInteger(value) ? value : null;
}

/** Number of digits needed in `base` to show any `bits`-bit value. */
export function digitsForBits(bits: number, base: Base): number {
  if (base === 10) return Math.max(1, (2 ** bits - 1).toString(10).length);
  return Math.ceil(bits / BASES[base].bitsPerDigit!);
}

/** Number of bits needed to write `value` (bitLength(0) = 1). */
export function bitLength(value: number): number {
  return value <= 0 ? 1 : Math.floor(Math.log2(value)) + 1;
}

/**
 * Split digits into groups of `size` counted from the right:
 * groupDigits("10110110", 4) -> "1011 0110"; groupDigits("1ff", 2) -> "1 ff".
 */
export function groupDigits(
  digits: string,
  size: number,
  separator = " ",
): string {
  if (size <= 0 || digits.length <= size) return digits;
  const out: string[] = [];
  for (let end = digits.length; end > 0; end -= size) {
    out.unshift(digits.slice(Math.max(0, end - size), end));
  }
  return out.join(separator);
}

/** Display form: uppercase hex, optional prefix, optional grouping. */
export function displayDigits(
  digits: string,
  base: Base,
  opts: { prefix?: boolean; group?: boolean } = {},
): string {
  let d = base === 16 ? digits.toUpperCase() : digits;
  const size = BASES[base].groupSize;
  if (opts.group && size && base === 2) d = groupDigits(d, size);
  return (opts.prefix ? BASES[base].prefix : "") + d;
}
