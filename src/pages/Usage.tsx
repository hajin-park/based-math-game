import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Digits } from "@/components/ui/digits";
import { Kbd } from "@/components/ui/kbd";
import { Meter } from "@/components/ui/meter";
import { GridPaper } from "@/components/ui/grid-paper";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { OnThisPage, type TocItem } from "@/features/learn/OnThisPage";
import { useHashScroll, useScrollSpy } from "@/features/learn/useToc";
import {
  ANSWER_EXAMPLES,
  DAILY_RAMP,
  FACTS,
  SURVIVAL_RAMP,
} from "@/features/learn/howto";
import { playHref } from "@/features/learn/lessons";
import { PlaceValueDigits } from "@/features/learn/PlaceValueDigits";

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const TOC: TocItem[] = [
  { id: "quick-start", label: "Quick start" },
  { id: "formats", label: "Formats" },
  { id: "answering", label: "Answering" },
  { id: "keys", label: "Keys" },
  { id: "visual-aids", label: "Visual aids" },
  { id: "multiplayer", label: "Multiplayer" },
  { id: "leaderboards", label: "Leaderboards" },
  { id: "classrooms", label: "Classrooms" },
];
const TOC_IDS = TOC.map((t) => t.id);

interface FormatRow {
  id: string;
  name: string;
  ranked: boolean;
  goal: string;
  rules: React.ReactNode[];
  score: string;
  meter: React.ReactNode;
}

const FORMATS: FormatRow[] = [
  {
    id: "sprint",
    name: "Sprint",
    ranked: true,
    goal: `Most correct answers in ${FACTS.sprintSeconds} seconds.`,
    rules: [
      "Skipping is free, but the clock keeps running.",
      "Every topic has a sprint.",
    ],
    score: "Correct answers (higher is better)",
    meter: (
      <Meter
        variant="timer"
        value={38}
        max={FACTS.sprintSeconds}
        label="Time left"
        valueText="38 seconds left"
        display="0:38"
        showLabel
        size="sm"
      />
    ),
  },
  {
    id: "speedrun",
    name: "Speedrun",
    ranked: true,
    goal: `First to ${FACTS.speedrunTarget} correct answers; fastest time wins.`,
    rules: [`Each skip adds ${FACTS.speedrunSkipSeconds} s to your time.`],
    score: "Time (lower is better)",
    meter: (
      <Meter
        value={9}
        max={FACTS.speedrunTarget}
        label="Correct"
        valueText={`9 of ${FACTS.speedrunTarget}`}
        display={`9 / ${FACTS.speedrunTarget}`}
        showLabel
        size="sm"
      />
    ),
  },
  {
    id: "survival",
    name: "Survival",
    ranked: true,
    goal: `${FACTS.survivalLives} lives and a clock on every question that shrinks as you go.`,
    rules: [
      `The per-question clock starts at ${FACTS.survivalStartSeconds} s and tightens to ${FACTS.survivalFloorSeconds} s; harder questions and longer answers get a little extra.`,
      "A wrong guess costs nothing; a skip or a timeout costs a life.",
      <>
        Topics ramp up every five questions: {SURVIVAL_RAMP.join(" → ")}, then
        an endless mix. From question 10, about one in{" "}
        {FACTS.survivalReviewOneIn} reviews an earlier topic.
      </>,
    ],
    score: "Questions cleared (higher is better)",
    meter: (
      <Meter
        variant="lives"
        value={2}
        max={FACTS.survivalLives}
        label="Lives"
        showLabel
        size="sm"
      />
    ),
  },
  {
    id: "daily",
    name: "Daily",
    ranked: true,
    goal: `The same ${FACTS.dailyCount} questions for everyone, new each day at 00:00 UTC.`,
    rules: [
      <>One rung per topic, in order: {DAILY_RAMP.join(" → ")}.</>,
      "One ranked attempt per day.",
      `Each skip adds ${FACTS.dailySkipSeconds} s to your time.`,
    ],
    score: "Time (lower is better)",
    meter: (
      <Meter
        value={4}
        max={FACTS.dailyCount}
        label="Progress"
        valueText={`4 of ${FACTS.dailyCount}`}
        display={`4 / ${FACTS.dailyCount}`}
        showLabel
        size="sm"
      />
    ),
  },
  {
    id: "practice",
    name: "Practice",
    ranked: false,
    goal: "No clock and no leaderboard. Learn at your own pace.",
    rules: [
      "Hints are available, and skipping reveals the answer with worked steps.",
      "Every topic has a practice mode, and so do custom drills.",
    ],
    score: "Not ranked",
    meter: (
      <p className="flex h-full items-end font-mono text-[0.75rem] text-muted-foreground">
        untimed
      </p>
    ),
  },
];

