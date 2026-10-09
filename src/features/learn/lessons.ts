/**
 * Pure helpers and reference data for the Learn page. Kept free of React so
 * every number the lessons quote can be unit tested.
 */
import {
  TOPICS,
  createRng,
  deriveSeed,
  generateForTopic,
  hashSeed,
  modeId,
  type Question,
  type Tier,
  type TopicId,
} from "@/game";

/* -------------------------------------------------------------------------- */
/*  Course outline                                                            */
/* -------------------------------------------------------------------------- */

export interface LessonEntry {
  /** DOM id and URL hash, e.g. "twos-complement". */
  id: string;
  /** Short label for the table of contents. */
  label: string;
  tier: Tier;
  /** Topic drilled by this lesson's "Practice" / "Sprint" links. */
  topicId?: TopicId;
}

const topicByAnchor = new Map(TOPICS.map((t) => [t.learnAnchor, t]));

function fromAnchor(anchor: string, label?: string): LessonEntry {
  const topic = topicByAnchor.get(anchor);
  if (!topic) throw new Error(`No topic teaches #${anchor}`);
  return {
    id: anchor,
    label: label ?? topic.name,
    tier: topic.tier,
    topicId: topic.id,
  };
}

/** Lessons in teaching order (foundations → applied). */
export const LESSONS: readonly LessonEntry[] = [
  { id: "place-value", label: "Place value", tier: "foundations" },
  fromAnchor("nibbles"),
  fromAnchor("powers-of-two"),
  fromAnchor("binary", "Binary bytes"),
  fromAnchor("hexadecimal", "Hexadecimal"),
  fromAnchor("octal"),
  fromAnchor("mixed", "Mixed bases"),
  fromAnchor("words"),
  fromAnchor("twos-complement"),
  fromAnchor("bitwise"),
  fromAnchor("binary-addition"),
  fromAnchor("colors-ascii"),
  fromAnchor("custom", "Custom drills"),
];

export const TIER_LABELS: Record<Tier, string> = {
  foundations: "Foundations",
  core: "Core",
  advanced: "Advanced",
  applied: "Applied",
};

/** `/play?mode=…` link for a topic and format. */
export function playHref(
  topicId: TopicId,
  format: "practice" | "sprint" | "speedrun",
): string {
  return `/play?mode=${modeId(topicId, format)}`;
}

/* -------------------------------------------------------------------------- */
/*  Bit helpers                                                               */
/* -------------------------------------------------------------------------- */

/** Mask a value to `bits` bits (unsigned). */
export function mask(value: number, bits: number): number {
  return ((value % 2 ** bits) + 2 ** bits) % 2 ** bits;
}

/** Bit `position` (0 = least significant) of `value`. */
export function bitAt(value: number, position: number): 0 | 1 {
  return (Math.floor(value / 2 ** position) % 2) as 0 | 1;
}

/** Interpret an unsigned `bits`-bit pattern as two's complement. */
export function toSigned(unsigned: number, bits: number): number {
  const u = mask(unsigned, bits);
  return u >= 2 ** (bits - 1) ? u - 2 ** bits : u;
}

/** Bit pattern (as unsigned) of a signed value in `bits`-bit two's complement. */
export function fromSigned(value: number, bits: number): number {
  return mask(value, bits);
}

/** Invert every bit of a `bits`-bit value (one's complement). */
export function invert(value: number, bits: number): number {
  return 2 ** bits - 1 - mask(value, bits);
}

/** Two's complement negation: invert and add one, wrapping at `bits` bits. */
export function negate(value: number, bits: number): number {
  return mask(invert(value, bits) + 1, bits);
}

export type BitOp = "and" | "or" | "xor" | "shl" | "shr";

/** Apply a bitwise operation; shifts are logical and results masked to `bits`. */
export function applyOp(op: BitOp, a: number, b: number, bits: number): number {
  const m = 2 ** bits - 1;
  switch (op) {
    case "and":
      return a & b & m;
    case "or":
      return (a | b) & m;
    case "xor":
      return (a ^ b) & m;
    case "shl":
      return mask(a * 2 ** b, bits);
    case "shr":
      return Math.floor(mask(a, bits) / 2 ** b);
  }
}

export interface AdditionColumns {
  /** Carry into each column, index 0 = least significant. */
  carryIn: (0 | 1)[];
  /** Sum bit of each column. */
  sum: (0 | 1)[];
  /** Carry out of the top column. */
  carryOut: 0 | 1;
  /** a + b masked to `bits`. */
  result: number;
}

