/**
 * Plain-language descriptions of questions, answers and modes, shared by the
 * game surface (accessible names, live announcements) and the results page.
 */
import {
  answerPrefix,
  formatScore,
  getFormat,
  getTopic,
  type AnswerFormat,
  type Base,
  type GameMode,
  type PromptPart,
  type Question,
} from "@/game";

const BASE_WORD: Record<Base, string> = {
  2: "binary",
  8: "octal",
  10: "decimal",
  16: "hexadecimal",
};

const BASE_TAG: Record<Base, "bin" | "oct" | "dec" | "hex"> = {
  2: "bin",
  8: "oct",
  10: "dec",
  16: "hex",
};

export function baseWord(base: Base): string {
  return BASE_WORD[base];
}

export function baseTagKey(base: Base) {
  return BASE_TAG[base];
}

const FORMAT_WORD: Record<AnswerFormat, string> = {
  binary: "binary",
  octal: "octal",
  decimal: "decimal",
  "signed-decimal": "decimal",
  hex: "hexadecimal",
  char: "a single character",
};

/** "decimal", "hexadecimal", "a single character"… */
export function answerWord(q: Question): string {
  if (q.answerFormat === "binary" && q.answerBits)
    return `${q.answerBits}-bit binary`;
  return FORMAT_WORD[q.answerFormat];
}

const OP_WORD: Record<string, string> = {
  "2^": "2 to the power",
  "+": "plus",
  "=": "equals",
  "<<": "shifted left by",
  ">>": "shifted right by",
  AND: "AND",
  OR: "OR",
  XOR: "XOR",
};

function speakChar(char: string): string {
  if (char === " ") return "space";
  return `"${char}"`;
}

function speakPart(part: PromptPart): string {
  switch (part.type) {
    case "number":
      return part.base === 10
        ? part.digits
        : `${part.digits} ${baseWord(part.base)}`;
    case "op":
      return OP_WORD[part.text] ?? part.text;
    case "text":
      return part.text;
    case "swatch":
      return `color ${part.hex}`;
    case "char":
      return `character ${speakChar(part.char)}`;
  }
}

/**
 * Accessible name of the question, e.g. "Convert 1011 from binary to
 * decimal". Conversions use exactly that shape (QA scripts read it).
 */
export function questionLabel(q: Question): string {
  const first = q.prompt[0];
  if (q.kind === "convert" && first?.type === "number" && q.answerBase) {
    return `Convert ${first.digits} from ${baseWord(first.base)} to ${baseWord(q.answerBase)}`;
  }
  if (q.kind === "twos" && first?.type === "number") {
    return first.base === 2
      ? `Read ${first.digits} as ${q.instruction.split(" →")[0]}, answer in decimal`
      : `Write ${first.digits} in ${q.answerBits ?? 8}-bit two's complement binary`;
  }
  if (q.kind === "ascii") {
    return first?.type === "char"
      ? `ASCII code of the character ${speakChar(first.char)}, answer in hexadecimal`
      : `Character with ASCII code ${first?.type === "number" ? first.digits : ""} hexadecimal, answer with the character`;
  }
  const spoken = q.prompt.map(speakPart).join(" ");
  return `${spoken}. ${q.instruction}. Answer in ${answerWord(q)}`;
}

/** The canonical answer as the player would type it, with its prefix ("0xB"). */
export function displayAnswer(q: Question): string {
  if (q.answerFormat === "char") return q.answer === " " ? "space" : q.answer;
  const prefix = answerPrefix(q);
  const digits = q.answerFormat === "hex" ? q.answer.toUpperCase() : q.answer;
  return `${prefix}${digits}`;
}

/** Spoken answer for live regions ("B hexadecimal"). */
export function spokenAnswer(q: Question): string {
  if (q.answerFormat === "char") return speakChar(q.answer);
  const digits = q.answerFormat === "hex" ? q.answer.toUpperCase() : q.answer;
  return q.answerBase && q.answerBase !== 10
    ? `${digits} ${baseWord(q.answerBase)}`
    : digits;
}

/** "Hex Bytes · Sprint", "Daily · 2026-10-09", "Custom drill · Sprint". */
export function modeTitle(mode: GameMode): string {
  if (mode.format === "daily") return "Daily challenge";
  if (mode.format === "survival") return "Survival";
  if (mode.topicId === "custom") return "Custom drill";
  return getTopic(mode.topicId).name;
}

/** Short format line under the mode title. */
export function formatLine(mode: GameMode): string {
  const spec = mode.spec;
  switch (mode.format) {
    case "sprint":
      return `Sprint · ${Math.round((spec.durationMs ?? 60_000) / 1000)} s`;
    case "speedrun":
      return `Speedrun · ${spec.targetCount ?? 15} correct`;
    case "survival":
      return `${spec.lives ?? 3} lives · shrinking clock`;
    case "daily":
      return `${spec.targetCount ?? 10} questions · ${mode.id.slice(6)}`;
    case "practice":
      return "Practice · untimed";
  }
}

/** Format name as shown on buttons ("Sprint 60 s"). */
export function formatButtonLabel(format: GameMode["format"]): string {
  switch (format) {
    case "sprint":
      return "Sprint 60 s";
    case "speedrun":
      return "Speedrun 15";
    default:
      return getFormat(format).name;
  }
}

export function scoreText(mode: Pick<GameMode, "spec">, score: number) {
  return formatScore(mode.spec, score);
}

/** "1.8 s" style seconds with one decimal. */
export function seconds1(ms: number): string {
  return `${(Math.max(0, ms) / 1000).toFixed(1)} s`;
}

/** "0:42" clock for sprint timers. */
export function clockText(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
