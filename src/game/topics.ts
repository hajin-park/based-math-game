/**
 * Topic catalog: what each topic teaches, why it matters, and the weighted
 * question recipes it generates from.
 */
import { generateFromRecipe, type KindRecipe } from "./kinds";
import type { SeededRng } from "./rng";
import type {
  CustomConfig,
  Question,
  QuestionKind,
  Tier,
  Topic,
  TopicId,
} from "./types";

export const TOPICS: readonly Topic[] = [
  {
    id: "nibbles",
    tier: "foundations",
    name: "Nibbles",
    summary: "Convert 4-bit values between binary, hex and decimal (0 to 15).",
    why: "A nibble is four bits, exactly one hex digit. Every binary-to-hex conversion, however long, is this one repeated, so recognising 0000 to 1111 on sight is the most useful skill in the game.",
    example: "1011 → B",
    learnAnchor: "nibbles",
  },
  {
    id: "powers",
    tier: "foundations",
    name: "Powers of Two",
    summary:
      "Know 2^0 to 2^16, find exponents, and name the largest n-bit value.",
    why: "Binary place values are powers of two, and so are the sizes of almost everything in computing: 1024 bytes in a KiB, 65,536 TCP ports, a 4 GiB 32-bit address space. Knowing them cold speeds up every other conversion.",
    example: "2^10 → 1024",
    learnAnchor: "powers-of-two",
  },
  {
    id: "bytes-bin",
    tier: "core",
    name: "Binary Bytes",
    summary: "Convert 8-bit values between binary and decimal (0 to 255).",
    why: "The byte is the unit of memory and network traffic. IPv4 addresses are four bytes written in decimal, and a subnet mask like 255.255.255.192 only makes sense once you see 192 as 1100 0000.",
    example: "1100 0000 → 192",
    learnAnchor: "binary",
  },
  {
    id: "bytes-hex",
    tier: "core",
    name: "Hex Bytes",
    summary: "Convert bytes between hex, decimal and binary (00 to FF).",
    why: "Hex is how programmers write bytes: memory dumps, hex editors, MAC addresses, UTF-8 encodings and CSS colors all use two hex digits per byte, because each digit is exactly one nibble.",
    example: "C8 → 200",
    learnAnchor: "hexadecimal",
  },
  {
    id: "octal",
    tier: "core",
    name: "Octal",
    summary:
      "Convert between octal, binary and decimal (0 to 511) using 3-bit groups.",
    why: "Each octal digit is three bits, which is why Unix permissions are written in octal: chmod 755 is rwx r-x r-x, one 3-bit group each for owner, group and others. Octal also appears in C escapes like \\033.",
    example: "755 → 111 101 101",
    learnAnchor: "octal",
  },
  {
    id: "words",
    tier: "advanced",
    name: "16-bit Words",
    summary:
      "Convert 16-bit values between hex, decimal and binary (0 to 65535).",
    why: "Sixteen bits is a port number, a UTF-16 code unit, a C short and one group of an IPv6 address. Reading values like 0x1F90 or 0x8000 at a glance is everyday work in systems programming and debugging.",
    example: "1F90 → 8080",
    learnAnchor: "words",
  },
  {
    id: "twos",
    tier: "advanced",
    name: "Two's Complement",
    summary: "Read and write signed 8-bit integers (−128 to 127).",
    why: "Every modern CPU stores signed integers in two's complement. It explains why 0xFF can mean −1, why a signed byte wraps from 127 to −128, and how one adder circuit also performs subtraction.",
    example: "1111 1110 → −2",
    learnAnchor: "twos-complement",
  },
  {
    id: "bitwise",
    tier: "advanced",
    name: "Bitwise Operations",
    summary: "AND, OR, XOR and logical shifts on 8-bit binary and hex values.",
    why: "Bitwise operations are how software talks to hardware: AND masks flags, OR sets them, XOR toggles them, and shifts pack fields or multiply by powers of two. An IP address AND its subnet mask gives the network address.",
    example: "1100 1010 AND 0000 1111 → 0000 1010",
    learnAnchor: "bitwise",
  },
  {
    id: "binary-add",
    tier: "advanced",
    name: "Binary Addition",
    summary:
      "Add two 8-bit unsigned numbers by hand, carrying in binary. Sums always fit in 8 bits.",
    why: "This is exactly what a CPU's adder does, one column at a time. Carries are the foundation for overflow detection, two's complement subtraction and checksums.",
    example: "0101 1011 + 0011 0110 → 1001 0001",
    learnAnchor: "binary-addition",
  },
  {
    id: "applied",
    tier: "applied",
    name: "Colors & ASCII",
    summary:
      "Read channels of hex colors and convert characters to and from ASCII codes.",
    why: "A CSS color like #3FA0C2 is three bytes: red, green and blue. Text is bytes too: 'A' is 0x41, '0' is 0x30, and lowercase letters sit exactly 0x20 above capitals. Both show up in web development, file formats and every hex dump.",
    example: "#3FA0C2 green → 160",
    learnAnchor: "colors-ascii",
  },
  {
    id: "mixed",
    tier: "core",
    name: "Mixed Bases",
    summary:
      "Binary, octal, decimal and hex conversions on bytes, shuffled together.",
    why: "Real work does not announce which base comes next. Switching between binary, octal, decimal and hex on the fly is what reading code, logs and datasheets demands.",
    example: "377 (octal) → FF",
    learnAnchor: "mixed",
  },
  {
    id: "custom",
    tier: "applied",
    name: "Custom",
    summary: "Your own mix of conversions, value ranges and question types.",
    why: "Built for teachers and targeted drills: choose exactly the conversions and ranges a lesson covers, or the question types you want more practice on.",
    example: "Hex → Binary, 0 to 4095",
    learnAnchor: "custom",
  },
];

