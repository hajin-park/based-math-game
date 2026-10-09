/**
 * Number-base metadata shared by every base-aware primitive (Digits, BaseTag,
 * BaseOdometer). The colour classes are written out in full so Tailwind's
 * content scanner keeps them.
 */
export type BaseKey = "bin" | "oct" | "dec" | "hex";

export interface BaseMeta {
  key: BaseKey;
  radix: 2 | 8 | 10 | 16;
  /** Three-letter tag shown in UI. */
  tag: string;
  /** Full English name (matches the game's question settings). */
  name: "Binary" | "Octal" | "Decimal" | "Hexadecimal";
  /** Conventional source-code prefix ("" for decimal). */
  prefix: string;
  /** Default digit grouping: nibbles for bin, bytes for hex, thousands. */
  group: number;
  /** Digits allowed in this base, in order. */
  alphabet: string;
  text: string;
  bg: string;
  softBg: string;
  border: string;
  fill: string;
}

export const BASES: Record<BaseKey, BaseMeta> = {
  bin: {
    key: "bin",
    radix: 2,
    tag: "BIN",
    name: "Binary",
    prefix: "0b",
    group: 4,
    alphabet: "01",
    text: "text-base-bin",
    bg: "bg-base-bin text-base-bin-foreground",
    softBg: "bg-base-bin/10",
    border: "border-base-bin/30",
    fill: "fill-base-bin",
  },
  oct: {
    key: "oct",
    radix: 8,
    tag: "OCT",
    name: "Octal",
    prefix: "0o",
    group: 3,
    alphabet: "01234567",
    text: "text-base-oct",
    bg: "bg-base-oct text-base-oct-foreground",
    softBg: "bg-base-oct/10",
    border: "border-base-oct/30",
    fill: "fill-base-oct",
  },
  dec: {
    key: "dec",
    radix: 10,
    tag: "DEC",
    name: "Decimal",
    prefix: "",
    group: 3,
    alphabet: "0123456789",
    text: "text-base-dec",
    bg: "bg-base-dec text-base-dec-foreground",
    softBg: "bg-base-dec/10",
    border: "border-base-dec/30",
    fill: "fill-base-dec",
  },
  hex: {
    key: "hex",
    radix: 16,
    tag: "HEX",
    name: "Hexadecimal",
    prefix: "0x",
    group: 2,
    alphabet: "0123456789ABCDEF",
    text: "text-base-hex",
    bg: "bg-base-hex text-base-hex-foreground",
    softBg: "bg-base-hex/10",
    border: "border-base-hex/30",
    fill: "fill-base-hex",
  },
};

export const BASE_ORDER: BaseKey[] = ["bin", "oct", "dec", "hex"];

/** Accepts "bin" | 2 | "Binary" | "binary" | "BIN" … and returns the key. */
export type BaseLike = BaseKey | 2 | 8 | 10 | 16 | string;

export function toBaseKey(base: BaseLike): BaseKey {
  if (typeof base === "number") {
    return ({ 2: "bin", 8: "oct", 10: "dec", 16: "hex" } as const)[base];
  }
  const b = base.toLowerCase();
  if (b.startsWith("bin")) return "bin";
  if (b.startsWith("oct")) return "oct";
  if (b.startsWith("hex")) return "hex";
  return "dec";
}

export function baseMeta(base: BaseLike): BaseMeta {
  return BASES[toBaseKey(base)];
}

/** Number of digits needed to show any value of `bits` width in a base. */
export function widthForBits(bits: number, base: BaseLike): number {
  const max = 2 ** bits - 1;
  return max.toString(baseMeta(base).radix).length;
}

/** Formats a non-negative integer in a base (uppercase, zero-padded). */
export function formatInBase(value: number, base: BaseLike, pad = 0): string {
  const { radix } = baseMeta(base);
  return Math.max(0, Math.trunc(value))
    .toString(radix)
    .toUpperCase()
    .padStart(pad, "0");
}

/** Splits a digit string into groups of `size`, counted from the right. */
export function groupDigits(digits: string, size: number): string[] {
  if (!size || size <= 0 || digits.length <= size) return [digits];
  const groups: string[] = [];
  for (let end = digits.length; end > 0; end -= size) {
    groups.unshift(digits.slice(Math.max(0, end - size), end));
  }
  return groups;
}

export type PlaceValue =
  | { kind: "weight"; text: string }
  | { kind: "power"; radix: number; exp: number };

/** Compact place-value label: the weight if short (≤4 chars), else r^n. */
export function placeValue(radix: number, position: number): PlaceValue {
  const weight = radix ** position;
  const text = String(weight);
  if (text.length <= 4) return { kind: "weight", text };
  return { kind: "power", radix, exp: position };
}
