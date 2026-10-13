/**
 * "/how-to-play" — How to use this book: the rules, the keys, what each
 * format does, how answers are accepted, rooms, rankings and classrooms.
 * Every number comes from the engine (features/learn/howto). Section ids are
 * linked from elsewhere (#classrooms, #formats…): keep them.
 */
import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Digits } from "@/components/ui/digits";
import { Kbd } from "@/components/ui/kbd";
import { PageHeader } from "@/components/ui/page-header";
import { PenCross, PenTick } from "@/components/ui/pen-mark";
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
import { BookTable, Figure, TABLE } from "@/features/learn/book";

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
    score: "Correct answers, higher is better",
  },
  {
    id: "speedrun",
    name: "Speedrun",
    ranked: true,
    goal: `First to ${FACTS.speedrunTarget} correct answers; fastest time wins.`,
    rules: [`Each skip adds ${FACTS.speedrunSkipSeconds} s to your time.`],
    score: "Time, lower is better",
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
    score: "Questions cleared, higher is better",
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
    score: "Time, lower is better",
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
  {
    keys: ["Enter"],
    action: "Play from the cover",
    note: "Starts your last drill on this device, or the recommended first one.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Pieces                                                                    */
/* -------------------------------------------------------------------------- */

function Section({
  id,
  title,
  lede,
  children,
}: {
  id: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-0 flex-col gap-6 border-t border-border pb-6 pt-12 first:border-t-0 first:pt-0 lg:-scroll-mt-12"
    >
      <header className="flex max-w-prose flex-col gap-2">
        <h2
          id={`${id}-title`}
          tabIndex={-1}
          className="text-headline font-bold text-balance"
        >
          {title}
        </h2>
        {lede && (
          <p className="font-serif text-body-lg italic text-muted-foreground text-pretty">
            {lede}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}

/** Run-in heads: "No submit button. A correct answer is accepted…" */
function RunInList({
  items,
}: {
  items: { title: React.ReactNode; body: React.ReactNode }[];
}) {
  return (
    <dl className="flex max-w-prose flex-col gap-3">
      {items.map((item, i) => (
        <div key={i} className="text-body text-pretty">
          <dt className="inline font-serif font-bold">{item.title}. </dt>
          <dd className="inline [&_code]:font-mono [&_code]:text-[0.9em]">
            {item.body}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** A numbered procedure, numbers in the spot colour. */
function Steps({
  items,
}: {
  items: { title: React.ReactNode; body: React.ReactNode }[];
}) {
  return (
    <ol className="flex max-w-prose flex-col">
      {items.map((s, i) => (
        <li
          key={i}
          className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2 border-b border-border py-3 first:border-t"
        >
          <span
            aria-hidden
            className="font-serif text-title font-bold leading-[1.6] text-primary"
          >
            {i + 1}
          </span>
          <p className="text-body text-pretty">
            <span className="font-serif font-bold">{s.title}.</span> {s.body}
          </p>
        </li>
      ))}
    </ol>
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
      <div className="container pb-8 pt-10 md:pb-10 md:pt-14">
        <PageHeader
          size="lg"
          divider
          title="How to use this book"
          lede="Each question shows a number in one base and asks for it in another, or asks a small question about bits. The rules, the keys and the formats are below."
          actions={
            <Button asChild size="lg">
              <Link to="/play">
                Open the contents
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          }
        />
      </div>

      <OnThisPage
        items={TOC}
        active={active}
        variant="bar"
        label="Contents"
        className="lg:hidden"
      />

      <div className="container grid gap-10 pb-16 pt-8 md:pb-20 lg:grid-cols-[12.5rem_minmax(0,1fr)] lg:gap-12 lg:pt-10">
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--nav-h)+1.5rem)]">
            <OnThisPage
              items={TOC}
              active={active}
              variant="sidebar"
              label="Contents"
            />
          </div>
        </aside>

        <article className="flex min-w-0 max-w-[48rem] flex-col">
          {/* ------------------------------------------------ Quick start */}
          <Section id="quick-start" title="Quick start">
            <Steps
              items={[
                {
                  title: "Pick a topic and a format",
                  body: (
                    <>
                      {FACTS.topics} topics from nibbles to two’s complement,
                      each as a sprint, a speedrun or untimed practice, are
                      listed on the{" "}
                      <Link to="/play" className="link">
                        contents page
                      </Link>
                      . Or take the daily challenge or survival.
                    </>
                  ),
                },
                {
                  title: "Type the answer",
                  body: "No submit button: a correct answer moves you on as soon as it is complete.",
                },
                {
                  title: "Read your result",
                  body: "Your paper comes back marked, question by question. Signed-in players keep their stats.",
                },
              ]}
            />
            <p className="max-w-prose text-body-sm text-muted-foreground">
              New to a topic? Each one has a section in the{" "}
              <Link to="/learn" className="link">
                textbook
              </Link>
              .
            </p>
          </Section>

          {/* ---------------------------------------------------- Formats */}
          <Section
            id="formats"
            title="Formats"
            lede="A format sets the clock and the score. Pick any topic, then a format."
          >
            <BookTable n="1" caption="The five formats">
              <table className={cn(TABLE.table, "text-left")}>
                <caption className="sr-only">
                  Formats: goal, rules, score and whether they are ranked
                </caption>
                <thead className="hidden sm:table-header-group">
                  <tr className={TABLE.headRow}>
                    <th scope="col" className={cn(TABLE.th, "w-[8.5rem]")}>
                      Format
                    </th>
                    <th scope="col" className={TABLE.th}>
                      Goal and rules
                    </th>
                    <th scope="col" className={cn(TABLE.th, "w-[10rem]")}>
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FORMATS.map((f) => (
                    <tr
                      key={f.id}
                      id={`format-${f.id}`}
                      className="block scroll-mt-16 border-b border-border py-3 last:border-b-0 sm:table-row sm:py-0"
                    >
                      <th
                        scope="row"
                        className="block px-3 align-top sm:table-cell sm:py-3"
                      >
                        <span className="font-serif text-title font-bold">
                          {f.name}
                        </span>
                        <span className="smallcaps ml-2 sm:ml-0 sm:block">
                          {f.ranked ? "Ranked" : "Unranked"}
                        </span>
                      </th>
                      <td className="block px-3 pt-1 align-top sm:table-cell sm:py-3">
                        <p className="text-body text-pretty">{f.goal}</p>
                        <ul className="mt-1 flex flex-col gap-1 text-body-sm text-muted-foreground">
                          {f.rules.map((r, i) => (
                            <li
                              key={i}
                              className="grid grid-cols-[0.875rem_minmax(0,1fr)] gap-x-1.5"
                            >
                              <span aria-hidden>–</span>
                              <span className="text-pretty">{r}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="block px-3 pt-2 align-top font-sans text-[0.875rem] sm:table-cell sm:py-3 sm:pt-3.5">
                        <span className="smallcaps mr-2 sm:hidden">Score</span>
                        {f.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </BookTable>
          </Section>

          {/* -------------------------------------------------- Answering */}
          <Section
            id="answering"
            title="How answers are accepted"
            lede="Answers are compared by value, so formatting never costs you a point."
          >
            <RunInList items={RULES} />
            <BookTable n="2" caption="Accepted and not accepted">
              <table className={cn(TABLE.table, "text-left")}>
                <caption className="sr-only">
                  Examples of accepted and rejected answers
                </caption>
                <thead className="hidden sm:table-header-group">
                  <tr className={TABLE.headRow}>
                    <th scope="col" className={cn(TABLE.th, "w-[11rem]")}>
                      Question asks for
                    </th>
                    <th scope="col" className={TABLE.th}>
                      Accepted
                    </th>
                    <th scope="col" className={cn(TABLE.th, "w-[11rem]")}>
                      Not accepted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ANSWER_EXAMPLES.map((ex) => (
                    <tr
                      key={ex.ask}
                      className="block border-b border-border py-3 last:border-b-0 sm:table-row sm:py-0"
                    >
                      <th
                        scope="row"
                        className="block px-3 align-top font-serif text-body-sm font-bold sm:table-cell sm:py-2.5"
                      >
                        {ex.ask}
                      </th>
                      <td className="block px-3 pt-1.5 align-top sm:table-cell sm:py-2.5">
                        <ul
                          aria-label="Accepted"
                          className="flex flex-wrap gap-x-4 gap-y-1"
                        >
                          {ex.accepted.map((a) => (
                            <li
                              key={a}
                              className="inline-flex items-center gap-0.5 font-mono text-[0.875rem]"
                            >
                              {a}
                              <PenTick animate={false} className="size-4" />
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="block px-3 pt-1.5 align-top sm:table-cell sm:py-2.5">
                        {ex.rejected ? (
                          <span className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-0.5 font-mono text-[0.875rem]">
                              <span className="sr-only">Not accepted: </span>
                              {ex.rejected.input}
                              <PenCross animate={false} className="size-4" />
                            </span>
                            <span className="text-body-sm text-muted-foreground">
                              {ex.rejected.why}
                            </span>
                          </span>
                        ) : (
                          <span
                            aria-hidden
                            className="hidden text-muted-foreground sm:inline"
                          >
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </BookTable>
          </Section>

          {/* ------------------------------------------------------- Keys */}
          <Section
            id="keys"
            title="Keys"
            lede="The whole game works without a mouse."
          >
            <BookTable n="3" caption="Keys during a run">
              <table className={cn(TABLE.table, "text-left")}>
                <caption className="sr-only">Keyboard shortcuts</caption>
                <thead>
                  <tr className={TABLE.headRow}>
                    <th scope="col" className={cn(TABLE.th, "w-[9rem]")}>
                      Key
                    </th>
                    <th scope="col" className={TABLE.th}>
                      Does
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {KEYS.map((k) => (
                    <tr key={k.action} className={TABLE.row}>
                      <td className="px-3 py-2.5 align-top">
                        <span className="flex flex-wrap gap-1.5">
                          {k.keys.map((key) => (
                            <Kbd key={key}>{key}</Kbd>
                          ))}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <span className="block text-body">{k.action}</span>
                        {k.note && (
                          <span className="block text-body-sm text-muted-foreground">
                            {k.note}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </BookTable>
            <p className="max-w-prose text-body-sm text-muted-foreground">
              On a phone or tablet, use the Skip and Pause buttons on screen.
              The keyboard that opens matches the answer: digits for binary,
              octal and decimal; letters too for hex.
            </p>
          </Section>

          {/* ------------------------------------------------ Visual aids */}
          <Section
            id="visual-aids"
            title="Visual aids"
            lede="Two optional aids make long numbers easier to read."
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <Figure
                n="1"
                title="Digit grouping"
                caption="Binary splits into nibbles, so each group is one hex digit."
                bodyClassName="gap-2"
              >
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
              </Figure>
              <Figure
                n="2"
                title="Place-value hints"
                caption="The weight of each digit, under the digit. Not shown for decimal prompts."
              >
                <PlaceValueDigits base="bin" digits="10110110" />
              </Figure>
            </div>
            <p className="max-w-prose text-body-sm text-muted-foreground">
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
            title={<>Rooms for up to {FACTS.roomSize}</>}
            lede="Race friends or a whole lab section on identical questions."
          >
            <Steps
              items={[
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
              ]}
            />
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
          <Section id="leaderboards" title="Accounts and leaderboards">
            <RunInList
              items={[
                {
                  title: "Signed-in accounts only",
                  body: "Guests can play every mode, including multiplayer, but their scores are not ranked and their runs stay in this browser.",
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
            <p className="max-w-prose text-body-sm text-muted-foreground">
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
            title="In the classroom"
            lede="Nothing to install and no student accounts required."
          >
            <RunInList
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
                      the matching section of the textbook, e.g.{" "}
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
