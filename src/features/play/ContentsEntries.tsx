/**
 * The printed entries of the Contents page: the front matter (continue,
 * today's sheet, survival), one chapter per tier with a section row per
 * topic, and the appendix for custom drills. Rows are ruled with hairlines;
 * each row's main control stretches over the whole row, and the format links
 * sit above it.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { PenTick } from "@/components/ui/pen-mark";
import type { BestEntry } from "@/data";
import { dailyNumber, getMode, modeId, type Tier, type Topic } from "@/game";
import { ModeRank } from "@/features/play/DailyStatus";
import { TopicExample } from "@/features/play/TopicExample";
import { runPath } from "@/features/play/links";
import { useDailyAttempts } from "@/features/play/useDailyAttempts";
import type { StartTarget } from "@/features/play/useStartTarget";
import { useUtcDateKey } from "@/hooks/useUtcDateKey";
import { cn } from "@/lib/utils";
import {
  CHAPTER,
  TOPIC_FORMATS,
  bestText,
  sectionNumber,
  type TopicFormat,
} from "./ContentsShared";

/** Stretches a row's main control over the whole row (the row is `relative`). */
const STRETCH =
  "static after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring";

/** Secondary links sit above the stretched control. */
const ABOVE = "relative z-10";

const ROW =
  "relative border-b border-border transition-colors duration-fast hover:bg-accent/45";

/** Text, a dot leader and a folio, aligned on the last line of the text. */
function LeaderLine({
  children,
  folio,
  className,
}: {
  children: ReactNode;
  folio: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 gap-2 [align-items:last_baseline]",
        className,
      )}
    >
      <div className="min-w-0">{children}</div>
      <span aria-hidden className="leader [align-self:last_baseline]" />
      <div className="shrink-0">{folio}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Front matter                                                              */
/* -------------------------------------------------------------------------- */

export function FrontMatter({
  start,
  startBest,
  survivalBest,
  onSurvival,
}: {
  start: StartTarget;
  startBest: BestEntry | undefined;
  survivalBest: BestEntry | undefined;
  onSurvival: () => void;
}) {
  const startMode = getMode(start.modeId);
  const startFolio =
    startMode && startMode.ranked && startBest
      ? bestText(startMode.format, startBest)
      : null;
  return (
    <section aria-label="Start here">
      <ul className="flex flex-col">
        <li className={ROW}>
          <FrontRow
            label={start.resume ? "Continue" : "Start here"}
            title={start.title}
            detail={start.format}
            folio={
              startFolio ? (
                <Folio label="Your best">{startFolio}</Folio>
              ) : (
                <EmptyFolio />
              )
            }
            action={
              <Button
                asChild
                className={cn(STRETCH, "min-w-[7.5rem] justify-between")}
              >
                <Link
                  to={start.path}
                  aria-label={`${start.resume ? "Continue" : "Start"}: ${start.title}, ${start.format}`}
                >
                  Play
                  <Kbd
                    size="sm"
                    tone="inverse"
                    className="hidden pointer-fine:inline-flex"
                    aria-hidden
                  >
                    Enter ↵
                  </Kbd>
                </Link>
              </Button>
            }
          />
        </li>
        <li className={ROW}>
          <DailyEntry />
        </li>
        <li className={ROW}>
          <FrontRow
            label="Survival"
            title={
              <button
                type="button"
                onClick={onSurvival}
                aria-haspopup="dialog"
                className={cn(STRETCH, "text-left")}
              >
                Three lives, shrinking clock
              </button>
            }
            detail="nibbles up to bitwise"
            folio={
              survivalBest ? (
                <Folio label="Your best">
                  {survivalBest.score}
                  <span className="text-muted-foreground"> cleared</span>
                </Folio>
              ) : (
                <EmptyFolio />
              )
            }
            action={
              <Link
                to="/play/survival"
                className={cn(ABOVE, "link font-sans text-label font-bold")}
              >
                Play survival
              </Link>
            }
          />
        </li>
      </ul>
    </section>
  );
}

