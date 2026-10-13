/**
 * Exercise-page copy for the run screen and the marked results: the
 * one-line instruction a textbook prints above each problem ("Convert to
 * binary."), derived from the engine's question without changing it.
 */
import type { Question } from "@/game";
import { baseWord } from "./describe";

/** "Convert to binary.", "Find the exponent n.", … */
export function exerciseInstruction(q: Question): string {
  switch (q.kind) {
    case "convert":
      return q.answerBase
        ? `Convert to ${baseWord(q.answerBase)}.`
        : `${q.instruction}.`;
    case "power":
      if (q.id.startsWith("power:value")) return "Evaluate the power of two.";
      if (q.id.startsWith("power:exponent")) return "Find the exponent n.";
      return "Write the value in decimal.";
    case "twos":
      return q.answerFormat === "binary"
        ? `Write in ${q.answerBits ?? 8}-bit two’s complement.`
        : `Read as ${q.instruction.split(" →")[0].replace("'", "’")}.`;
    case "add":
      return `Add the ${q.answerBits ?? 8}-bit numbers.`;
    case "bitwise":
      return `${q.instruction}.`;
    case "color":
      return "Give the channel in decimal.";
    case "ascii":
      return q.answerFormat === "char"
        ? "Write the ASCII character."
        : "Write the ASCII code in hexadecimal.";
    default:
      return `${q.instruction.replace(" → ", " to ")}.`;
  }
}

/** The answer blank's label: "Answer in binary", "Answer: one character". */
export function answerLabel(word: string): string {
  return word === "a single character"
    ? "Answer with one character"
    : `Answer in ${word}`;
}

/**
 * Pen marks (`pen-mark.tsx`) draw with the `pen-draw` keyframes, which
 * Tailwind only emits when an `animate-pen-draw` utility is in use; without
 * them a mark stays undrawn (invisible). Put this class on an element that
 * wraps marks: the marks' own inline animation still wins, so it is a no-op
 * apart from making sure the keyframes ship.
 */
export const PEN_DRAW_KEYFRAMES = "[&_path]:animate-pen-draw";

/**
 * PenCircle and PenUnderline stretch their SVG to the content
 * (preserveAspectRatio="none") and draw with pathLength=1 under
 * `vector-effect: non-scaling-stroke`. Chrome measures the dash in screen
 * space there, so on content wider than the mark's own aspect ratio the
 * stroke stops part-way (a half-drawn circle around "7.75"). Scaling the
 * stroke with the SVG keeps pathLength exact; pass a thinner `strokeWidth`
 * to PenCircle to compensate.
 */
export const PEN_STROKE_SCALES = "[&_path]:[vector-effect:none]";
