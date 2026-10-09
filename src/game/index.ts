/**
 * Game engine public API. Import from "@/game".
 */
export type * from "./types";

export {
  mulberry32,
  createRng,
  hashSeed,
  deriveSeed,
  randomSeed,
  type SeededRng,
} from "./rng";

export {
  BASES,
  ALL_BASES,
  baseInfo,
  isBase,
  toBase,
  parseInBase,
  groupDigits,
  digitsForBits,
  bitLength,
  displayDigits,
  type BaseInfo,
} from "./bases";

export {
  KINDS,
  generateFromRecipe,
  explainQuestion,
  generateAvoiding,
  type KindRecipe,
  type KindParamsMap,
  type KindParams,
  type ConvertParams,
  type PowerParams,
  type PowerVariant,
  type TwosParams,
  type TwosDirection,
  type BitwiseParams,
  type BitwiseOp,
  type AddParams,
  type ColorParams,
  type Channel,
  type AsciiParams,
  type AsciiDirection,
} from "./kinds";
export { WARMUP_QUESTIONS } from "./kinds/shared";

export {
  normalizeInput,
  isAcceptableKeystroke,
  parseAnswer,
  checkAnswer,
  formatAnswer,
  inputModeFor,
  answerPrefix,
} from "./answer";

export {
  TOPICS,
  TOPIC_IDS,
  TIERS,
  MIXED_TOPICS,
  CUSTOM_MAX_VALUE,
  getTopic,
  isTopicId,
  topicsInTier,
  topicRecipes,
  generateForTopic,
  normalizeCustomConfig,
  type TopicRecipe,
} from "./topics";

export {
  FORMATS,
  FORMAT_IDS,
  getFormat,
  isFormat,
  SPRINT_DURATION_MS,
  SPEEDRUN_TARGET,
  SPEEDRUN_SKIP_PENALTY_MS,
  SURVIVAL_LIVES,
  DAILY_QUESTION_COUNT,
  DAILY_SKIP_PENALTY_MS,
  SURVIVAL_STAGES,
  SURVIVAL_ENDGAME,
  SURVIVAL_ENDGAME_FROM,
  SURVIVAL_REVIEW_RATE,
  survivalTopicAt,
  survivalTimeLimitMs,
  DAILY_LADDER,
} from "./formats";

export {
  SURVIVAL_MODE_ID,
  CUSTOM_MODE_ID,
  TOPIC_FORMATS,
  modeId,
  listModes,
  listRankedModes,
  getMode,
  dailyModeFor,
  dailyDateOf,
  utcDateKey,
  isValidDateKey,
  customMode,
  parseModeId,
  isRankedModeId,
  type ParsedModeId,
} from "./catalog";

export {
  RECENT_WINDOW,
  createQuestionStream,
  generateForMode,
  dailySeed,
  effectiveSeed,
  type QuestionStream,
} from "./stream";

export {
  SCORE_LIMITS,
  computeScore,
  summarizeRun,
  compareScores,
  isBetterScore,
  formatScore,
  formatMs,
  validateSummary,
  type SummarizeInput,
} from "./scoring";

export {
  createRunState,
  runReducer,
  runClock,
  runSummary,
  activeMs,
  type RunState,
  type RunAction,
  type RunStatus,
  type RunReveal,
  type RunClock,
} from "./run";

export { useRun, type UseRunOptions, type UseRunResult } from "./useRun";
