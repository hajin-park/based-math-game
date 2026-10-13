/**
 * Book furniture for the reading surfaces (Learn, How to use this book,
 * the preface and the appendices): numbered examples, figures, tables and
 * exercises, margin notes and the "Practise this" line.
 *
 * Numbering: a <Chapter> provides its number through context and resets CSS
 * counters, and every Example / Figure / Table / Exercise inside increments
 * its own counter, so labels read "Example 2.3" without any render-time
 * bookkeeping (which StrictMode's double render would break). Outside a
 * chapter, pass `n` to print a fixed label instead.
 */
import * as React from "react";

import { cn } from "@/lib/utils";
import {
  COUNTER,
  ChapterContext,
  countsAs,
  useChapter,
  type ItemKind,
} from "./bookContext";

export { CHAPTER_COUNTERS } from "./bookContext";

/* -------------------------------------------------------------------------- */
/*  Chapter context + counters                                                */
/* -------------------------------------------------------------------------- */

export function ChapterProvider({
  number,
  children,
}: {
  number: number;
  children: React.ReactNode;
}) {
  return (
    <ChapterContext.Provider value={number}>{children}</ChapterContext.Provider>
  );
}

/**
 * "Example 2.3" in the book's label voice: spot-blue small caps. `n`
 * overrides the automatic number (for use outside a chapter).
 */
export function ItemLabel({
  kind,
  n,
  className,
}: {
  kind: ItemKind;
  n?: React.ReactNode;
  className?: string;
}) {
  const chapter = useChapter();
  return (
    <span
      className={cn(
        "smallcaps whitespace-nowrap text-[0.9375rem] text-primary",
        className,
      )}
    >
      {kind}
      {n !== undefined ? (
        <> {n}</>
      ) : chapter !== null ? (
        <>
          {" "}
          {chapter}.<span className={COUNTER[kind]} />
        </>
      ) : null}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Example / Note / Rule                                                     */
/* -------------------------------------------------------------------------- */

/** A worked example in a tint box: "Example 1.2 · title", then the work. */
export function Example({
  title,
  n,
  children,
  className,
}: {
  title?: React.ReactNode;
  n?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-prose rounded-sm bg-tint px-4 py-3.5 sm:px-5 sm:py-4",
        countsAs("Example"),
        className,
      )}
    >
      <p className="mb-2 flex flex-wrap items-baseline gap-x-2">
        <ItemLabel kind="Example" n={n} />
        {title && (
          <span className="font-serif text-body-sm italic text-foreground">
            {title}
          </span>
        )}
      </p>
      {children}
    </div>
  );
}

/** Lines of typewriter work inside an Example (one entry per line). */
export function WorkLines({ lines }: { lines: React.ReactNode[] }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex w-max min-w-full flex-col gap-0.5 whitespace-pre font-mono text-[0.8125rem] leading-relaxed text-foreground sm:text-[0.875rem]">
        {lines.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/**
 * A margin note. In the margin column on xl screens (floated out of the
 * text column, Tufte-style, so running text never wraps around it); a tint
 * "Note" box in the flow below that.
 */
export function Note({
  children,
  label = "Note",
  className,
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "max-w-prose rounded-sm bg-tint px-4 py-3 text-body-sm text-pretty sm:px-5",
        "xl:float-right xl:clear-right xl:-mr-[15.5rem] xl:mb-4 xl:w-[13rem] xl:bg-transparent xl:p-0 xl:text-[0.875rem] xl:leading-[1.5] xl:text-muted-foreground",
        className,
      )}
    >
      <span className="smallcaps mb-1 block text-[0.9375rem] text-primary">
        {label}
      </span>
      {children}
    </aside>
  );
}

/** A rule worth memorising, set like a theorem: run-in head, italic body. */
export function Rule({
  children,
  title = "Rule",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="max-w-prose border-y border-foreground/25 py-3">
      <p className="text-body text-pretty">
        <span className="mr-2 font-serif font-bold not-italic">{title}.</span>
        <span className="italic">{children}</span>
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Figures and tables                                                        */
/* -------------------------------------------------------------------------- */

/**
 * A figure: the exhibit in a ruled box on a fresh sheet, caption underneath
 * ("Figure 2.1  Flip the bits of a byte. Click a bit…").
 */
export function Figure({
  title,
  caption,
  n,
  children,
  className,
  bodyClassName,
}: {
  title: React.ReactNode;
  caption?: React.ReactNode;
  n?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <figure className={cn("flex flex-col", countsAs("Figure"), className)}>
      <div
        className={cn(
          "flex flex-col gap-5 rounded-sm border border-foreground/25 bg-card p-4 sm:p-5",
          bodyClassName,
        )}
      >
        {children}
      </div>
      <figcaption className="mt-2.5 max-w-prose font-sans text-[0.875rem] leading-[1.5] text-muted-foreground text-pretty">
        <ItemLabel kind="Figure" n={n} className="mr-2" />
        <span className="font-bold text-foreground">{title}.</span>
        {caption && <> {caption}</>}
      </figcaption>
    </figure>
  );
}

/** A numbered table: caption above, double rule under the head. */
export function BookTable({
  caption,
  n,
  children,
  className,
}: {
  caption: React.ReactNode;
  n?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", countsAs("Table"), className)}>
      <p className="mb-2 font-sans text-[0.875rem] text-muted-foreground">
        <ItemLabel kind="Table" n={n} className="mr-2" />
        <span className="font-bold text-foreground">{caption}</span>
      </p>
      {children}
    </div>
  );
}

/** Classes for a book table's head row and cells. */
export const TABLE = {
  table: "w-full border-collapse border-y border-foreground/60",
  headRow: "border-b-[3px] border-double border-foreground/60",
  th: "px-3 py-2 text-left font-sans text-[0.8125rem] font-bold text-foreground",
  row: "border-b border-border last:border-b-0",
  td: "px-3 py-1.5",
} as const;

/* -------------------------------------------------------------------------- */
/*  Section heading with a spot-blue number                                   */
/* -------------------------------------------------------------------------- */

export function SectionNumber({ children }: { children: React.ReactNode }) {
  return <span className="mr-[0.5em] text-primary">{children}</span>;
}
