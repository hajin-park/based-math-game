import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Github } from "lucide-react";

import { FORMAT_IDS } from "@/game";
import { Button } from "@/components/ui/button";
import { BaseOdometer } from "@/components/ui/base-odometer";
import { GridPaper } from "@/components/ui/grid-paper";
import { PageHeader } from "@/components/ui/page-header";
import { FACTS } from "@/features/learn/howto";

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

const FACT_ROWS: { title: string; body: React.ReactNode }[] = [
  {
    title: "What it is",
    body: (
      <>
        A free web game for converting numbers between binary, octal, decimal
        and hexadecimal, plus the skills built on them: powers of two, two’s
        complement, bitwise operations, binary addition, hex colours and ASCII.{" "}
        {FACTS.topics} topics, {FORMAT_IDS.length} formats (sprint, speedrun,
        survival, a daily challenge and untimed practice), short{" "}
        <Link to="/learn" className="link">
          lessons
        </Link>{" "}
        and multiplayer rooms.
      </>
    ),
  },
  {
    title: "Who it’s for",
    body: "Students in intro programming, computer organisation and digital logic courses; instructors who want a five-minute warm-up; anyone who reads hex dumps, subnet masks or file permissions.",
  },
  {
    title: "Where the idea came from",
    body: (
      <>
        The format, a fast, keyboard-only drill against the clock, comes from
        the <External href="https://arithmetic.zetamac.com">zetamac</External>{" "}
        arithmetic game, applied to number bases.
      </>
    ),
  },
  {
    title: "Who built it",
    body: (
      <>
        Built and maintained by{" "}
        <External href="https://github.com/hajin-park">Hajin Park</External>.
      </>
    ),
  },
  {
    title: "Open source",
    body: (
      <>
        The code is on <External href={REPO}>GitHub</External> under the{" "}
        <External href={`${REPO}/blob/main/LICENSE`}>GPL-3.0 license</External>.
        You can read, run, change and share it, as long as derived versions stay
        under the same license.
      </>
    ),
  },
  {
    title: "Built with",
    body: "React, TypeScript and Vite, styled with Tailwind CSS; Firebase for sign-in, multiplayer rooms and leaderboards.",
  },
];

export default function About() {
  React.useEffect(() => {
    const prev = document.title;
    document.title = "About · Based Math Game";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="overflow-x-clip">
      <section className="relative isolate border-b">
        <GridPaper fade className="opacity-80" />
        <div className="container grid items-center gap-10 py-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <PageHeader
            eyebrow="About"
            size="lg"
            title={
              <>
                A small, open-source <em>drill</em> for number bases.
              </>
            }
            lede="Based Math Game is practice for reading numbers the way computers write them: quick, timed, and free."
          />
          <BaseOdometer
            defaultValue={0x2a}
            size="sm"
            header={false}
            bases={["bin", "hex", "dec"]}
            className="hidden lg:block"
          />
        </div>
      </section>

      <section
        aria-labelledby="about-facts"
        className="container py-section-sm"
      >
        <h2 id="about-facts" className="sr-only">
          About the project
        </h2>
        <dl className="grid max-w-4xl border-t">
          {FACT_ROWS.map((row) => (
            <div
              key={row.title}
              className="grid gap-2 border-b py-6 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10"
            >
              <dt className="text-title-sm font-semibold">{row.title}</dt>
              <dd className="max-w-prose text-body text-muted-foreground text-pretty [&_.link]:text-foreground">
                {row.body}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="contribute-title"
        className="border-y bg-card/60"
      >
        <div className="container grid gap-10 py-section-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Contribute</p>
            <h2
              id="contribute-title"
              className="text-headline font-serif font-medium text-balance [font-variation-settings:'opsz'_60]"
            >
              Found a bug, or a wrong answer?
            </h2>
            <p className="max-w-prose text-body text-muted-foreground text-pretty">
              Open an issue on GitHub with the question you saw, the answer you
              expected and a screenshot if you can. Pull requests are welcome
              too; the question engine is plain TypeScript with unit tests.
            </p>
          </div>
          <ol className="flex flex-col border-t md:self-end">
            {[
              {
                n: "01",
                label: "Report an issue",
                href: `${REPO}/issues`,
              },
              {
                n: "10",
                label: "Read the source",
                href: REPO,
              },
              {
                n: "11",
                label: "Open a pull request",
                href: `${REPO}/pulls`,
              },
            ].map((item) => (
              <li key={item.n} className="border-b">
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-14 items-center gap-4 py-3 text-body transition-colors duration-fast hover:text-primary"
                >
                  <span
                    aria-hidden
                    className="font-mono text-[0.8125rem] text-base-bin"
                  >
                    {item.n}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 text-muted-foreground transition-transform duration-fast group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container flex flex-col items-start gap-5 py-section-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-lede text-body-lg text-muted-foreground">
          No account needed to play. Your first sprint takes a minute.
        </p>
        <div className="flex flex-col gap-3 xs:flex-row">
          <Button asChild size="lg">
            <Link to="/play">
              Start playing
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={REPO} target="_blank" rel="noopener noreferrer">
              <Github aria-hidden />
              View source
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