const RULES: { title: string; body: React.ReactNode }[] = [
  {
    title: "No submit button",
    body: "A correct answer is accepted the moment you type its last digit, and the next question appears.",
  },
  {
    title: "Wrong is free",
    body: "A wrong answer is not marked or penalised. Backspace and fix it, or skip.",
  },
  {
    title: "Prefixes optional",
    body: (
      <>
        The answer’s own prefix is allowed but never needed: <code>0x</code> for
        hex, <code>0b</code> for binary, <code>0o</code> for octal.
      </>
    ),
  },
  {
    title: "Case and separators ignored",
    body: "Hex is case-insensitive. Spaces and underscores between digits are ignored.",
  },
  {
    title: "Leading zeros welcome",
    body: "Type 0000 1010 or 1010, whichever you think in, up to the question’s width.",
  },
  {
    title: "Exact where it matters",
    body: "Negative answers need the minus sign, and ASCII characters are case-sensitive.",
  },
];

const KEYS: { keys: string[]; action: string; note?: string }[] = [
  {
    keys: ["0–9", "A–F"],
    action: "Type the answer",
    note: "Only characters valid for the answer are accepted.",
  },
  { keys: ["Tab"], action: "Skip the question" },
  { keys: ["Esc"], action: "Pause, or leave the game" },
  { keys: ["Enter"], action: "Start a sprint from the home page" },
];

/* -------------------------------------------------------------------------- */
/*  Pieces                                                                    */
/* -------------------------------------------------------------------------- */

