/**
 * Game engine contract.
 *
 * Everything gameplay-related (question generation, answer checking, worked
 * explanations, the mode catalog and scoring) lives under src/game and is pure
 * TypeScript with no React or Firebase imports, so it can be unit tested and
 * shared by singleplayer, multiplayer and the daily challenge.
 */

/** Numeric bases the game works with. */
export type Base = 2 | 8 | 10 | 16;

/** Kinds of question the engine can generate. */
export type QuestionKind =
  | "convert" // value shown in one base, answer in another
  | "power" // powers of two: 2^n -> decimal, or decimal -> n
  | "twos" // two's complement, fixed bit width
  | "bitwise" // AND / OR / XOR / shifts on fixed-width operands
  | "add" // binary addition
  | "color" // hex color channel -> decimal
  | "ascii"; // printable ASCII character <-> hex code

/**
 * What kind of characters the answer field accepts. Used by the input to
 * filter keystrokes and pick the mobile keyboard (inputMode).
 */
export type AnswerFormat =
  | "binary"
  | "octal"
  | "decimal"
  | "signed-decimal" // decimal with an optional leading minus sign
  | "hex"
  | "char"; // a single printable character

/**
 * A prompt is rendered as a list of parts so the UI can style each one
 * (operands in a base color, operators dimmed, color swatches, etc.)
 * without parsing strings.
 */
export type PromptPart =
  | { type: "number"; digits: string; base: Base; bits?: number } // digits already in `base`, no prefix
  | { type: "op"; text: string } // e.g. "AND", "+", "<<", "2^"
  | { type: "text"; text: string } // free text, e.g. "green channel of"
  | { type: "swatch"; hex: string } // e.g. "#3FA0C2"
  | { type: "char"; char: string }; // e.g. "A"

export interface ExplanationStep {
  /** Short heading of the step, e.g. "Group into nibbles". */
  title: string;
  /** Monospace working, one line per entry, e.g. ["1011 0110", "  B    6"]. */
  work?: string[];
  /** Plain-language note. */
  note?: string;
}

export interface Question {
  /** Stable id for React keys and analytics: `${kind}:${canonical-input}`. */
  id: string;
  kind: QuestionKind;
  topicId: TopicId;
  /** One-line instruction above the prompt, e.g. "Binary → Decimal". */
  instruction: string;
  prompt: PromptPart[];
  /** Base of the expected answer when it is numeric (drives prefix + coloring). */
  answerBase?: Base;
  answerFormat: AnswerFormat;
  /** Fixed answer width when relevant (e.g. 8 for an 8-bit two's complement answer). */
  answerBits?: number;
  /** Canonical answer, normalized (lowercase hex, no prefix, no leading zeros unless answerBits). */
  answer: string;
  /** Max characters the answer field should allow (prefixes excluded). */
  maxLength: number;
  /** Difficulty weight 1..5, used by survival ramping and by the scoring of points-based modes. */
  difficulty: 1 | 2 | 3 | 4 | 5;
}

/** Tiers group topics on the mode-select screen in learning order. */
export type Tier = "foundations" | "core" | "advanced" | "applied";

export type TopicId =
  | "nibbles"
  | "powers"
  | "bytes-bin"
  | "bytes-hex"
  | "octal"
  | "words"
  | "twos"
  | "bitwise"
  | "binary-add"
  | "applied"
  | "mixed"
  | "custom";

export interface Topic {
  id: TopicId;
  tier: Tier;
  name: string; // "Hex Bytes"
  /** One sentence shown on cards: what you will practice. */
  summary: string;
  /** Why this matters / where it shows up in real CS, for the detail panel. */
  why: string;
  /** Short example rendered on the card, e.g. "1011 → B". */
  example: string;
  /** Tutorial anchor on /learn that teaches this topic. */
  learnAnchor: string;
}

/** Ways to play a topic. */
export type Format =
  | "sprint" // fixed time, most correct answers wins
  | "speedrun" // fixed number of correct answers, fastest time wins
  | "survival" // lives + shrinking per-question timer, ramps through topics
  | "daily" // seeded per UTC day, same questions for everyone
  | "practice"; // untimed, hints and worked steps, never ranked

export interface FormatSpec {
  format: Format;
  name: string;
  summary: string;
  /** Sprint: total time. */
  durationMs?: number;
  /** Speedrun / daily: number of questions to finish. */
  targetCount?: number;
  /** Survival: starting lives. */
  lives?: number;
  /** Whether the result goes to a leaderboard (signed-in, non-anonymous users only). */
  ranked: boolean;
  /** How to compare scores on the leaderboard. */
  scoreOrder: "higher-better" | "lower-better";
  /** Unit of the stored score. */
  scoreUnit: "correct" | "ms" | "cleared";
}

/** Settings for the user-built custom topic (teachers / targeted drills). */
export interface CustomConfig {
  /** Conversion pairs with inclusive decimal ranges. */
  conversions: Array<{ from: Base; to: Base; min: number; max: number }>;
  /** Extra non-conversion kinds to mix in. */
  kinds?: Exclude<QuestionKind, "convert">[];
  /** Sprint duration (ms) or speedrun target; omitted = untimed practice. */
  durationMs?: number;
  targetCount?: number;
}

export interface GameMode {
  /** `${topicId}:${format}` for catalog modes, `daily:YYYY-MM-DD` for daily, `custom` for custom. */
  id: string;
  topicId: TopicId;
  format: Format;
  name: string; // "Hex Bytes · Sprint"
  ranked: boolean;
  spec: FormatSpec;
  custom?: CustomConfig;
}

/** Deterministic PRNG interface (mulberry32 or similar). */
export interface Rng {
  next(): number; // [0, 1)
  int(minInclusive: number, maxInclusive: number): number;
  pick<T>(items: readonly T[]): T;
}

/** Outcome of one question during a run. */
export interface QuestionOutcome {
  question: Question;
  result: "correct" | "skipped" | "timeout";
  /** Time from the question appearing to the outcome. */
  elapsedMs: number;
  /** Keystrokes and deletions while on this question. */
  keystrokes: number;
  deletions: number;
}

/** Summary of a finished run, passed to results, stats and leaderboards. */
export interface RunSummary {
  modeId: string;
  topicId: TopicId;
  format: Format;
  /** The leaderboard score in the unit given by the format spec. */
  score: number;
  correct: number;
  skipped: number;
  durationMs: number;
  /** correct / (correct + skipped + timeouts), 0..1 */
  accuracy: number;
  /** (keystrokes - deletions) / keystrokes, 0..1 */
  typingAccuracy: number;
  outcomes: QuestionOutcome[];
  /** Seed used for the run, so a run can be reproduced. */
  seed: number;
  endedAt: number;
}
