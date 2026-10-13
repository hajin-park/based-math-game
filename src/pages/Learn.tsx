/**
 * "/learn" — the textbook. Four chapters (the tiers) of numbered sections
 * (one per topic, in teaching order), each with running text, worked
 * examples, interactive figures and a "Try it" exercise, closing with links
 * to drill the topic. Section ids are the topics' learnAnchors: deep links
 * such as /learn#twos-complement (and legacy /tutorials#…) must keep working.
 */
import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { TIERS, getTopic, type Tier, type TopicId } from "@/game";
import { Button } from "@/components/ui/button";
import { Digits } from "@/components/ui/digits";
import { BaseTag } from "@/components/ui/base-tag";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { LESSONS, TIER_LABELS, playHref } from "@/features/learn/lessons";
import { FACTS } from "@/features/learn/howto";
import { OnThisPage, type TocItem } from "@/features/learn/OnThisPage";
import { useHashScroll, useScrollSpy } from "@/features/learn/useToc";
import { TryOne } from "@/features/learn/TryOne";
import { PlaceValueDigits } from "@/features/learn/PlaceValueDigits";
import {
  BookTable,
  CHAPTER_COUNTERS,
  ChapterProvider,
  Example,
  Figure,
  Note,
  Rule,
  SectionNumber,
  TABLE,
  WorkLines,
} from "@/features/learn/book";
import {
  AdditionWidget,
  AsciiWidget,
  BitwiseWidget,
  ByteWidget,
  ChmodWidget,
  ColorWidget,
  ConverterWidget,
  NibbleWidget,
  PowersWidget,
  TwosWidget,
  WordWidget,
} from "@/features/learn/widgets";

/* -------------------------------------------------------------------------- */
/*  Outline: chapters = tiers, sections = lessons                             */
/* -------------------------------------------------------------------------- */

const MINUS = "−";

const CHAPTER_NO = new Map<Tier, number>(TIERS.map((t, i) => [t, i + 1]));

/** "2.3" for each lesson id: chapter (tier) . position within the tier. */
const SECTION_NO = new Map<string, string>();
const FIRST_IN_CHAPTER = new Set<string>();
for (const tier of TIERS) {
  LESSONS.filter((l) => l.tier === tier).forEach((l, i) => {
    SECTION_NO.set(l.id, `${CHAPTER_NO.get(tier)}.${i + 1}`);
    if (i === 0) FIRST_IN_CHAPTER.add(l.id);
  });
}

const TOC: TocItem[] = LESSONS.map((l) => ({
  id: l.id,
  label: l.label,
  number: SECTION_NO.get(l.id),
  group: TIER_LABELS[l.tier],
  groupNumber: String(CHAPTER_NO.get(l.tier)),
}));
const TOC_IDS = TOC.map((t) => t.id);

/* -------------------------------------------------------------------------- */
/*  Small typographic helpers                                                 */
/* -------------------------------------------------------------------------- */

/** Inline number in a base, sized to the surrounding text. */
function N({
  b,
  v,
  group,
  prefix,
}: {
  b: "bin" | "oct" | "dec" | "hex";
  v: string | number;
  group?: boolean | number;
  prefix?: boolean;
}) {
  return (
    <Digits
      base={b}
      value={v}
      group={group ?? (b === "bin" ? 4 : false)}
      prefix={prefix}
      size="inherit"
      className="text-[0.9em]"
    />
  );
}

/** Running text at the book's measure. */
function P({ children }: { children: React.ReactNode }) {
  return <p className="max-w-prose text-body text-pretty">{children}</p>;
}

/** A sub-heading inside a section. */
function H4({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="max-w-prose pt-2 font-serif text-title font-bold">
      {children}
    </h4>
  );
}