function FrontRow({
  label,
  title,
  detail,
  folio,
  action,
}: {
  label: ReactNode;
  title: ReactNode;
  detail: ReactNode;
  folio: ReactNode;
  action: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-x-6 gap-y-2 py-3.5 sm:grid-cols-[minmax(0,1fr)_9.5rem] sm:py-4">
      <LeaderLine folio={folio}>
        <p className="text-body">
          <em className="block font-serif italic text-muted-foreground sm:inline">
            {label}
          </em>{" "}
          <span
            aria-hidden
            className="mx-1 hidden text-muted-foreground sm:inline"
          >
            —
          </span>{" "}
          <span className="font-serif font-bold">{title}</span>{" "}
          <span className="block font-sans text-[0.875rem] text-muted-foreground sm:inline sm:whitespace-nowrap">
            <span aria-hidden className="hidden sm:inline">
              ·{" "}
            </span>
            {detail}
          </span>
        </p>
      </LeaderLine>
      <div className="flex justify-start sm:justify-end">{action}</div>
    </div>
  );
}

function DailyEntry() {
  const date = useUtcDateKey();
  const dailyId = `daily:${date}`;
  const { first, loading } = useDailyAttempts(dailyId);
  return (
    <FrontRow
      label="Today's sheet"
      title={
        <Link to="/daily" className={STRETCH}>
          No. {dailyNumber(date)}
        </Link>
      }
      detail="ten problems, one ranked attempt"
      folio={
        loading ? null : first ? (
          <span className="flex items-baseline gap-2 font-mono text-mono-sm tabular-nums">
            <PenTick animate={false} className="size-4 self-center" />
            <span className="sr-only">Done in</span>
            {(first.score / 1000).toFixed(2)} s
            <span className="font-sans text-[0.8125rem] text-muted-foreground">
              <ModeRank modeId={dailyId} />
            </span>
          </span>
        ) : (
          <span className="font-sans text-[0.8125rem] text-muted-foreground">
            not done yet
          </span>
        )
      }
      action={
        <span
          aria-hidden
          className="font-sans text-label font-bold text-foreground"
        >
          {first ? "See results" : "Open sheet"}
        </span>
      }
    />
  );
}

function Folio({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="font-mono text-mono-sm tabular-nums">
      <span className="sr-only">{label}: </span>
      {children}
    </span>
  );
}

