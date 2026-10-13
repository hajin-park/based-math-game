/**
 * Chapter numbering for the book furniture in ./book.tsx: the chapter
 * number travels by context, item numbers by CSS counters.
 */
import * as React from "react";

export const ChapterContext = React.createContext<number | null>(null);

export function useChapter(): number | null {
  return React.useContext(ChapterContext);
}

/** Put on the chapter element: restarts every numbered item at 1. */
export const CHAPTER_COUNTERS =
  "[counter-reset:bm-example_bm-figure_bm-table_bm-exercise]";

export type ItemKind = "Example" | "Figure" | "Table" | "Exercise";

// Written out in full so Tailwind sees every class.
const INCREMENT: Record<ItemKind, string> = {
  Example: "[counter-increment:bm-example]",
  Figure: "[counter-increment:bm-figure]",
  Table: "[counter-increment:bm-table]",
  Exercise: "[counter-increment:bm-exercise]",
};

export const COUNTER: Record<ItemKind, string> = {
  Example: "before:content-[counter(bm-example)]",
  Figure: "before:content-[counter(bm-figure)]",
  Table: "before:content-[counter(bm-table)]",
  Exercise: "before:content-[counter(bm-exercise)]",
};

/** The class that makes an element count as one numbered `kind`. */
export function countsAs(kind: ItemKind): string {
  return INCREMENT[kind];
}
