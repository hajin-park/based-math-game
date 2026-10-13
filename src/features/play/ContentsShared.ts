/**
 * Shared vocabulary of the Contents page (/play) and its panels: chapter
 * numbers and blurbs, the three topic formats, and how a best is printed.
 */
import type { BestEntry } from "@/data";
import {
  TIERS,
  topicsInTier,
  type Format,
  type Tier,
  type Topic,
  type TopicId,
} from "@/game";

export type TopicFormat = "sprint" | "speedrun" | "practice";
export type ChapterTopicId = Exclude<TopicId, "custom">;

/** Chapters of the book: one per tier, numbered in curriculum order. */
export const CHAPTER: Record<Tier, { n: number; name: string; blurb: string }> =
  {
    foundations: {
      n: TIERS.indexOf("foundations") + 1,
      name: "Foundations",
      blurb:
        "Four bits and powers of two: the facts every other topic leans on.",
    },
    core: {
      n: TIERS.indexOf("core") + 1,
      name: "Core",
      blurb: "Whole bytes in binary, hex and octal, separately and shuffled.",
    },
    advanced: {
      n: TIERS.indexOf("advanced") + 1,
      name: "Advanced",
      blurb: "Sixteen bits, signed numbers, and arithmetic on bits.",
    },
    applied: {
      n: TIERS.indexOf("applied") + 1,
      name: "Applied",
      blurb: "Where bytes show up in the wild: colours and text.",
    },
  };

export const TOPIC_FORMATS: { value: TopicFormat; label: string }[] = [
  { value: "sprint", label: "Sprint 60 s" },
  { value: "speedrun", label: "Speedrun 15" },
  { value: "practice", label: "Practice" },
];

/** A best as printed in a folio: "27" (sprint), "18.42 s" (speedrun). */
export function bestText(format: Format, best: BestEntry | undefined): string {
  if (!best) return "—";
  return format === "speedrun" || format === "daily"
    ? `${(best.score / 1000).toFixed(2)} s`
    : String(best.score);
}

/** "2.3": chapter number, then the topic's place in its chapter. */
export function sectionNumber(topic: Topic): string {
  const i = topicsInTier(topic.tier)
    .filter((t) => t.id !== "custom")
    .findIndex((t) => t.id === topic.id);
  return `${CHAPTER[topic.tier].n}.${i + 1}`;
}