export const TOPIC_IDS: readonly TopicId[] = TOPICS.map((t) => t.id);

/** Tiers in learning order. */
export const TIERS: readonly Tier[] = [
  "foundations",
  "core",
  "advanced",
  "applied",
];

const TOPIC_BY_ID = new Map(TOPICS.map((t) => [t.id, t]));

export function getTopic(id: TopicId): Topic {
  const topic = TOPIC_BY_ID.get(id);
  if (!topic) throw new Error(`Unknown topic: ${id}`);
  return topic;
}

export function isTopicId(id: string): id is TopicId {
  return TOPIC_BY_ID.has(id as TopicId);
}

/** Topics of one tier, in catalog order. */
export function topicsInTier(tier: Tier): Topic[] {
  return TOPICS.filter((t) => t.tier === tier);
}

/** A weighted recipe, tagged with the topic its questions belong to. */
export interface TopicRecipe {
  weight: number;
  topicId: TopicId;
  recipe: KindRecipe;
}

const conv = (
  from: 2 | 8 | 10 | 16,
  to: 2 | 8 | 10 | 16,
  max: number,
  padBits: number,
  difficulty: 1 | 2 | 3 | 4 | 5,
): KindRecipe => ({
  kind: "convert",
  params: { from, to, min: 0, max, padBits, difficulty },
});

const RECIPES: Record<
  Exclude<TopicId, "mixed" | "custom">,
  Array<{ weight: number; recipe: KindRecipe }>
> = {
  nibbles: [
    { weight: 3, recipe: conv(2, 16, 15, 4, 1) },
    { weight: 3, recipe: conv(16, 2, 15, 4, 1) },
    { weight: 2, recipe: conv(2, 10, 15, 4, 1) },
    { weight: 2, recipe: conv(10, 2, 15, 4, 1) },
  ],
  powers: [
    { weight: 1, recipe: { kind: "power", params: { minExp: 0, maxExp: 16 } } },
  ],
  "bytes-bin": [
    { weight: 1, recipe: conv(2, 10, 255, 8, 2) },
    { weight: 1, recipe: conv(10, 2, 255, 8, 2) },
  ],
  "bytes-hex": [
    { weight: 3, recipe: conv(16, 10, 255, 8, 2) },
    { weight: 3, recipe: conv(10, 16, 255, 8, 3) },
    { weight: 2, recipe: conv(16, 2, 255, 8, 2) },
    { weight: 2, recipe: conv(2, 16, 255, 8, 2) },
  ],
  octal: [
    { weight: 2, recipe: conv(8, 2, 511, 9, 2) },
    { weight: 2, recipe: conv(2, 8, 511, 9, 2) },
    { weight: 2, recipe: conv(8, 10, 511, 9, 2) },
    { weight: 2, recipe: conv(10, 8, 511, 9, 3) },
  ],
  words: [
    { weight: 3, recipe: conv(16, 10, 65535, 16, 4) },
    { weight: 2, recipe: conv(10, 16, 65535, 16, 5) },
    { weight: 2, recipe: conv(16, 2, 65535, 16, 3) },
    { weight: 3, recipe: conv(2, 16, 65535, 16, 3) },
  ],
  twos: [{ weight: 1, recipe: { kind: "twos", params: { bits: 8 } } }],
  bitwise: [
    {
      weight: 3,
      recipe: {
        kind: "bitwise",
        params: { base: 2, bits: 8, ops: { and: 1, or: 1, xor: 1 } },
      },
    },
    {
      weight: 2,
      recipe: {
        kind: "bitwise",
        params: { base: 16, bits: 8, ops: { and: 1, or: 1, xor: 1 } },
      },
    },
    {
      weight: 2,
      recipe: {
        kind: "bitwise",
        params: { base: 2, bits: 8, ops: { shl: 1, shr: 1 }, maxShift: 3 },
      },
    },
  ],
  "binary-add": [{ weight: 1, recipe: { kind: "add", params: { bits: 8 } } }],
  applied: [
    { weight: 3, recipe: { kind: "color", params: {} } },
    {
      weight: 2,
      recipe: { kind: "ascii", params: { direction: "char-to-hex" } },
    },
    {
      weight: 2,
      recipe: { kind: "ascii", params: { direction: "hex-to-char" } },
    },
  ],
};

