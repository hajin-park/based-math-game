import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Timer } from "lucide-react";

import { getTopic, type TopicId } from "@/game";
import { Button } from "@/components/ui/button";
import { Digits } from "@/components/ui/digits";
import { BaseTag } from "@/components/ui/base-tag";
import { GridPaper } from "@/components/ui/grid-paper";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { LESSONS, TIER_LABELS, playHref } from "@/features/learn/lessons";
import { OnThisPage, type TocItem } from "@/features/learn/OnThisPage";
import { useHashScroll, useScrollSpy } from "@/features/learn/useToc";
import { TryOne } from "@/features/learn/TryOne";
import { PlaceValueDigits } from "@/features/learn/PlaceValueDigits";
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
/*  Small typographic helpers                                                 */
/* -------------------------------------------------------------------------- */

const MINUS = "−";

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

function P({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("max-w-prose text-body text-pretty", className)}>
      {children}
    </p>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-2 text-title font-semibold">{children}</h3>;
}

/** A worked example in a sunken well, monospace, one line per entry. */
function Work({ lines, label }: { lines: React.ReactNode[]; label?: string }) {
  return (
    <div className="max-w-prose overflow-x-auto rounded-md bg-sunken px-4 py-3">
      {label && <p className="eyebrow mb-2">{label}</p>}
      <div className="flex flex-col gap-1 whitespace-pre-wrap font-mono text-[0.8125rem] sm:whitespace-pre sm:text-[0.875rem] leading-relaxed">
        {lines.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/** A rule worth memorising. */
function Rule({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-prose border-l-2 border-foreground/70 py-1 pl-4">
      <p className="eyebrow mb-1.5">Rule</p>
      <div className="text-body text-pretty">{children}</div>
    </div>
  );
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex max-w-prose flex-col gap-2 text-body">
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[0.75rem_minmax(0,1fr)] gap-x-3">
          <span aria-hidden className="mt-[0.8em] h-px w-3 bg-border-strong" />
          <span className="text-pretty">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PracticeLinks({ topicId }: { topicId: TopicId }) {
  const topic = getTopic(topicId);
  return (
    <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:flex-wrap sm:items-center">
      <Button asChild variant="outline">
        <Link to={playHref(topicId, "practice")}>
          Practice {topic.name}
          <ArrowRight aria-hidden />
        </Link>
      </Button>
      <Button asChild variant="ghost">
        <Link to={playHref(topicId, "sprint")}>
          <Timer aria-hidden />
          60-second sprint
          <span className="sr-only">: {topic.name}</span>
        </Link>
      </Button>
      <span className="text-[0.8125rem] text-muted-foreground">
        Practice is untimed and shows worked steps.
      </span>
    </div>
  );
}

const LESSON_INDEX = new Map(LESSONS.map((l, i) => [l.id, i]));

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
  const index = LESSON_INDEX.get(id) ?? 0;
  const lesson = LESSONS[index];
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="flex scroll-mt-12 flex-col gap-6 border-t py-12 first:border-t-0 first:pt-0 md:py-16 lg:-scroll-mt-12"
    >
      <header className="flex flex-col gap-3">
        <p className="eyebrow flex items-center gap-2">
          <span className="text-foreground">
            {String(index).padStart(2, "0")}
          </span>
          <span aria-hidden className="h-px w-4 bg-border-strong" />
          {TIER_LABELS[lesson.tier]}
        </p>
        <h2
          id={headingId}
          tabIndex={-1}
          className="text-headline font-serif font-medium text-balance [font-variation-settings:'opsz'_60]"
        >
          {title}
        </h2>
        <p className="max-w-prose text-body-lg text-muted-foreground text-pretty">
          {lede}
        </p>
      </header>
      {children}
      {lesson.topicId && lesson.topicId !== "custom" && (
        <PracticeLinks topicId={lesson.topicId} />
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reference tables                                                          */
/* -------------------------------------------------------------------------- */

function PowersTable() {
  return (
    <div className="max-w-prose overflow-hidden rounded-md border">
      <table className="w-full border-collapse text-[0.875rem]">
        <caption className="sr-only">
          Powers of two from 2 to the 0 up to 2 to the 16
        </caption>
        <thead>
          <tr className="border-b border-border-strong bg-sunken text-[0.75rem] text-muted-foreground">
            <th scope="col" className="px-3 py-2 text-left font-medium">
              n
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              2ⁿ
            </th>
            <th
              scope="col"
              className="hidden px-3 py-2 text-left font-medium xs:table-cell"
            >
              n
            </th>
            <th
              scope="col"
              className="hidden px-3 py-2 text-right font-medium xs:table-cell"
            >
              2ⁿ
            </th>
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums">
          {Array.from({ length: 9 }, (_, row) => {
            const left = row;
            const right = row + 9;
            return (
              <tr key={row} className="border-b last:border-b-0">
                <td className="px-3 py-1.5 text-muted-foreground">{left}</td>
                <td className="px-3 py-1.5 text-right">
                  {(2 ** left).toLocaleString("en-US")}
                </td>
                {right <= 16 ? (
                  <>
                    <td className="hidden border-l px-3 py-1.5 text-muted-foreground xs:table-cell">
                      {right}
                    </td>
                    <td className="hidden px-3 py-1.5 text-right xs:table-cell">
                      {(2 ** right).toLocaleString("en-US")}
                    </td>
                  </>
                ) : (
                  <td colSpan={2} className="hidden border-l xs:table-cell" />
                )}
              </tr>
            );
          })}
          {Array.from({ length: 8 }, (_, i) => i + 9).map((n) => (
            <tr key={`m${n}`} className="border-b last:border-b-0 xs:hidden">
              <td className="px-3 py-1.5 text-muted-foreground">{n}</td>
              <td className="px-3 py-1.5 text-right">
                {(2 ** n).toLocaleString("en-US")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
    <div className="w-fit overflow-hidden rounded-md border">
      <table className="border-collapse text-center font-mono text-[0.875rem] tabular-nums">
        <caption className="sr-only">Truth table for AND, OR and XOR</caption>
        <thead>
          <tr className="border-b border-border-strong bg-sunken text-[0.75rem] text-muted-foreground">
            <th scope="col" className="px-4 py-2 font-medium">
              a
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              b
            </th>
            <th scope="col" className="border-l px-4 py-2 font-medium">
              AND
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              OR
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              XOR
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, b]) => (
            <tr key={`${a}${b}`} className="border-b last:border-b-0">
              <td className="px-4 py-1.5 text-base-bin">{a}</td>
              <td className="px-4 py-1.5 text-base-bin">{b}</td>
              <td className="border-l px-4 py-1.5">{a & b}</td>
              <td className="px-4 py-1.5">{a | b}</td>
              <td className="px-4 py-1.5">{a ^ b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
    <figure className="max-w-prose overflow-hidden rounded-lg border bg-card shadow-xs">
      <ul className="divide-y">
        {examples.map((e) => (
          <li
            key={e.b}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-5"
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
      <figcaption className="border-t bg-sunken/50 px-4 py-2.5 text-[0.8125rem] text-muted-foreground sm:px-5">
        The small numbers under each digit are its place value.
      </figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

const TOC: TocItem[] = LESSONS.map((l) => ({
  id: l.id,
  label: l.label,
  group: TIER_LABELS[l.tier],
}));
const TOC_IDS = TOC.map((t) => t.id);

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
      <section className="relative isolate border-b">
        <GridPaper fade className="opacity-80" />
        <div className="container py-10 md:py-14">
          <PageHeader
            eyebrow={`Learn · ${LESSONS.length} lessons`}
            size="lg"
            title={
              <>
                From place value to <em>two’s complement</em>.
              </>
            }
            lede="A short course in how computers write numbers, for intro CS and digital logic. Each lesson has the idea, something to play with, a generated example with worked steps, and a drill."
          >
            <ol className="mt-4 flex flex-wrap gap-2" aria-label="Tracks">
              {(["foundations", "core", "advanced", "applied"] as const).map(
                (tier, i) => {
                  const first = LESSONS.find((l) => l.tier === tier)!;
                  const count = LESSONS.filter((l) => l.tier === tier).length;
                  return (
                    <li key={tier}>
                      <a
                        href={`#${first.id}`}
                        className="inline-flex min-h-9 items-center gap-2 rounded-md border bg-card px-3 text-label text-foreground transition-colors duration-fast hover:border-border-strong pointer-coarse:min-h-11"
                      >
                        <span className="font-mono text-[0.6875rem] text-muted-foreground">
                          T{i}
                        </span>
                        {TIER_LABELS[tier]}
                        <span className="text-muted-foreground">· {count}</span>
                      </a>
                    </li>
                  );
                },
              )}
            </ol>
          </PageHeader>
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
          <div className="sticky top-[calc(var(--nav-h)+2rem)] max-h-[calc(100dvh-var(--nav-h)-4rem)] overflow-y-auto pb-6">
            <OnThisPage items={TOC} active={active} variant="sidebar" />
          </div>
        </aside>

        <article className="flex min-w-0 max-w-3xl flex-col">
          {/* ------------------------------------------------ Place value */}
          <Lesson
            id="place-value"
            title="Place value: one idea, every base"
            lede="Every positional number system works the same way. Learn this once and binary, octal and hex are just different alphabets."
          >
            <P>
              A numeral is a row of digits, and each position is worth the base
              raised to that position, counting from 0 on the right. Decimal{" "}
              <N b="dec" v="237" /> means 2 hundreds, 3 tens and 7 ones. Binary
              uses powers of 2 instead of powers of 10; hexadecimal uses powers
              of 16.
            </P>
            <PlaceValueFigure />
            <Rule>
              In base <i>b</i>, the digit in position <i>k</i> is worth digit ×{" "}
              <i>b</i>
              <sup>k</sup>, and the digits run from 0 to <i>b</i> {MINUS} 1. Hex
              runs out of decimal digits after 9, so it uses A–F for 10–15.
            </Rule>
            <P className="text-muted-foreground">
              Notation: code marks the base with a prefix (
              <N b="bin" v="1011" prefix />, <N b="oct" v="17" prefix />,{" "}
              <N b="hex" v="2F" prefix />
              ); textbooks use a subscript (1011<sub>2</sub>). In this game
              every number carries a coloured base tag instead.
            </P>
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
              <N b="bin" v="1111" />, which are the values 0 to 15: exactly the
              sixteen digits of hexadecimal. Every longer binary-to-hex
              conversion is this one, repeated.
            </P>
            <Work
              label="Worked"
              lines={[
                "1011  →  8 + 2 + 1      = 11 = B",
                "13    →  13 = 8 + 4 + 1  → 1101 = D",
              ]}
            />
            <Bullets
              items={[
                <>
                  <N b="bin" v="1010" /> is A (10) and <N b="bin" v="1111" /> is
                  F (15); A–F are exactly the nibbles that start with 1 and are
                  above 1001.
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
              Each binary place is worth twice the one to its right: 1, 2, 4, 8,
              16 … With <i>n</i> bits you can write 2<sup>n</sup> different
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
              label="Worked"
              lines={[
                "2^16 = 2^6 × 2^10 = 64 × 1024 = 65,536",
                "2^n = 4096  →  4096 = 4 × 1024 = 2^2 × 2^10  →  n = 12",
                "largest 12-bit value = 2^12 − 1 = 4095",
              ]}
            />
            <P className="text-muted-foreground">
              Memory sizes use the same anchors: 1 KiB = 2<sup>10</sup> bytes, 1
              MiB = 2<sup>20</sup>, 1 GiB = 2<sup>30</sup>, so a 32-bit address
              reaches 2<sup>32</sup> bytes = 4 GiB.
            </P>
            <PowersWidget />
            <PowersTable />
            <TryOne topicId="powers" />
          </Lesson>

          {/* ------------------------------------------------ Binary bytes */}
          <Lesson
            id="binary"
            title="Binary: reading and writing bytes"
            lede="A byte is 8 bits, weights 128 down to 1, values 0 to 255."
          >
            <H3>Binary to decimal: add the weights of the 1 bits</H3>
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
            <H3>
              Decimal to binary: subtract the largest power of two that fits
            </H3>
            <Work
              lines={[
                "200 − 128 = 72     bit 7",
                " 72 −  64 =  8     bit 6",
                "  8 −   8 =  0     bit 3",
                "→ 1100 1000",
              ]}
            />
            <P className="text-muted-foreground">
              Or divide by 2 repeatedly and read the remainders from the bottom
              up: 13 ÷ 2 = 6 r 1, 6 ÷ 2 = 3 r 0, 3 ÷ 2 = 1 r 1, 1 ÷ 2 = 0 r 1 →{" "}
              <N b="bin" v="1101" />. Both methods give the same bits;
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
              <sup>4</sup>, each hex digit stands for exactly one nibble, and a
              byte is always exactly two hex digits. Decimal has no such
              shortcut because 10 is not a power of two.
            </P>
            <H3>Binary ↔ hex: group in fours from the right</H3>
            <Work
              lines={[
                "1100 1000",
                "   C    8   →  0xC8",
                "0x3F  →  0011 1111   (pad each digit to 4 bits)",
              ]}
            />
            <H3>Hex ↔ decimal: place values 16 and 1</H3>
            <Work
              lines={[
                "0xC8 = 12×16 + 8 = 192 + 8 = 200",
                "200 ÷ 16 = 12 remainder 8  →  C8",
              ]}
            />
            <P className="text-muted-foreground">
              Memory dumps, MAC addresses, UTF-8 bytes and CSS colours all use
              pairs of hex digits for exactly this reason.
            </P>
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
            <H3>Where you will see it: chmod</H3>
            <P>
              Unix permissions are three 3-bit fields (owner, group, others),
              each made of read (4), write (2) and execute (1). So 7 = rwx, 6 =
              rw-, 5 = r-x and 4 = r--.{" "}
              <span className="font-mono text-[0.9em]">chmod 755</span> is
              rwxr-xr-x and{" "}
              <span className="font-mono text-[0.9em]">chmod 644</span> is
              rw-r--r--.
            </P>
            <ChmodWidget />
            <P className="text-muted-foreground">
              Octal also survives in C string escapes (
              <span className="font-mono">\033</span> is 27, the ESC character)
              and in Python’s <span className="font-mono">0o</span> prefix. It
              does not line up with bytes (8 is not a multiple of 3), which is
              why hex won everywhere else.
            </P>
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
              decimal, split the word into its two bytes, because the high byte
              is worth 256 times its value.
            </P>
            <Work
              label="Worked"
              lines={[
                "0x1F90  →  high 0x1F = 31, low 0x90 = 144",
                "31 × 256 + 144 = 7936 + 144 = 8080",
                "check: 1×4096 + 15×256 + 9×16 + 0×1 = 8080",
              ]}
            />
            <P className="text-muted-foreground">
              Going the other way, divide by 256 to get the bytes (8080 ÷ 256 =
              31 remainder 144), then write each byte as two hex digits.
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
              bit has weight {MINUS}2<sup>n−1</sup> instead of +2<sup>n−1</sup>.
              Every other bit keeps its usual weight. For 8 bits: {MINUS}128,
              64, 32, 16, 8, 4, 2, 1, so the range is {MINUS}128 to 127.
            </Rule>
            <Work
              label="Read a pattern"
              lines={[
                "1111 1110  =  −128 + 64 + 32 + 16 + 8 + 4 + 2  =  −2",
                "1011 0110  =  −128 + 32 + 16 + 4 + 2           =  −74",
                "0100 1010  =  64 + 8 + 2 (sign bit 0)          =  74",
              ]}
            />
            <H3>Negate: invert every bit, then add one</H3>
            <Work
              lines={[
                "  74 = 0100 1010",
                "invert 1011 0101",
                " + 1 = 1011 0110  = −74",
              ]}
            />
            <P>
              The same two steps work in reverse: invert{" "}
              <N b="bin" v="10110110" /> to get <N b="bin" v="01001001" />, add
              1 to get <N b="bin" v="01001010" /> = 74, so the pattern means{" "}
              {MINUS}74.
            </P>
            <Bullets
              items={[
                <>
                  Sign bit 1 means negative; non-negative values look like plain
                  binary.
                </>,
                <>
                  All ones, <N b="hex" v="FF" prefix />, is {MINUS}1.{" "}
                  <N b="bin" v="10000000" /> is {MINUS}128, the one value with
                  no positive partner: negating it gives itself.
                </>,
                <>
                  One adder handles both signs: 5 + ({MINUS}3) is 0000 0101 +
                  1111 1101 = 1 0000 0010; drop the carry out and the result is
                  0000 0010 = 2.
                </>,
                <>
                  Overflow is when two operands of the same sign give a result
                  of the other sign: 127 + 1 = 1000 0000 = {MINUS}128.
                </>,
                <>
                  To widen a value, copy the sign bit (sign extension): {MINUS}2
                  is 1111 1110 in 8 bits and 1111 1111 1111 1110 in 16.
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
            <H3>Masks</H3>
            <Bullets
              items={[
                <>
                  <span className="font-mono">x AND mask</span> keeps the bits
                  the mask selects and clears the rest: 1100 1010 AND 0000 1111
                  = 0000 1010.
                </>,
                <>
                  <span className="font-mono">x OR mask</span> sets bits: x OR
                  1000 0000 turns bit 7 on.
                </>,
                <>
                  <span className="font-mono">x XOR mask</span> flips bits: ‘A’
                  (0x41) XOR 0x20 = ‘a’ (0x61).
                </>,
                <>
                  Test a flag: bit <i>k</i> of x is set when x AND (1 &lt;&lt;{" "}
                  <i>k</i>) is not zero.
                </>,
              ]}
            />
            <H3>Shifts</H3>
            <P>
              <span className="font-mono">x &lt;&lt; k</span> moves every bit k
              places left: zeros enter on the right, bits leaving the register
              are lost, and the value is multiplied by 2<sup>k</sup> (mod 256
              for a byte). <span className="font-mono">x &gt;&gt; k</span> moves
              bits right, dividing by 2<sup>k</sup> and rounding down. The game
              uses logical shifts, which always fill with zeros.
            </P>
            <Work
              lines={[
                "0001 0110 << 2 = 0101 1000     22 × 4  = 88",
                "1011 0101 >> 3 = 0001 0110     181 ÷ 8 = 22 (rounded down)",
              ]}
            />
            <P className="text-muted-foreground">
              Networking uses AND every day: an IP address AND its subnet mask
              is the network address. 192.168.1.130 AND 255.255.255.192: the
              last byte is 1000 0010 AND 1100 0000 = 1000 0000, so the network
              is 192.168.1.128.
            </P>
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
              0 + 0 = 0 · 0 + 1 = 1 · 1 + 1 = 10 (write 0, carry 1) · 1 + 1 + 1
              = 11 (write 1, carry 1)
            </Rule>
            <Work
              label="Worked"
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
              means the unsigned sum does not fit (unsigned overflow); the game
              picks operands so every sum fits in 8 bits.
            </P>
            <P className="text-muted-foreground">
              In hardware each column is a full adder: sum = a XOR b XOR
              carry-in, and carry-out is 1 when at least two of the three inputs
              are 1. Chain eight of them and you have an 8-bit ripple-carry
              adder. Subtraction is addition of the two’s complement: a {MINUS}{" "}
              b = a + (NOT b) + 1.
            </P>
            <AdditionWidget />
            <TryOne topicId="binary-add" />
          </Lesson>

          {/* ---------------------------------------------- Colors & ASCII */}
          <Lesson
            id="colors-ascii"
            title="Colors and ASCII"
            lede="Two places where bytes show up in everyday code: CSS colours and text."
          >
            <H3>Hex colours are three bytes</H3>
            <P>
              <span className="font-mono">#RRGGBB</span> is red, green and blue,
              each one byte from 00 (off) to FF (255, full).{" "}
              <N b="hex" v="3FA0C2" /> has red 0x3F = 63, green 0xA0 = 160 and
              blue 0xC2 = 194. Equal channels make greys (#808080 is mid grey),
              and the short form #RGB doubles each digit: #F80 = #FF8800.
            </P>
            <ColorWidget />
            <H3>ASCII is a table with a few anchors</H3>
            <P>
              ASCII gives each character a 7-bit code, written as two hex
              digits: the high digit is the row of the table, the low digit the
              column. Three anchors give you the rest:
            </P>
            <Bullets
              items={[
                <>
                  Digits start at ‘0’ = 0x30, so digit <i>n</i> is 0x30 +{" "}
                  <i>n</i> (‘7’ = 0x37).
                </>,
                <>
                  Capitals start at ‘A’ = 0x41 and end at ‘Z’ = 0x5A; ‘K’ is 10
                  after ‘A’, so 0x4B.
                </>,
                <>
                  Lowercase is capitals + 0x20: ‘a’ = 0x61 to ‘z’ = 0x7A. Upper
                  and lower case differ only in bit 5.
                </>,
                <>
                  Space is 0x20. Codes 0x00–0x1F and 0x7F are control characters
                  (newline is 0x0A).
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
              drill (any pair of bases, with value ranges up to 32 bits) and mix
              in powers, two’s complement, bitwise, addition, colour or ASCII
              questions. Play it untimed, against a clock, or to a target count.
              Custom games are never ranked.
            </P>
            <P className="text-muted-foreground">
              Teaching a section? Open a multiplayer room so the whole class
              gets the same questions, and see{" "}
              <Link to="/how-to-play#classrooms" className="link">
                classroom tips
              </Link>
              .
            </P>
            <div className="flex flex-wrap gap-3 border-t pt-5">
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

          {/* ---------------------------------------------------- Closing */}
          <section
            aria-labelledby="learn-next"
            className="mt-4 flex flex-col items-start gap-5 rounded-xl border bg-card px-5 py-8 sm:px-8"
          >
            <p className="eyebrow">Put it together</p>
            <h2
              id="learn-next"
              className="text-headline font-serif font-medium [font-variation-settings:'opsz'_60] [&_em]:italic [&_em]:text-primary"
            >
              Survival ramps through <em>every</em> lesson.
            </h2>
            <p className="max-w-prose text-body text-muted-foreground">
              Three lives and a shrinking clock, starting at nibbles and
              climbing to bitwise operations, with earlier topics mixed back in
              for review.
            </p>
            <div className="flex flex-col gap-3 xs:flex-row">
              <Button asChild size="lg">
                <Link to="/play?mode=survival">
                  Play Survival
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/how-to-play">How to play</Link>
              </Button>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