function EmptyFolio({ className }: { className?: string }) {
  return (
    <span
      className={cn("font-mono text-mono-sm text-muted-foreground", className)}
    >
      <span aria-hidden>–</span>
      <span className="sr-only">not played yet</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chapters                                                                  */
/* -------------------------------------------------------------------------- */

/** Width of the two folio columns (sprint, speedrun). */
const FOLIO_SPRINT = "w-12 sm:w-14";
const FOLIO_SPEED = "w-[4.5rem] sm:w-24";

function ChapterHead({
  id,
  number,
  title,
  blurb,
  columns = true,
}: {
  id: string;
  number: ReactNode;
  title: ReactNode;
  blurb: ReactNode;
  columns?: boolean;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-foreground/70 pb-2.5">
      <div className="flex min-w-0 flex-col gap-1">
        <h2
          id={id}
          className="font-serif text-headline font-bold text-foreground"
        >
          <span className="mr-[0.5em] text-primary">{number}</span>
          {title}
        </h2>
        <p className="font-serif text-body-sm italic text-muted-foreground">
          {blurb}
        </p>
      </div>
      {columns && (
        <div
          aria-hidden
          className="smallcaps flex shrink-0 text-[0.75rem] tracking-[0.04em] sm:text-eyebrow"
        >
          <span className={cn(FOLIO_SPRINT, "text-right")}>Sprint</span>
          <span className={cn(FOLIO_SPEED, "text-right")}>Speedrun</span>
        </div>
      )}
    </div>
  );
}

export function Chapter({
  tier,
  topics,
  best,
  onOpen,
}: {
  tier: Tier;
  topics: Topic[];
  best: (id: string) => BestEntry | undefined;
  onOpen: (topic: Topic, format: TopicFormat) => void;
}) {
  const chapter = CHAPTER[tier];
  const id = `tier-${tier}`;
  return (
    <section aria-labelledby={id} className="flex flex-col">
      <ChapterHead
        id={id}
        number={chapter.n}
        title={chapter.name}
        blurb={chapter.blurb}
      />
      <ol className="flex flex-col">
        {topics.map((t) => (
          <SectionRow
            key={t.id}
            topic={t}
            sprintBest={best(modeId(t.id, "sprint"))}
            speedBest={best(modeId(t.id, "speedrun"))}
            onOpen={(f) => onOpen(t, f)}
          />
        ))}
      </ol>
    </section>
  );
}

function SectionRow({
  topic,
  sprintBest,
  speedBest,
  onOpen,
}: {
  topic: Topic;
  sprintBest: BestEntry | undefined;
  speedBest: BestEntry | undefined;
  onOpen: (format: TopicFormat) => void;
}) {
  return (
    <li
      className={cn(
        ROW,
        "grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-1 py-3.5 sm:grid-cols-[3.25rem_minmax(0,1fr)] sm:py-4",
      )}
    >
      <span className="font-mono text-mono-md text-primary">
        {sectionNumber(topic)}
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <LeaderLine
          folio={
            <span className="flex font-mono text-mono-sm tabular-nums">
              <span className={cn(FOLIO_SPRINT, "text-right")}>
                {sprintBest ? (
                  <Folio label="Best sprint">
                    {bestText("sprint", sprintBest)}
                  </Folio>
                ) : (
                  <EmptyFolio />
                )}
              </span>
              <span className={cn(FOLIO_SPEED, "text-right")}>
                {speedBest ? (
                  <Folio label="Best speedrun">
                    {bestText("speedrun", speedBest)}
                  </Folio>
                ) : (
                  <EmptyFolio />
                )}
              </span>
            </span>
          }
        >
          <div className="flex items-baseline gap-x-6">
            <h3 className="font-serif text-title-sm font-bold lg:w-[15rem] lg:shrink-0">
              <button
                type="button"
                onClick={() => onOpen("sprint")}
                aria-haspopup="dialog"
                className={cn(STRETCH, "text-left")}
              >
                {topic.name}
              </button>
            </h3>
            <TopicExample
              topicId={topic.id}
              className="hidden text-mono-md md:inline-flex"
            />
          </div>
        </LeaderLine>
        <div className="flex flex-col gap-x-6 gap-y-1.5 md:flex-row md:items-baseline md:justify-between">
          <p className="text-body-sm text-muted-foreground md:line-clamp-1">
            {topic.summary}
          </p>
          <TopicExample
            topicId={topic.id}
            className="self-start text-mono-md md:hidden"
          />
          <p
            className={cn(
              ABOVE,
              "flex shrink-0 flex-wrap items-baseline gap-x-1 font-sans text-label",
            )}
          >
            {TOPIC_FORMATS.map((f, i) => (
              <span key={f.value} className="inline-flex items-baseline">
                {i > 0 && (
                  <span aria-hidden className="mx-1.5 text-muted-foreground">
                    ·
                  </span>
                )}
                <Link
                  to={runPath(modeId(topic.id, f.value))}
                  aria-label={`${topic.name}: ${f.label}`}
                  className="link relative py-1 font-medium pointer-coarse:after:absolute pointer-coarse:after:-inset-x-1 pointer-coarse:after:-inset-y-2.5 pointer-coarse:after:content-['']"
                >
                  {f.label}
                </Link>
              </span>
            ))}
          </p>
        </div>
      </div>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Appendix                                                                  */
/* -------------------------------------------------------------------------- */

export function Appendix({ onBuild }: { onBuild: () => void }) {
  return (
    <section aria-labelledby="appendix" className="flex flex-col">
      <ChapterHead
        id="appendix"
        number="Appendix"
        title="Build your own exercise"
        blurb="For lessons and targeted practice. Never ranked."
        columns={false}
      />
      <div
        className={cn(
          ROW,
          "grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline",
        )}
      >
        <p className="text-body-sm text-muted-foreground text-pretty">
          <span className="mr-2 font-serif text-title-sm font-bold text-foreground">
            <button
              type="button"
              onClick={onBuild}
              aria-haspopup="dialog"
              className={cn(STRETCH, "text-left")}
            >
              Custom drill
            </button>
          </span>
          Choose exact conversions and value ranges, mix in other question
          types, then share the drill as a link.
        </p>
        <span
          aria-hidden
          className="font-sans text-label font-bold text-foreground"
        >
          Build a drill →
        </span>
      </div>
    </section>
  );
}
