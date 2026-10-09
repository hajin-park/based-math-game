/**
 * Facts quoted on the How to play page, derived from the engine so the copy
 * cannot drift from the rules. Answer examples are checked by unit tests
 * against the real answer checker.
 */
import {
  DAILY_LADDER,
  DAILY_QUESTION_COUNT,
  DAILY_SKIP_PENALTY_MS,
  SPEEDRUN_SKIP_PENALTY_MS,
  SPEEDRUN_TARGET,
  SPRINT_DURATION_MS,
  SURVIVAL_ENDGAME_FROM,
  SURVIVAL_LIVES,
  SURVIVAL_REVIEW_RATE,
  SURVIVAL_STAGES,
  TOPICS,
  listRankedModes,
  survivalTimeLimitMs,
  type Question,
} from "@/game";

export const FACTS = {
  sprintSeconds: SPRINT_DURATION_MS / 1000,
  speedrunTarget: SPEEDRUN_TARGET,
  speedrunSkipSeconds: SPEEDRUN_SKIP_PENALTY_MS / 1000,
  survivalLives: SURVIVAL_LIVES,
  /** Base per-question clock at the first question and its floor. */
  survivalStartSeconds: survivalTimeLimitMs(0) / 1000,
  survivalFloorSeconds: survivalTimeLimitMs(10_000) / 1000,
  survivalEndgameFrom: SURVIVAL_ENDGAME_FROM,
  /** "one in four" */
  survivalReviewOneIn: Math.round(1 / SURVIVAL_REVIEW_RATE),
  dailyCount: DAILY_QUESTION_COUNT,
  dailySkipSeconds: DAILY_SKIP_PENALTY_MS / 1000,
  /** Ranked static modes (topic sprint/speedrun + survival), daily excluded. */
  rankedModes: listRankedModes().length,
  /** Playable topics, excluding the user-built custom topic. */
  topics: TOPICS.filter((t) => t.id !== "custom").length,
  roomSize: 10,
} as const;

const topicName = (id: string) => TOPICS.find((t) => t.id === id)?.name ?? id;

/** Survival's topic ramp, in order. */
export const SURVIVAL_RAMP: string[] = SURVIVAL_STAGES.map((s) =>
  topicName(s.topicId),
);

/** Daily's ten rungs, in order. */
export const DAILY_RAMP: string[] = DAILY_LADDER.map(topicName);

/* -------------------------------------------------------------------------- */
/*  Answer examples                                                           */
/* -------------------------------------------------------------------------- */

const base: Pick<
  Question,
  "topicId" | "instruction" | "prompt" | "difficulty"
> = { topicId: "bytes-hex", instruction: "", prompt: [], difficulty: 2 };

export interface AnswerExample {
  /** What the question asks for, in words. */
  ask: string;
  /** The canonical answer as displayed. */
  answer: string;
  /** Inputs that are accepted. */
  accepted: string[];
  /** An input that is not accepted, with the reason. */
  rejected?: { input: string; why: string };
  /** The question the examples are checked against (tests only). */
  question: Question;
}

export const ANSWER_EXAMPLES: AnswerExample[] = [
  {
    ask: "A byte in hex",
    answer: "2F",
    accepted: ["2f", "2F", "0x2F", "0X2f"],
    question: {
      ...base,
      id: "ex:hex",
      kind: "convert",
      answerBase: 16,
      answerFormat: "hex",
      answer: "2f",
      maxLength: 2,
    },
  },
  {
    ask: "A byte in binary",
    answer: "0010 1111",
    accepted: ["101111", "00101111", "0010 1111", "0b0010_1111"],
    question: {
      ...base,
      id: "ex:bin",
      kind: "convert",
      answerBase: 2,
      answerFormat: "binary",
      answer: "101111",
      maxLength: 8,
    },
  },
  {
    ask: "A byte in decimal",
    answer: "47",
    accepted: ["47", "047"],
    question: {
      ...base,
      id: "ex:dec",
      kind: "convert",
      answerBase: 10,
      answerFormat: "decimal",
      answer: "47",
      maxLength: 3,
    },
  },
  {
    ask: "8-bit two’s complement → decimal",
    answer: "−74",
    accepted: ["-74"],
    rejected: { input: "74", why: "the sign matters" },
    question: {
      ...base,
      id: "ex:twos",
      kind: "twos",
      answerBase: 10,
      answerFormat: "signed-decimal",
      answer: "-74",
      maxLength: 4,
    },
  },
  {
    ask: "Hex code → ASCII character",
    answer: "a",
    accepted: ["a"],
    rejected: { input: "A", why: "characters are case-sensitive" },
    question: {
      ...base,
      id: "ex:char",
      kind: "ascii",
      answerFormat: "char",
      answer: "a",
      maxLength: 1,
    },
  },
];