function Section({
  id,
  eyebrow,
  title,
  lede,
  children,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-12 flex-col gap-6 border-t py-12 first:border-t-0 first:pt-0 md:py-14 lg:-scroll-mt-10"
    >
      <header className="flex flex-col gap-2.5">
        <p className="eyebrow">{eyebrow}</p>
        <h2
          id={`${id}-title`}
          tabIndex={-1}
          className="text-headline font-serif font-medium text-balance [font-variation-settings:'opsz'_60]"
        >
          {title}
        </h2>
        {lede && (
          <p className="max-w-prose text-body-lg text-muted-foreground text-pretty">
            {lede}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}

function HairlineList({
  items,
  className,
}: {
  items: { title: React.ReactNode; body: React.ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={cn("grid border-t sm:grid-cols-2 sm:gap-x-10", className)}>
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-1 border-b py-4">
          <dt className="text-title-sm font-semibold">{item.title}</dt>
          <dd className="text-body-sm text-muted-foreground text-pretty [&_code]:font-mono [&_code]:text-foreground">
            {item.body}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function Usage() {
  const active = useScrollSpy(TOC_IDS);
  useHashScroll();

  React.useEffect(() => {
    const prev = document.title;
    document.title = "How to play · Based Math Game";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="overflow-x-clip">
      <section className="relative isolate border-b">
        <GridPaper fade className="opacity-80" />
        <div className="container py-10 md:py-14">
          <PageHeader
            eyebrow="How to play"
            size="lg"
            title={
              <>
                Read the number. <em>Type</em> the answer.
              </>
            }
            lede="Each question shows a number in one base and asks for it in another, or asks a small question about bits. Everything else, from formats to rankings, is on this page."
            actions={
              <Button asChild size="lg">
                <Link to="/play">
                  Start playing
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            }
          />
        </div>
      </section>

      <OnThisPage
        items={TOC}
        active={active}
        variant="bar"
        className="lg:hidden"
      />

      <div className="container grid gap-10 py-12 md:py-16 lg:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)] xl:gap-16">
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--nav-h)+2rem)]">
            <OnThisPage items={TOC} active={active} variant="sidebar" />
          </div>
        </aside>

        <article className="flex min-w-0 max-w-3xl flex-col">
          {/* ------------------------------------------------ Quick start */}
          <Section id="quick-start" eyebrow="Quick start" title="Three steps">
            <ol className="grid border-t md:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Pick a topic and a format",
                  body: (
                    <>
                      {FACTS.topics} topics from nibbles to two’s complement,
                      each as a sprint, a speedrun or untimed practice. Or take
                      the daily challenge or survival.
                    </>
                  ),
                },
                {
                  n: "10",
                  title: "Type the answer",
                  body: "No submit button: a correct answer moves you on as soon as it is complete.",
                },
                {
                  n: "11",
                  title: "Read your result",
                  body: "See your score and accuracy, then go again. Signed-in players keep their stats.",
                },
              ].map((s, i) => (
                <li
                  key={s.n}
                  className={cn(
                    "flex flex-col gap-2 border-b py-6",
                    i > 0 && "md:border-l md:pl-6",
                    i < 2 && "md:pr-6",
                  )}
                >
                  <span
                    aria-hidden
                    className="font-mono text-[1.75rem] font-light leading-none tracking-[-0.04em] text-base-bin"
                  >
                    {s.n}
                  </span>
                  <h3 className="text-title-sm font-semibold">{s.title}</h3>
                  <p className="text-body-sm text-muted-foreground text-pretty">
                    {s.body}
                  </p>
                </li>
              ))}
            </ol>
            <p className="text-body-sm text-muted-foreground">
              New to a topic? Each one has a short lesson on the{" "}
              <Link to="/learn" className="link">
                Learn page
              </Link>
              .
            </p>
          </Section>

          {/* ---------------------------------------------------- Formats */}
          <Section
            id="formats"
            eyebrow="Formats"
            title="Five ways to play"
            lede="A format sets the clock and the score. Pick any topic, then a format."
          >
            <ul className="flex flex-col gap-3">
              {FORMATS.map((f) => (
                <li
                  key={f.id}
                  id={`format-${f.id}`}
                  className="grid gap-4 rounded-lg border bg-card p-4 shadow-xs sm:grid-cols-[minmax(0,1fr)_12rem] sm:gap-6 sm:p-5"
                >
                  <div className="flex min-w-0 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-title font-semibold">{f.name}</h3>
                      {f.ranked ? (
                        <Badge variant="secondary">Ranked</Badge>
                      ) : (
                        <Badge variant="outline">Unranked</Badge>
                      )}
                    </div>
                    <p className="text-body text-foreground text-pretty">
                      {f.goal}
                    </p>
                    <ul className="flex flex-col gap-1 text-body-sm text-muted-foreground">
                      {f.rules.map((r, i) => (
                        <li
                          key={i}
                          className="grid grid-cols-[0.75rem_minmax(0,1fr)] gap-x-2.5"
                        >
                          <span
                            aria-hidden
                            className="mt-[0.75em] h-px w-3 bg-border-strong"
                          />
                          <span className="text-pretty">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col justify-between gap-3 border-t pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                    <p className="text-[0.75rem] text-muted-foreground">
                      <span className="block font-medium text-foreground">
                        Score
                      </span>
                      {f.score}
                    </p>
                    <div aria-hidden>{f.meter}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          {/* -------------------------------------------------- Answering */}
          <Section
            id="answering"
            eyebrow="Answering"
            title="Type it however you think it"
            lede="Answers are compared by value, so formatting never costs you a point."
          >
            <HairlineList items={RULES} />
            <div className="overflow-hidden rounded-lg border">
              <div
                aria-hidden
                className="hidden grid-cols-[11rem_minmax(0,1fr)_11rem] gap-4 border-b border-border-strong bg-sunken px-4 py-2.5 text-[0.75rem] text-muted-foreground sm:grid"
              >
                <span>Question asks for</span>
                <span>Accepted</span>
                <span>Not accepted</span>
              </div>
              <ul aria-label="Examples of accepted answers">
                {ANSWER_EXAMPLES.map((ex) => (
                  <li
                    key={ex.ask}
                    className="grid gap-2 border-b px-4 py-3 last:border-b-0 sm:grid-cols-[11rem_minmax(0,1fr)_11rem] sm:gap-4"
                  >
                    <span className="text-body-sm font-medium text-foreground sm:font-normal">
                      {ex.ask}
                    </span>
                    <ul
                      aria-label="Accepted"
                      className="flex flex-wrap content-start gap-1.5"
                    >
                      {ex.accepted.map((a) => (
                        <li key={a}>
                          <code className="inline-flex items-center gap-1 rounded-sm border border-success/25 bg-success/[0.06] px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground">
                            <Check
                              aria-hidden
                              className="size-3 text-success"
                            />
                            {a}
                          </code>
                        </li>
                      ))}
                    </ul>
                    {ex.rejected ? (
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 sm:flex-col sm:items-start">
                        <code className="inline-flex items-center gap-1 rounded-sm border border-destructive/25 bg-destructive/[0.06] px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground">
                          <X aria-hidden className="size-3 text-destructive" />
                          <span className="sr-only">Not accepted: </span>
                          {ex.rejected.input}
                        </code>
                        <span className="text-[0.8125rem] text-muted-foreground">
                          {ex.rejected.why}
                        </span>
                      </span>
                    ) : (
                      <span
                        aria-hidden
                        className="hidden text-muted-foreground sm:block"
                      >
                        —
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          {/* ------------------------------------------------------- Keys */}
          <Section
            id="keys"
            eyebrow="Keys"
            title="Hands stay on the keyboard"
            lede="The whole game works without a mouse."
          >
            <dl className="grid border-t">
              {KEYS.map((k) => (
                <div
                  key={k.action}
                  className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-b py-3.5 sm:grid-cols-[9rem_minmax(0,1fr)]"
                >
                  <dt className="flex flex-wrap gap-1.5">
                    {k.keys.map((key) => (
                      <Kbd key={key}>{key}</Kbd>
                    ))}
                  </dt>
                  <dd className="flex flex-col gap-0.5">
                    <span className="text-body">{k.action}</span>
                    {k.note && (
                      <span className="text-body-sm text-muted-foreground">
                        {k.note}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-body-sm text-muted-foreground">
              On a phone or tablet, use the Skip and Pause buttons on screen.
              The keyboard that opens matches the answer: digits for binary,
              octal and decimal; letters too for hex.
            </p>
          </Section>

          {/* ------------------------------------------------ Visual aids */}
          <Section
            id="visual-aids"
            eyebrow="Visual aids"
            title="See the structure of a number"
            lede="Two optional aids make long numbers easier to read."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <figure className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-xs sm:p-5">
                <figcaption className="flex flex-col gap-1">
                  <span className="text-title-sm font-semibold">
                    Digit grouping
                  </span>
                  <span className="text-body-sm text-muted-foreground">
                    Binary splits into nibbles, so each group is one hex digit.
                  </span>
                </figcaption>
                <div className="mt-auto flex flex-col gap-2 rounded-md bg-sunken px-3 py-3">
                  <Digits
                    base="bin"
                    value="1011011000101111"
                    size="sm"
                    condensed
                    aria-label="Without grouping: 1011011000101111"
                  />
                  <Digits
                    base="bin"
                    value="1011011000101111"
                    group
                    size="sm"
                    condensed
                    aria-label="With grouping: 1011 0110 0010 1111"
                  />
                </div>
              </figure>
              <figure className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-xs sm:p-5">
                <figcaption className="flex flex-col gap-1">
                  <span className="text-title-sm font-semibold">
                    Place-value hints
                  </span>
                  <span className="text-body-sm text-muted-foreground">
                    The weight of each digit, under the digit. Not shown for
                    decimal prompts.
                  </span>
                </figcaption>
                <div className="mt-auto rounded-md bg-sunken px-3 pb-2 pt-3">
                  <PlaceValueDigits base="bin" digits="10110110" />
                </div>
              </figure>
            </div>
            <p className="text-body-sm text-muted-foreground">
              Turn them on in{" "}
              <Link to="/profile/game-settings" className="link">
                Profile → Game settings
              </Link>{" "}
              (needs an account). They change how numbers look, not how answers
              are checked or scored.
            </p>
          </Section>

          {/* ----------------------------------------------- Multiplayer */}
          <Section
            id="multiplayer"
            eyebrow="Multiplayer"
            title={<>Rooms for up to {FACTS.roomSize}</>}
            lede="Race friends or a whole lab section on identical questions."
          >
            <ol className="grid border-t">
              {[
                {
                  title: "The host creates a room",
                  body: "and picks the mode: any topic and format, or a custom drill.",
                },
                {
                  title: "Players join with the code or the link",
                  body: "Every room has an 8-character code. Guests can join without an account.",
                },
                {
                  title: "Everyone gets the same questions",
                  body: "in the same order, and scores update live on every screen.",
                },
              ].map((s, i) => (
                <li
                  key={s.title}
                  className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-b py-4"
                >
                  <span
                    aria-hidden
                    className="font-mono text-[0.8125rem] text-muted-foreground"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-body text-pretty">
                    <span className="font-semibold">{s.title}</span>{" "}
                    <span className="text-muted-foreground">{s.body}</span>
                  </p>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link to="/multiplayer/create">Create a room</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/multiplayer/join">Join with a code</Link>
              </Button>
            </div>
          </Section>

          {/* ---------------------------------------------- Leaderboards */}
          <Section
            id="leaderboards"
            eyebrow="Leaderboards"
            title="Who gets ranked"
          >
            <HairlineList
              items={[
                {
                  title: "Signed-in accounts only",
                  body: "Guests can play every mode, including multiplayer, but their scores are not ranked or saved.",
                },
                {
                  title: `${FACTS.rankedModes} ranked modes, plus the daily`,
                  body: `Sprint and speedrun for each of the ${FACTS.topics} topics, survival, and each day’s daily challenge.`,
                },
                {
                  title: "Practice and custom are never ranked",
                  body: "Use them to learn; nothing you do there affects a leaderboard.",
                },
                {
                  title: "Finished runs only",
                  body: "A run counts when it reaches its natural end. Leaving early does not submit a score.",
                },
              ]}
            />
            <p className="text-body-sm text-muted-foreground">
              <Link to="/signup" className="link">
                Create an account
              </Link>{" "}
              to appear on the{" "}
              <Link to="/leaderboard" className="link">
                leaderboard
              </Link>{" "}
              and keep your stats.
            </p>
          </Section>

          {/* ------------------------------------------------ Classrooms */}
          <Section
            id="classrooms"
            eyebrow="For teaching"
            title="Classroom tips"
            lede="Nothing to install and no student accounts required."
          >
            <HairlineList
              items={[
                {
                  title: "Share a mode as a link",
                  body: (
                    <>
                      Every mode has its own URL, e.g.{" "}
                      <code className="break-all">
                        {playHref("bytes-hex", "sprint")}
                      </code>
                      . Post it in your LMS and everyone lands in the same
                      drill.
                    </>
                  ),
                },
                {
                  title: "Run a live race with a room code",
                  body: `Project the room code, start when everyone is in. Up to ${FACTS.roomSize} players per room; open several rooms for a larger class.`,
                },
                {
                  title: "Use the daily as a warm-up",
                  body: `${FACTS.dailyCount} questions, identical for every student that day, across every topic.`,
                },
                {
                  title: "Set practice as homework",
                  body: (
                    <>
                      Practice is untimed and shows worked steps. Pair it with
                      the matching lesson, e.g.{" "}
                      <Link to="/learn#twos-complement" className="link">
                        two’s complement
                      </Link>
                      .
                    </>
                  ),
                },
              ]}
            />
          </Section>
        </article>
      </div>
    </div>
  );
}