/** A worked example: "Example 1.2", then typewriter lines. */
function Work({ lines, title }: { lines: React.ReactNode[]; title?: string }) {
  return (
    <Example title={title}>
      <WorkLines lines={lines} />
    </Example>
  );
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex max-w-prose flex-col gap-2 text-body">
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-2">
          <span aria-hidden className="text-muted-foreground">
            –
          </span>
          <span className="text-pretty">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** The line that closes each section: where to drill what was just read. */
function PractiseThis({ topicId }: { topicId: TopicId }) {
  const topic = getTopic(topicId);
  const link =
    "inline-flex items-center font-sans font-bold pointer-coarse:min-h-11";
  return (
    <div className="flex max-w-prose flex-col gap-1 pt-2">
      <p className="flex items-baseline gap-3">
        <span className="smallcaps shrink-0 text-foreground">
          Practise this
        </span>
        <span aria-hidden className="leader" />
        <span className="flex shrink-0 items-baseline gap-2">
          <Link to={playHref(topicId, "sprint")} className={cn("link", link)}>
            Sprint<span className="sr-only">: {topic.name}</span>
          </Link>
          <span aria-hidden className="text-muted-foreground">
            ·
          </span>
          <Link to={playHref(topicId, "practice")} className={cn("link", link)}>
            Practice<span className="sr-only">: {topic.name}</span>
          </Link>
        </span>
      </p>
      <p className="font-sans text-[0.8125rem] text-muted-foreground">
        Sprint: {FACTS.sprintSeconds} seconds, ranked. Practice: untimed, with
        worked steps.
      </p>
    </div>
  );
}

function Chapter({
  tier,
  children,
}: {
  tier: Tier;
  children: React.ReactNode;
}) {
  const n = CHAPTER_NO.get(tier) ?? 0;
  const sections = LESSONS.filter((l) => l.tier === tier);
  const first = SECTION_NO.get(sections[0]?.id ?? "");
  const last = SECTION_NO.get(sections[sections.length - 1]?.id ?? "");
  const headingId = `chapter-${tier}`;
  return (
    <ChapterProvider number={n}>
      <section
        aria-labelledby={headingId}
        className={cn(CHAPTER_COUNTERS, "pt-16 first:pt-0 md:pt-20")}
      >
        <header className="rule-double flex items-end justify-between gap-4 pb-3">
          <h2 id={headingId} className="text-display-lg font-bold">
            <SectionNumber>{n}</SectionNumber>
            {TIER_LABELS[tier]}
          </h2>
          <p className="pb-1.5 font-mono text-[0.8125rem] text-muted-foreground">
            <span className="sr-only">Sections </span>
            {first === last ? first : `${first}–${last}`}
          </p>
        </header>
        {children}
      </section>
    </ChapterProvider>
  );
}

function Lesson({
  id,
  title,
  lede,
  children,
}: {
  id: string;
  title: React.ReactNode;
  lede: React.ReactNode;
  children: React.ReactNode;
}) {
  const lesson = LESSONS.find((l) => l.id === id);
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        // Deep links stop the heading just under the nav (lg) or under the
        // sticky contents bar (below lg); see useScrollSpy for the spy line.
        "flow-root scroll-mt-0 pb-6 pt-12 lg:-scroll-mt-12",
        !FIRST_IN_CHAPTER.has(id) && "border-t border-border",
      )}
    >
      <header className="max-w-prose">
        <h3
          id={headingId}
          tabIndex={-1}
          className="text-headline font-bold text-balance"
        >
          <SectionNumber>{SECTION_NO.get(id)}</SectionNumber>
          {title}
        </h3>
        <p className="mt-3 font-serif text-body-lg italic text-muted-foreground text-pretty">
          {lede}
        </p>
      </header>
      <div className="mt-6 [&>*+*]:mt-6">
        {children}
        {lesson?.topicId && lesson.topicId !== "custom" && (
          <PractiseThis topicId={lesson.topicId} />
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reference tables and the place-value figure                               */
/* -------------------------------------------------------------------------- */

function PowersTable() {
  const pow = (n: number) => (2 ** n).toLocaleString("en-US");
  return (
    <BookTable
      caption={
        <>
          Powers of two, 2<sup>0</sup> to 2<sup>16</sup>
        </>
      }
      className="max-w-prose"
    >
      <table className={cn(TABLE.table, "text-[0.875rem]")}>
        <caption className="sr-only">
          Powers of two from 2 to the 0 up to 2 to the 16
        </caption>
        <thead>
          <tr className={TABLE.headRow}>
            <th scope="col" className={TABLE.th}>
              n
            </th>
            <th scope="col" className={cn(TABLE.th, "text-right")}>
              2<sup>n</sup>
            </th>
            <th
              scope="col"
              className={cn(TABLE.th, "hidden border-l pl-5 xs:table-cell")}
            >
              n
            </th>
            <th
              scope="col"
              className={cn(TABLE.th, "hidden text-right xs:table-cell")}
            >
              2<sup>n</sup>
            </th>
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums">
          {Array.from({ length: 9 }, (_, row) => {
            const left = row;
            const right = row + 9;
            return (
              <tr key={row} className={TABLE.row}>
                <td className={cn(TABLE.td, "text-muted-foreground")}>
                  {left}
                </td>
                <td className={cn(TABLE.td, "text-right text-base-dec")}>
                  {pow(left)}
                </td>
                {right <= 16 ? (
                  <>
                    <td
                      className={cn(
                        TABLE.td,
                        "hidden border-l pl-5 text-muted-foreground xs:table-cell",
                      )}
                    >
                      {right}
                    </td>
                    <td
                      className={cn(
                        TABLE.td,
                        "hidden text-right text-base-dec xs:table-cell",
                      )}
                    >
                      {pow(right)}
                    </td>
                  </>
                ) : (
                  <td colSpan={2} className="hidden border-l xs:table-cell" />
                )}
              </tr>
            );
          })}
          {Array.from({ length: 8 }, (_, i) => i + 9).map((n) => (
            <tr key={`m${n}`} className={cn(TABLE.row, "xs:hidden")}>
              <td className={cn(TABLE.td, "text-muted-foreground")}>{n}</td>
              <td className={cn(TABLE.td, "text-right text-base-dec")}>
                {pow(n)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </BookTable>
  );
}

function TruthTable() {
  const rows = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ];
  return (
    <BookTable caption="AND, OR and XOR, bit by bit" className="w-fit">
      <table
        className={cn(
          TABLE.table,
          "w-auto text-center font-mono text-[0.875rem] tabular-nums",
        )}
      >
        <caption className="sr-only">Truth table for AND, OR and XOR</caption>
        <thead>
          <tr className={TABLE.headRow}>
            <th scope="col" className={cn(TABLE.th, "px-4 text-center")}>
              a
            </th>
            <th scope="col" className={cn(TABLE.th, "px-4 text-center")}>
              b
            </th>
            <th
              scope="col"
              className={cn(TABLE.th, "border-l px-4 text-center")}
            >
              AND
            </th>
            <th scope="col" className={cn(TABLE.th, "px-4 text-center")}>
              OR
            </th>
            <th scope="col" className={cn(TABLE.th, "px-4 text-center")}>
              XOR
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, b]) => (
            <tr key={`${a}${b}`} className={TABLE.row}>
              <td className="px-4 py-1.5 text-base-bin">{a}</td>
              <td className="px-4 py-1.5 text-base-bin">{b}</td>
              <td className="border-l px-4 py-1.5 text-base-bin">{a & b}</td>
              <td className="px-4 py-1.5 text-base-bin">{a | b}</td>
              <td className="px-4 py-1.5 text-base-bin">{a ^ b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </BookTable>
  );
}

function PlaceValueFigure() {
  const examples = [
    {
      b: "dec" as const,
      digits: ["2", "3", "7"],
      sum: "2×100 + 3×10 + 7×1 = 237",
    },
    {
      b: "bin" as const,
      digits: ["1", "0", "1", "1"],
      sum: "1×8 + 0×4 + 1×2 + 1×1 = 11",
    },
    {
      b: "hex" as const,
      digits: ["2", "F"],
      sum: "2×16 + 15×1 = 47",
    },
  ];
  return (
    <Figure
      title="One idea, three bases"
      caption="The small numbers under each digit are its place value."
      bodyClassName="gap-0 py-1 sm:py-1"
    >
      <ul className="divide-y divide-border">
        {examples.map((e) => (
          <li
            key={e.b}
            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-6"
          >
            <div className="flex items-center gap-4 sm:w-52">
              <BaseTag base={e.b} size="sm" showRadix className="w-12" />
              <PlaceValueDigits base={e.b} digits={e.digits.join("")} />
            </div>
            <p className="font-mono text-[0.8125rem] text-muted-foreground">
              {e.sum}
            </p>
          </li>
        ))}
      </ul>
    </Figure>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function Learn() {
  const active = useScrollSpy(TOC_IDS);
  useHashScroll();

  React.useEffect(() => {
    const prev = document.title;
    document.title = "Learn · Based Math Game";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="overflow-x-clip">
      <div className="container pb-8 pt-10 md:pb-10 md:pt-14">
        <PageHeader
          folio={`${TIERS.length} chapters · ${LESSONS.length} sections`}
          size="lg"
          divider
          title={
            <>
              From place value to <em>two’s complement</em>
            </>
          }
          lede="A short course in how computers write numbers, for intro CS and digital logic. Each section has the idea, a figure to play with, worked examples, an exercise generated by the game, and a drill."
        />
      </div>

      <OnThisPage
        items={TOC}
        active={active}
        variant="bar"
        className="lg:hidden"
      />

      <div className="container grid gap-10 pb-16 pt-8 md:pb-20 lg:grid-cols-[12.5rem_minmax(0,44rem)] lg:gap-12 lg:pt-10 xl:grid-cols-[12.5rem_minmax(0,40rem)_13rem] xl:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--nav-h)+1.5rem)] max-h-[calc(100dvh-var(--nav-h)-3rem)] overflow-y-auto pb-6">
            <OnThisPage items={TOC} active={active} variant="sidebar" />
          </div>
        </aside>

        <article className="flex min-w-0 flex-col">
          <Chapter tier="foundations">
            {/* ------------------------------------------------ Place value */}
            <Lesson
              id="place-value"
              title="Place value: one idea, every base"
              lede="Every positional number system works the same way. Learn this once and binary, octal and hex are just different alphabets."
            >
              <P>
                A numeral is a row of digits, and each position is worth the
                base raised to that position, counting from 0 on the right.
                Decimal <N b="dec" v="237" /> means 2 hundreds, 3 tens and 7
                ones. Binary uses powers of 2 instead of powers of 10;
                hexadecimal uses powers of 16.
              </P>
              <PlaceValueFigure />
              <Rule>
                In base <i>b</i>, the digit in position <i>k</i> is worth digit
                × <i>b</i>
                <sup>k</sup>, and the digits run from 0 to <i>b</i> {MINUS} 1.
                Hex runs out of decimal digits after 9, so it uses A–F for
                10–15.
              </Rule>
              <Note>
                Notation: code marks the base with a prefix (
                <N b="bin" v="1011" prefix />, <N b="oct" v="17" prefix />,{" "}
                <N b="hex" v="2F" prefix />
                ); textbooks use a subscript (1011<sub>2</sub>). In this game
                every number carries a coloured base tag instead.
              </Note>
            </Lesson>

            {/* ---------------------------------------------------- Nibbles */}
            <Lesson
              id="nibbles"
              title="Nibbles: four bits, one hex digit"
              lede="Recognising the sixteen 4-bit patterns on sight is the most useful single skill in this game."
            >
              <P>
                A nibble is 4 bits with place values 8, 4, 2 and 1. It holds 2
                <sup>4</sup> = 16 patterns, <N b="bin" v="0000" /> to{" "}
                <N b="bin" v="1111" />, which are the values 0 to 15: exactly
                the sixteen digits of hexadecimal. Every longer binary-to-hex
                conversion is this one, repeated.
              </P>
              <Work
                lines={[
                  "1011  →  8 + 2 + 1      = 11 = B",
                  "13    →  13 = 8 + 4 + 1  → 1101 = D",
                ]}
              />
              <Bullets
                items={[
                  <>
                    <N b="bin" v="1010" /> is A (10) and <N b="bin" v="1111" />{" "}
                    is F (15); A–F are exactly the nibbles that start with 1 and
                    are above 1001.
                  </>,
                  <>A nibble ending in 1 is odd; ending in 0 is even.</>,
                  <>Adding 1000 adds 8: 0011 is 3, so 1011 is 3 + 8 = 11.</>,
                ]}
              />
              <NibbleWidget />
              <TryOne topicId="nibbles" />
            </Lesson>

            {/* ---------------------------------------------- Powers of two */}
            <Lesson
              id="powers-of-two"
              title="Powers of two"
              lede="Binary place values are powers of two, and so are the sizes of almost everything in computing."
            >
              <P>
                Each binary place is worth twice the one to its right: 1, 2, 4,
                8, 16 … With <i>n</i> bits you can write 2<sup>n</sup> different
                patterns, so the largest unsigned <i>n</i>-bit value is 2
                <sup>n</sup> {MINUS} 1, the pattern of all ones. A byte holds 2
                <sup>8</sup> = 256 values, 0 to 255.
              </P>
              <Rule>
                Learn 2<sup>0</sup> to 2<sup>10</sup> = 1024 by doubling, then
                split larger exponents around 2<sup>10</sup>: exponents add when
                powers multiply.
              </Rule>
              <Work
                lines={[
                  "2^16 = 2^6 × 2^10 = 64 × 1024 = 65,536",
                  "2^n = 4096  →  4096 = 4 × 1024 = 2^2 × 2^10  →  n = 12",
                  "largest 12-bit value = 2^12 − 1 = 4095",
                ]}
              />
              <Note>
                Memory sizes use the same anchors: 1 KiB = 2<sup>10</sup> bytes,
                1 MiB = 2<sup>20</sup>, 1 GiB = 2<sup>30</sup>, so a 32-bit
                address reaches 2<sup>32</sup> bytes = 4 GiB.
              </Note>
              <PowersWidget />
              <PowersTable />
              <TryOne topicId="powers" />
            </Lesson>
          </Chapter>
          <Chapter tier="core">
            {/* ------------------------------------------------ Binary bytes */}
            <Lesson
              id="binary"
              title="Binary: reading and writing bytes"
              lede="A byte is 8 bits, weights 128 down to 1, values 0 to 255."
            >
              <H4>Binary to decimal: add the weights of the 1 bits</H4>
              <Work
                lines={[
                  "weight  128 64 32 16  8  4  2  1",
                  "bit       1  1  0  0  0  0  0  0",
                  "          128 + 64 = 192",
                ]}
              />
              <P>
                That byte is the last part of the subnet mask 255.255.255.192:
                three bytes of all ones and <N b="bin" v="11000000" />, 26 one
                bits in total, written /26.
              </P>
              <H4>
                Decimal to binary: subtract the largest power of two that fits
              </H4>
              <Work
                lines={[
                  "200 − 128 = 72     bit 7",
                  " 72 −  64 =  8     bit 6",
                  "  8 −   8 =  0     bit 3",
                  "→ 1100 1000",
                ]}
              />
              <P>
                Or divide by 2 repeatedly and read the remainders from the
                bottom up: 13 ÷ 2 = 6 r 1, 6 ÷ 2 = 3 r 0, 3 ÷ 2 = 1 r 1, 1 ÷ 2 =
                0 r 1 → <N b="bin" v="1101" />. Both methods give the same bits;
                subtraction is usually faster in your head for bytes.
              </P>
              <ByteWidget />
              <TryOne topicId="bytes-bin" />
            </Lesson>

            {/* ------------------------------------------------ Hexadecimal */}
            <Lesson
              id="hexadecimal"
              title="Hexadecimal: four bits per digit"
              lede="Hex is how programmers write bytes, because the conversion to binary needs no arithmetic at all."
            >
              <P>
                Hex is base 16: digits 0–9, then A–F for 10–15. Since 16 = 2
                <sup>4</sup>, each hex digit stands for exactly one nibble, and
                a byte is always exactly two hex digits. Decimal has no such
                shortcut because 10 is not a power of two.
              </P>
              <H4>Binary ↔ hex: group in fours from the right</H4>
              <Work
                lines={[
                  "1100 1000",
                  "   C    8   →  0xC8",
                  "0x3F  →  0011 1111   (pad each digit to 4 bits)",
                ]}
              />
              <H4>Hex ↔ decimal: place values 16 and 1</H4>
              <Work
                lines={[
                  "0xC8 = 12×16 + 8 = 192 + 8 = 200",
                  "200 ÷ 16 = 12 remainder 8  →  C8",
                ]}
              />
              <Note>
                Memory dumps, MAC addresses, UTF-8 bytes and CSS colours all use
                pairs of hex digits for exactly this reason.
              </Note>
              <ConverterWidget />
              <TryOne topicId="bytes-hex" />
            </Lesson>

            {/* ------------------------------------------------------ Octal */}
            <Lesson
              id="octal"
              title="Octal: three bits per digit"
              lede="Base 8 groups bits in threes. You will meet it in Unix file permissions and old escape sequences."
            >
              <P>
                Octal uses digits 0–7. Since 8 = 2<sup>3</sup>, each octal digit
                is exactly three bits: group binary in threes from the right,
                padding the left group with zeros. Place values are 64, 8 and 1.
              </P>
              <Work
                lines={[
                  "1 1110 1101  →  111 101 101  →  7 5 5",
                  "755₈ = 7×64 + 5×8 + 5 = 448 + 40 + 5 = 493",
                ]}
              />
              <H4>Where you will see it: chmod</H4>
              <P>
                Unix permissions are three 3-bit fields (owner, group, others),
                each made of read (4), write (2) and execute (1). So 7 = rwx, 6
                = rw-, 5 = r-x and 4 = r--.{" "}
                <span className="font-mono text-[0.9em]">chmod 755</span> is
                rwxr-xr-x and{" "}
                <span className="font-mono text-[0.9em]">chmod 644</span> is
                rw-r--r--.
              </P>
              <ChmodWidget />
              <Note>
                Octal also survives in C string escapes (
                <span className="font-mono">\033</span> is 27, the ESC
                character) and in Python’s <span className="font-mono">0o</span>{" "}
                prefix. It does not line up with bytes (8 is not a multiple of
                3), which is why hex won everywhere else.
              </Note>
              <TryOne topicId="octal" />
            </Lesson>

            {/* ------------------------------------------------------ Mixed */}
            <Lesson
              id="mixed"
              title="Mixed bases"
              lede="Real work does not announce which base comes next."
            >
              <P>
                Mixed drills shuffle byte-sized binary, octal, decimal and hex
                questions, drawn equally from the Binary Bytes, Hex Bytes and
                Octal topics. Read the base tag before you type: the digits{" "}
                <span className="font-mono">10</span> mean two, eight, ten or
                sixteen depending on the base.
              </P>
              <Rule>
                Hex ↔ octal goes through binary: <N b="hex" v="FF" prefix /> =
                1111 1111 = 11 111 111 = <N b="oct" v="377" />.
              </Rule>
              <TryOne topicId="mixed" />
            </Lesson>
          </Chapter>
          <Chapter tier="advanced">
            {/* ------------------------------------------------------ Words */}
            <Lesson
              id="words"
              title="16-bit words"
              lede="Four hex digits, two bytes, 0 to 65,535: port numbers, UTF-16 code units, C shorts."
            >
              <P>
                The nibble trick scales unchanged:{" "}
                <N b="bin" v="0001111110010000" /> is{" "}
                <N b="hex" v="1F90" prefix />, one hex digit per group. For
                decimal, split the word into its two bytes, because the high
                byte is worth 256 times its value.
              </P>
              <Work
                lines={[
                  "0x1F90  →  high 0x1F = 31, low 0x90 = 144",
                  "31 × 256 + 144 = 7936 + 144 = 8080",
                  "check: 1×4096 + 15×256 + 9×16 + 0×1 = 8080",
                ]}
              />
              <P>
                Going the other way, divide by 256 to get the bytes (8080 ÷ 256
                = 31 remainder 144), then write each byte as two hex digits.
              </P>
              <WordWidget />
              <TryOne topicId="words" />
            </Lesson>

            {/* -------------------------------------------- Two's complement */}
            <Lesson
              id="twos-complement"
              title="Two’s complement: negative numbers"
              lede="Every modern CPU stores signed integers this way. One rule explains why 0xFF can mean −1."
            >
              <Rule>
                In an <i>n</i>-bit two’s complement number the most significant
                bit has weight {MINUS}2<sup>n−1</sup> instead of +2
                <sup>n−1</sup>. Every other bit keeps its usual weight. For 8
                bits: {MINUS}128, 64, 32, 16, 8, 4, 2, 1, so the range is{" "}
                {MINUS}128 to 127.
              </Rule>
              <Work
                title="Read a pattern"
                lines={[
                  "1111 1110 = −128 + 64 + 32 + 16 + 8 + 4 + 2 = −2",
                  "1011 0110 = −128 + 32 + 16 + 4 + 2 = −74",
                  "0100 1010 = 64 + 8 + 2 = 74   (sign bit 0)",
                ]}
              />
              <H4>Negate: invert every bit, then add one</H4>
              <Work
                lines={[
                  "  74 = 0100 1010",
                  "invert 1011 0101",
                  " + 1 = 1011 0110  = −74",
                ]}
              />
              <P>
                The same two steps work in reverse: invert{" "}
                <N b="bin" v="10110110" /> to get <N b="bin" v="01001001" />,
                add 1 to get <N b="bin" v="01001010" /> = 74, so the pattern
                means {MINUS}74.
              </P>
              <Bullets
                items={[
                  <>
                    Sign bit 1 means negative; non-negative values look like
                    plain binary.
                  </>,
                  <>
                    All ones, <N b="hex" v="FF" prefix />, is {MINUS}1.{" "}
                    <N b="bin" v="10000000" /> is {MINUS}128, the one value with
                    no positive partner: negating it gives itself.
                  </>,
                  <>
                    One adder handles both signs: 5 + ({MINUS}3) is 0000 0101 +
                    1111 1101 = 1 0000 0010; drop the carry out and the result
                    is 0000 0010 = 2.
                  </>,
                  <>
                    Overflow is when two operands of the same sign give a result
                    of the other sign: 127 + 1 = 1000 0000 = {MINUS}128.
                  </>,
                  <>
                    To widen a value, copy the sign bit (sign extension):{" "}
                    {MINUS}2 is 1111 1110 in 8 bits and 1111 1111 1111 1110 in
                    16.
                  </>,
                ]}
              />
              <TwosWidget />
              <TryOne topicId="twos" />
            </Lesson>

            {/* ---------------------------------------------------- Bitwise */}
            <Lesson
              id="bitwise"
              title="Bitwise operations"
              lede="AND masks, OR sets, XOR toggles, shifts move. This is how software talks to hardware flags."
            >
              <P>
                Bitwise operators act on each column independently, with no
                carries between columns. That also means you can work one hex
                digit (one nibble) at a time: <N b="hex" v="CA" prefix /> AND{" "}
                <N b="hex" v="0F" prefix /> = <N b="hex" v="0A" prefix />.
              </P>
              <TruthTable />
              <H4>Masks</H4>
              <Bullets
                items={[
                  <>
                    <span className="font-mono">x AND mask</span> keeps the bits
                    the mask selects and clears the rest: 1100 1010 AND 0000
                    1111 = 0000 1010.
                  </>,
                  <>
                    <span className="font-mono">x OR mask</span> sets bits: x OR
                    1000 0000 turns bit 7 on.
                  </>,
                  <>
                    <span className="font-mono">x XOR mask</span> flips bits:
                    ‘A’ (0x41) XOR 0x20 = ‘a’ (0x61).
                  </>,
                  <>
                    Test a flag: bit <i>k</i> of x is set when x AND (1 &lt;&lt;{" "}
                    <i>k</i>) is not zero.
                  </>,
                ]}
              />
              <H4>Shifts</H4>
              <P>
                <span className="font-mono">x &lt;&lt; k</span> moves every bit
                k places left: zeros enter on the right, bits leaving the
                register are lost, and the value is multiplied by 2<sup>k</sup>{" "}
                (mod 256 for a byte).{" "}
                <span className="font-mono">x &gt;&gt; k</span> moves bits
                right, dividing by 2<sup>k</sup> and rounding down. The game
                uses logical shifts, which always fill with zeros.
              </P>
              <Work
                lines={[
                  "0001 0110 << 2 = 0101 1000     22 × 4  = 88",
                  "1011 0101 >> 3 = 0001 0110     181 ÷ 8 = 22 (rounded down)",
                ]}
              />
              <Note>
                Networking uses AND every day: an IP address AND its subnet mask
                is the network address. 192.168.1.130 AND 255.255.255.192: the
                last byte is 1000 0010 AND 1100 0000 = 1000 0000, so the network
                is 192.168.1.128.
              </Note>
              <BitwiseWidget />
              <TryOne topicId="bitwise" />
            </Lesson>

            {/* -------------------------------------------- Binary addition */}
            <Lesson
              id="binary-addition"
              title="Binary addition"
              lede="Exactly like decimal addition, except you carry at 2 instead of 10."
            >
              <Rule>
                0 + 0 = 0 · 0 + 1 = 1 · 1 + 1 = 10 (write 0, carry 1) · 1 + 1 +
                1 = 11 (write 1, carry 1)
              </Rule>
              <Work
                lines={[
                  "carry  1111 11   ",
                  "       0101 1011     91",
                  "     + 0011 0110   + 54",
                  "       ---------    ---",
                  "       1001 0001    145",
                ]}
              />
              <P>
                Check in decimal whenever you can. A carry out of the top column
                means the unsigned sum does not fit (unsigned overflow); the
                game picks operands so every sum fits in 8 bits.
              </P>
              <Note>
                In hardware each column is a full adder: sum = a XOR b XOR
                carry-in, and carry-out is 1 when at least two of the three
                inputs are 1. Chain eight of them and you have an 8-bit
                ripple-carry adder. Subtraction is addition of the two’s
                complement: a {MINUS} b = a + (NOT b) + 1.
              </Note>
              <AdditionWidget />
              <TryOne topicId="binary-add" />
            </Lesson>
          </Chapter>
          <Chapter tier="applied">
            {/* ---------------------------------------------- Colors & ASCII */}
            <Lesson
              id="colors-ascii"
              title="Colors and ASCII"
              lede="Two places where bytes show up in everyday code: CSS colours and text."
            >
              <H4>Hex colours are three bytes</H4>
              <P>
                <span className="font-mono">#RRGGBB</span> is red, green and
                blue, each one byte from 00 (off) to FF (255, full).{" "}
                <N b="hex" v="3FA0C2" /> has red 0x3F = 63, green 0xA0 = 160 and
                blue 0xC2 = 194. Equal channels make greys (#808080 is mid
                grey), and the short form #RGB doubles each digit: #F80 =
                #FF8800.
              </P>
              <ColorWidget />
              <H4>ASCII is a table with a few anchors</H4>
              <P>
                ASCII gives each character a 7-bit code, written as two hex
                digits: the high digit is the row of the table, the low digit
                the column. Three anchors give you the rest:
              </P>
              <Bullets
                items={[
                  <>
                    Digits start at ‘0’ = 0x30, so digit <i>n</i> is 0x30 +{" "}
                    <i>n</i> (‘7’ = 0x37).
                  </>,
                  <>
                    Capitals start at ‘A’ = 0x41 and end at ‘Z’ = 0x5A; ‘K’ is
                    10 after ‘A’, so 0x4B.
                  </>,
                  <>
                    Lowercase is capitals + 0x20: ‘a’ = 0x61 to ‘z’ = 0x7A.
                    Upper and lower case differ only in bit 5.
                  </>,
                  <>
                    Space is 0x20. Codes 0x00–0x1F and 0x7F are control
                    characters (newline is 0x0A).
                  </>,
                ]}
              />
              <AsciiWidget />
              <TryOne topicId="applied" />
            </Lesson>

            {/* ----------------------------------------------------- Custom */}
            <Lesson
              id="custom"
              title="Custom drills"
              lede="Match a lecture, or hammer a weak spot."
            >
              <P>
                The custom topic lets you choose exactly which conversions to
                drill (any pair of bases, with value ranges up to 32 bits) and
                mix in powers, two’s complement, bitwise, addition, colour or
                ASCII questions. Play it untimed, against a clock, or to a
                target count. Custom games are never ranked.
              </P>
              <Note>
                Teaching a section? Open a multiplayer room so the whole class
                gets the same questions, and see{" "}
                <Link to="/how-to-play#classrooms" className="link">
                  classroom tips
                </Link>
                .
              </Note>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link to="/play">
                    Build a custom drill
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/multiplayer/create">Open a room</Link>
                </Button>
              </div>
            </Lesson>
          </Chapter>

          {/* ----------------------------------------------------- Review */}
          <section
            aria-labelledby="learn-review"
            className="mt-12 flex flex-col items-start gap-4 border-t-[3px] border-double border-foreground/60 pt-8"
          >
            <h2 id="learn-review" className="text-headline font-bold">
              Review: Survival
            </h2>
            <p className="max-w-prose text-body text-pretty">
              Survival ramps through every chapter: {FACTS.survivalLives} lives
              and a shrinking clock, starting at nibbles and climbing to bitwise
              operations, with earlier topics mixed back in for review.
            </p>
            <div className="flex flex-col gap-3 pt-2 xs:flex-row">
              <Button asChild size="lg">
                <Link to="/play?mode=survival">
                  Play Survival
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/how-to-play">How to use this book</Link>
              </Button>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