/** Column-by-column binary addition, the way it is done by hand. */
export function addColumns(
  a: number,
  b: number,
  bits: number,
): AdditionColumns {
  const carryIn: (0 | 1)[] = [];
  const sum: (0 | 1)[] = [];
  let carry: 0 | 1 = 0;
  for (let i = 0; i < bits; i++) {
    carryIn.push(carry);
    const s = bitAt(a, i) + bitAt(b, i) + carry;
    sum.push((s % 2) as 0 | 1);
    carry = s >= 2 ? 1 : 0;
  }
  return { carryIn, sum, carryOut: carry, result: mask(a + b, bits) };
}

/* -------------------------------------------------------------------------- */
/*  Octal / chmod                                                             */
/* -------------------------------------------------------------------------- */

/** "755" → "rwxr-xr-x". */
export function permString(octal: string): string {
  return [...octal]
    .map((d) => {
      const n = parseInt(d, 8);
      return `${n & 4 ? "r" : "-"}${n & 2 ? "w" : "-"}${n & 1 ? "x" : "-"}`;
    })
    .join("");
}

/* -------------------------------------------------------------------------- */
/*  ASCII                                                                     */
/* -------------------------------------------------------------------------- */

export const ASCII_ANCHORS = [
  { code: 0x30, char: "0", note: "digits 0–9 are 0x30–0x39" },
  { code: 0x41, char: "A", note: "capitals A–Z are 0x41–0x5A" },
  { code: 0x61, char: "a", note: "lowercase a–z are 0x61–0x7A" },
] as const;

/** The other-case partner of an ASCII letter (flip bit 5, i.e. XOR 0x20), or null. */
export function casePartner(code: number): number | null {
  const isUpper = code >= 0x41 && code <= 0x5a;
  const isLower = code >= 0x61 && code <= 0x7a;
  return isUpper || isLower ? code ^ 0x20 : null;
}

/** Printable ASCII (0x20–0x7E) for a single character, or null. */
export function asciiCode(ch: string): number | null {
  if (ch.length !== 1) return null;
  const c = ch.charCodeAt(0);
  return c >= 0x20 && c <= 0x7e ? c : null;
}

/* -------------------------------------------------------------------------- */
/*  Colors                                                                    */
/* -------------------------------------------------------------------------- */

export function hex2(n: number): string {
  return mask(n, 8).toString(16).toUpperCase().padStart(2, "0");
}

export function rgbHex(r: number, g: number, b: number): string {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
}

/* -------------------------------------------------------------------------- */
/*  Converter                                                                 */
/* -------------------------------------------------------------------------- */

export type Radix = 2 | 8 | 10 | 16;

const VALID: Record<Radix, RegExp> = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-f]+$/,
};
const PREFIX: Partial<Record<Radix, string>> = { 2: "0b", 8: "0o", 16: "0x" };

/**
 * Parse what a learner typed in `radix`: spaces/underscores and the base's own
 * prefix are ignored, hex is case-insensitive. Returns null when invalid or
 * above `max`.
 */
export function parseLoose(
  raw: string,
  radix: Radix,
  max: number,
): number | null {
  let s = raw
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "");
  const prefix = PREFIX[radix];
  if (prefix && s.startsWith(prefix)) s = s.slice(prefix.length);
  if (!s || !VALID[radix].test(s)) return null;
  const n = parseInt(s, radix);
  return Number.isSafeInteger(n) && n <= max ? n : null;
}

/* -------------------------------------------------------------------------- */
/*  Reference tables                                                          */
/* -------------------------------------------------------------------------- */

/** Where powers of two show up, for the powers table. */
export const POWER_LANDMARKS: Record<number, string> = {
  4: "values in a nibble",
  8: "values in a byte",
  10: "bytes in a KiB",
  16: "values in 16 bits (ports 0–65535)",
};

/** 16-bit values worth recognising on sight. */
export const WORD_LANDMARKS = [
  { hex: "0050", dec: 80, note: "HTTP port" },
  { hex: "01BB", dec: 443, note: "HTTPS port" },
  { hex: "1F90", dec: 8080, note: "alternate HTTP port" },
  { hex: "8000", dec: 32768, note: "top bit set: 2¹⁵" },
  { hex: "FFFF", dec: 65535, note: "all 16 bits set" },
] as const;

/* -------------------------------------------------------------------------- */
/*  Generated examples                                                        */
/* -------------------------------------------------------------------------- */

/** Question index used for examples: past warm-up, so values are non-trivial. */
const EXAMPLE_INDEX = 5;

/** The `n`th "Try one" example for a topic (deterministic). */
export function exampleQuestion(topicId: TopicId, n: number): Question {
  const seed = deriveSeed(hashSeed(`learn:${topicId}`), n);
  return generateForTopic(createRng(seed), topicId, { index: EXAMPLE_INDEX });
}