/** Core topics blended (equally) by `mixed`. */
export const MIXED_TOPICS: readonly TopicId[] = [
  "bytes-bin",
  "bytes-hex",
  "octal",
];

/** Default recipe used by a custom config for each extra kind. */
const CUSTOM_KIND_RECIPES: Record<
  Exclude<QuestionKind, "convert">,
  KindRecipe
> = {
  power: RECIPES.powers[0].recipe,
  twos: RECIPES.twos[0].recipe,
  bitwise: { kind: "bitwise", params: { base: 2, bits: 8 } },
  add: RECIPES["binary-add"][0].recipe,
  color: { kind: "color", params: {} },
  ascii: { kind: "ascii", params: {} },
};

/** Largest value a custom conversion may use (32 bits). */
export const CUSTOM_MAX_VALUE = 0xffffffff;

/**
 * Clean a custom config: integer ranges clamped to 0..2^32-1 with min <= max,
 * conversions with from === to dropped, duplicate kinds removed. Throws if
 * nothing playable remains.
 */
export function normalizeCustomConfig(config: CustomConfig): CustomConfig {
  const clamp = (n: number) =>
    Math.max(0, Math.min(CUSTOM_MAX_VALUE, Math.floor(Number(n) || 0)));
  const conversions = (config.conversions ?? [])
    .filter((c) => c.from !== c.to)
    .map((c) => {
      const a = clamp(c.min);
      const b = clamp(c.max);
      return {
        from: c.from,
        to: c.to,
        min: Math.min(a, b),
        max: Math.max(a, b),
      };
    });
  const kinds = [
    ...new Set((config.kinds ?? []).filter((k) => k in CUSTOM_KIND_RECIPES)),
  ];
  if (conversions.length === 0 && kinds.length === 0) {
    throw new Error(
      "Custom config needs at least one conversion or question kind",
    );
  }
  const out: CustomConfig = { conversions };
  if (kinds.length) out.kinds = kinds;
  if (config.durationMs && config.durationMs > 0)
    out.durationMs = Math.round(config.durationMs);
  else if (config.targetCount && config.targetCount > 0)
    out.targetCount = Math.round(config.targetCount);
  return out;
}

/** The weighted recipes a topic draws from (custom needs its config). */
export function topicRecipes(
  topicId: TopicId,
  custom?: CustomConfig,
): TopicRecipe[] {
  if (topicId === "mixed") {
    return MIXED_TOPICS.flatMap((t) => {
      const rs = topicRecipes(t);
      const total = rs.reduce((a, r) => a + r.weight, 0);
      return rs.map((r) => ({ ...r, weight: r.weight / total }));
    });
  }
  if (topicId === "custom") {
    if (!custom) throw new Error("The custom topic needs a CustomConfig");
    const cfg = normalizeCustomConfig(custom);
    return [
      ...cfg.conversions.map((c) => ({
        weight: 2,
        topicId: "custom" as const,
        recipe: {
          kind: "convert",
          params: { from: c.from, to: c.to, min: c.min, max: c.max },
        } as KindRecipe,
      })),
      ...(cfg.kinds ?? []).map((k) => ({
        weight: 1,
        topicId: "custom" as const,
        recipe: CUSTOM_KIND_RECIPES[k],
      })),
    ];
  }
  return RECIPES[topicId].map((r) => ({ ...r, topicId }));
}

/**
 * Generate one question for a topic. `index` is the question's position in
 * the run (used to skip trivial values after warm-up). Questions from `mixed`
 * carry the topic they were drawn from (e.g. "bytes-hex").
 */
export function generateForTopic(
  rng: SeededRng,
  topicId: TopicId,
  ctx: { index: number },
  custom?: CustomConfig,
): Question {
  const recipes = topicRecipes(topicId, custom);
  const chosen = rng.weighted(recipes, (r) => r.weight);
  return generateFromRecipe(rng, chosen.recipe, {
    topicId: chosen.topicId,
    index: ctx.index,
  });
}
