/**
 * "/about" — the front and back matter: a preface (what the book is, who it
 * is for, how classrooms use it, its four chapters, why it exists, errata)
 * and a colophon (type, tools, licence). Counts come from the engine.
 */
import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { FORMAT_IDS, TIERS, topicsInTier } from "@/game";
import { Button } from "@/components/ui/button";
import { BaseOdometer } from "@/components/ui/base-odometer";
import { PageHeader } from "@/components/ui/page-header";
import { FACTS } from "@/features/learn/howto";
import { LESSONS, TIER_LABELS, playHref } from "@/features/learn/lessons";
import { SectionNumber } from "@/features/learn/book";

const REPO = "https://github.com/hajin-park/based-math-game";

function External({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="link inline-flex items-baseline gap-0.5"
    >
      {children}
      <ArrowUpRight aria-hidden className="size-3.5 self-center" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="pt-6 font-serif text-title font-bold">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="max-w-prose text-body text-pretty">{children}</p>;
}

/** The four chapters, as a contents list with dot leaders. */
function Chapters() {
  return (
    <ol className="flex max-w-prose flex-col">
      {TIERS.map((tier, i) => {
        const topics = topicsInTier(tier).filter((t) => t.id !== "custom");
        const first = LESSONS.find((l) => l.tier === tier);
        return (
          <li key={tier} className="border-b border-border py-2.5 first:pt-0">
            <Link
              to={`/learn${first ? `#${first.id}` : ""}`}
              className="group flex items-baseline gap-2 font-serif text-body font-bold"
            >
              <SectionNumber>{i + 1}</SectionNumber>
              <span className="group-hover:text-primary">
                {TIER_LABELS[tier]}
              </span>
              <span aria-hidden className="leader" />
              <span className="shrink-0 font-mono text-[0.8125rem] font-medium text-muted-foreground">
                {topics.length} {topics.length === 1 ? "topic" : "topics"}
              </span>
            </Link>
            <p className="pl-[1.6em] text-body-sm text-muted-foreground text-pretty">
              {topics.map((t) => t.name).join(", ")}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

const SPECIMENS = [
  {
    face: "CMU Serif",
    use: "headings",
    sample: "Exercises in Number Bases",
    className: "font-serif text-title font-bold",
  },
  {
    face: "CMU Concrete",
    use: "running text",
    sample: "Each position is worth the base raised to its place.",
    className: "font-body text-body",
  },
  {
    face: "CMU Sans Serif",
    use: "controls and labels",
    sample: "Play · Skip · Pause",
    className: "font-sans text-body font-bold",
  },
  {
    face: "CMU Typewriter",
    use: "every number",
    sample: "0123456789 ABCDEF",
    className: "font-mono text-body",
  },
];

export default function About() {
  const year = new Date().getFullYear();

  React.useEffect(() => {
    const prev = document.title;
    document.title = "About · Based Math Game";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="overflow-x-clip">
      <div className="container pb-16 pt-10 md:pb-20 md:pt-14">
        <PageHeader title="Preface" size="lg" divider />

        <article
          aria-labelledby="preface-intro"
          className="mt-10 flex max-w-[44rem] flex-col gap-5"
        >
          <p
            id="preface-intro"
            className="max-w-prose font-serif text-body-lg text-pretty"
          >
            Based Math is a book of timed exercises in reading numbers the way
            computers write them: binary, octal, decimal and hexadecimal, and
            the skills built on them — powers of two, two’s complement, bitwise
            operations, binary addition, hex colours and ASCII.
          </p>
          <P>
            It has {FACTS.topics} topics in {TIERS.length} chapters,{" "}
            {FORMAT_IDS.length} formats (sprint, speedrun, survival, a daily
            sheet and untimed practice), a{" "}
            <Link to="/learn" className="link">
              textbook
            </Link>{" "}
            section for every topic, and rooms for playing as a class. It is
            free and open source.
          </P>

          <H2 id="who">Who it is for</H2>
          <P>
            Students in intro programming, computer organisation and digital
            logic courses; instructors who want a five-minute warm-up; anyone
            who reads hex dumps, subnet masks or file permissions.
          </P>

          <H2 id="classroom">In the classroom</H2>
          <dl className="flex max-w-prose flex-col gap-3">
            <div className="text-body text-pretty">
              <dt className="inline font-serif font-bold">
                Share a mode as a link.{" "}
              </dt>
              <dd className="inline">
                Every drill has its own URL, such as{" "}
                <code className="break-all font-mono text-[0.9em]">
                  {playHref("bytes-hex", "sprint")}
                </code>
                . Put it in your slides or LMS and the whole class lands in the
                same exercise.
              </dd>
            </div>
            <div className="text-body text-pretty">
              <dt className="inline font-serif font-bold">
                Live rooms for up to {FACTS.roomSize}.{" "}
              </dt>
              <dd className="inline">
                Open a room, share its code, start when everyone is in. Every
                player gets the same questions in the same order, and scores
                update live on every screen.
              </dd>
            </div>
            <div className="text-body text-pretty">
              <dt className="inline font-serif font-bold">
                No sign-up to play.{" "}
              </dt>
              <dd className="inline">
                Students join as guests. An account is needed only to be ranked
                and to keep stats across devices.
              </dd>
            </div>
          </dl>
          <p className="max-w-prose text-body-sm text-muted-foreground">
            More in{" "}
            <Link to="/how-to-play#classrooms" className="link">
              How to use this book
            </Link>
            .
          </p>

          <H2 id="chapters">The four chapters</H2>
          <P>
            The topics build on each other, from the place value of a single
            nibble to the bytes inside colours and text.
          </P>
          <Chapters />

          <H2 id="why">Why it exists</H2>
          <P>
            The format, a fast, keyboard-only drill against the clock, comes
            from the{" "}
            <External href="https://arithmetic.zetamac.com">zetamac</External>{" "}
            arithmetic game. Based Math applies it to number bases, so that a
            conversion becomes a reflex rather than a calculation.
          </P>

          <H2 id="errata">Errata</H2>
          <P>
            Found a bug, or a wrong answer?{" "}
            <External href={`${REPO}/issues`}>Open an issue</External> with the
            question you saw, the answer you expected and a screenshot if you
            can. Pull requests are welcome too; the question engine is plain
            TypeScript with unit tests.
          </P>

          <div className="pt-6">
            <Button asChild size="lg">
              <Link to="/play">
                Open the contents
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </article>

        {/* ----------------------------------------------------- Colophon */}
        <section
          aria-labelledby="colophon"
          className="mt-16 max-w-[44rem] border-t-[3px] border-double border-foreground/60 pt-8 md:mt-20"
        >
          <h2 id="colophon" className="text-headline font-bold">
            Colophon
          </h2>
          <div className="mt-5 flex flex-col gap-5">
            <P>
              Set in Computer Modern, the typeface Donald Knuth drew for TeX,
              from the Computer Modern Unicode fonts (SIL Open Font License).
              The typewriter zero carries a dot so it never reads as a capital
              O.
            </P>
            <dl className="flex max-w-prose flex-col border-y border-foreground/25">
              {SPECIMENS.map((s) => (
                <div
                  key={s.face}
                  className="flex flex-col gap-0.5 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <dt className="shrink-0 font-sans text-[0.8125rem] text-muted-foreground sm:w-44">
                    {s.face}, {s.use}
                  </dt>
                  <dd className={s.className}>{s.sample}</dd>
                </div>
              ))}
            </dl>
            <P>
              Built with React, TypeScript and Vite and styled with Tailwind
              CSS; Firebase provides sign-in, rooms and leaderboards. No ads, no
              analytics, no tracking cookies.
            </P>
            <P>
              Written and maintained by{" "}
              <External href="https://github.com/hajin-park">
                Hajin Park
              </External>
              . The <External href={REPO}>source</External> is free software
              under the{" "}
              <External href={`${REPO}/blob/main/LICENSE`}>
                GPL-3.0 licence
              </External>
              : you can read, run, change and share it, as long as derived
              versions stay under the same licence.
            </P>
            <figure className="flex max-w-sm flex-col gap-2 pt-2">
              <BaseOdometer
                value={year}
                bits={12}
                size="sm"
                header
                caption={`© ${year}`}
                bases={["bin", "oct", "dec", "hex"]}
              />
              <figcaption className="font-sans text-[0.8125rem] text-muted-foreground">
                The year, in the four bases this book is about.
              </figcaption>
            </figure>
          </div>
        </section>
      </div>
    </div>
  );
}
