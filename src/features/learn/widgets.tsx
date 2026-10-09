import * as React from "react";
import { Minus, Plus } from "lucide-react";

import { BaseOdometer } from "@/components/ui/base-odometer";
import { BaseTag } from "@/components/ui/base-tag";
import { Button } from "@/components/ui/button";
import { Digits } from "@/components/ui/digits";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/utils";
import { BitMatrix } from "./BitMatrix";
import {
  ASCII_ANCHORS,
  POWER_LANDMARKS,
  WORD_LANDMARKS,
  addColumns,
  applyOp,
  asciiCode,
  bitAt,
  casePartner,
  hex2,
  invert,
  negate,
  parseLoose,
  permString,
  rgbHex,
  toSigned,
  type BitOp,
  type Radix,
} from "./lessons";

const MINUS = "−";
const signed = (n: number) => (n < 0 ? `${MINUS}${-n}` : String(n));

/* -------------------------------------------------------------------------- */
/*  Frame + small pieces                                                      */
/* -------------------------------------------------------------------------- */

export function WidgetFrame({
  title,
  children,
  footer,
  className,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border bg-card shadow-xs",
        className,
      )}
    >
      <figcaption className="flex items-center gap-2 border-b px-4 py-2.5 sm:px-5">
        <span aria-hidden className="size-1.5 rounded-full bg-base-bin" />
        <span className="eyebrow text-foreground">{title}</span>
      </figcaption>
      <div className="flex flex-col gap-5 p-4 sm:p-5">{children}</div>
      {footer && (
        <div className="border-t px-4 py-3 text-[0.8125rem] text-muted-foreground sm:px-5">
          {footer}
        </div>
      )}
    </figure>
  );
}

/** Label/value readout in a hairline-divided row. */
function Readouts({
  items,
  className,
}: {
  items: {
    label: React.ReactNode;
    value: React.ReactNode;
    tag?: React.ReactNode;
  }[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border [&>*:last-child:nth-child(odd)]:col-span-2 sm:grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] sm:[&>*:last-child:nth-child(odd)]:col-span-1",
        className,
      )}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="flex min-w-0 flex-col gap-1.5 bg-card px-3 py-2.5"
        >
          <dt className="flex items-center gap-1.5 text-[0.75rem] text-muted-foreground">
            {item.tag}
            {item.label}
          </dt>
          <dd className="min-w-0 truncate font-mono text-[1.125rem] font-medium tabular-nums leading-tight">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Live({ children }: { children: React.ReactNode }) {
  return (
    <p className="sr-only" aria-live="polite" aria-atomic>
      {children}
    </p>
  );
}

function PresetButtons<T>({
  label,
  presets,
  onPick,
}: {
  label: string;
  presets: { label: React.ReactNode; value: T; aria?: string }[];
  onPick: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[0.8125rem] text-muted-foreground">{label}</span>
      {presets.map((p, i) => (
        <Button
          key={i}
          type="button"
          variant="secondary"
          size="sm"
          aria-label={p.aria}
          onClick={() => onPick(p.value)}
          className="font-mono"
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Nibbles                                                                   */
/* -------------------------------------------------------------------------- */

export function NibbleWidget() {
  const [v, setV] = React.useState(11);
  const bin = v.toString(2).padStart(4, "0");
  return (
    <WidgetFrame title="Build a nibble">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <BitMatrix
          bits={4}
          caption="Four bits, weights 8 4 2 1"
          rows={[
            { kind: "weights", label: "×", text: (p) => 2 ** p },
            {
              kind: "bits",
              label: "bit",
              name: "Nibble",
              value: v,
              onToggle: (p) => setV((x) => x ^ (1 << p)),
            },
          ]}
        />
        <Readouts
          className="md:w-72"
          items={[
            {
              label: "Hex digit",
              tag: <BaseTag base="hex" size="xs" />,
              value: <Digits base="hex" value={v} size="inherit" />,
            },
            {
              label: "Decimal",
              tag: <BaseTag base="dec" size="xs" />,
              value: <Digits base="dec" value={v} size="inherit" />,
            },
          ]}
        />
      </div>
      <Live>
        Nibble {bin} is hex {v.toString(16).toUpperCase()}, decimal {v}.
      </Live>
      <ul
        aria-label="All sixteen nibbles"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border xs:grid-cols-4 md:grid-cols-8"
      >
        {Array.from({ length: 16 }, (_, i) => (
          <li
            key={i}
            aria-current={i === v ? "true" : undefined}
            className={cn(
              "flex items-baseline justify-between gap-2 px-2.5 py-2",
              i === v ? "bg-accent" : "bg-card",
            )}
          >
            <Digits base="bin" value={i} pad={4} size="xs" />
            <Digits
              base="hex"
              value={i}
              size="sm"
              className={i === v ? "" : "opacity-90"}
            />
          </li>
        ))}
      </ul>
    </WidgetFrame>
  );
}

/* -------------------------------------------------------------------------- */
/*  Powers of two                                                             */
/* -------------------------------------------------------------------------- */

export function PowersWidget() {
  const [n, setN] = React.useState(10);
  const id = React.useId();
  const clamp = (x: number) => Math.max(0, Math.min(16, x));
  const value = 2 ** n;
  return (
    <WidgetFrame title="Slide the exponent">
      <div className="flex flex-col gap-2">
        <Label htmlFor={id} className="flex items-baseline justify-between">
          <span>Exponent n</span>
          <span className="font-mono text-[0.9375rem] text-foreground">
            n = {n}
          </span>
        </Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Decrease exponent"
            disabled={n === 0}
            onClick={() => setN((x) => clamp(x - 1))}
            className="shrink-0 pointer-coarse:size-11"
          >
            <Minus aria-hidden />
          </Button>
          <input
            id={id}
            type="range"
            min={0}
            max={16}
            step={1}
            value={n}
            aria-valuetext={`n = ${n}, 2 to the ${n} is ${value}`}
            onChange={(e) => setN(Number(e.target.value))}
            className="h-11 min-w-0 flex-1 cursor-pointer accent-[rgb(var(--base-bin))]"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Increase exponent"
            disabled={n === 16}
            onClick={() => setN((x) => clamp(x + 1))}
            className="shrink-0 pointer-coarse:size-11"
          >
            <Plus aria-hidden />
          </Button>
        </div>
      </div>
      <Readouts
        items={[
          {
            label: (
              <>
                2<sup>{n}</sup>
              </>
            ),
            tag: <BaseTag base="dec" size="xs" />,
            value: value.toLocaleString("en-US"),
          },
          {
            label: <>Largest {n}-bit value</>,
            tag: <BaseTag base="dec" size="xs" />,
            value: (value - 1).toLocaleString("en-US"),
          },
        ]}
      />
      <div className="flex flex-col gap-2 rounded-md bg-sunken px-3 py-3">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="w-24 shrink-0 text-[0.75rem] text-muted-foreground">
            2<sup>{n}</sup> in binary
          </span>
          <Digits base="bin" value={value} group size="sm" condensed={n > 11} />
        </p>
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="w-24 shrink-0 text-[0.75rem] text-muted-foreground">
            2<sup>{n}</sup> {MINUS} 1
          </span>
          {n === 0 ? (
            <Digits base="bin" value={0} size="sm" />
          ) : (
            <Digits
              base="bin"
              value={value - 1}
              group
              size="sm"
              condensed={n > 11}
            />
          )}
        </p>
      </div>
      <p className="min-h-5 text-body-sm text-muted-foreground">
        {POWER_LANDMARKS[n]
          ? `2^${n} = ${value.toLocaleString("en-US")}: ${POWER_LANDMARKS[n]}.`
          : `A 1 followed by ${n} zero${n === 1 ? "" : "s"} in binary; ${n} ones is one less.`}
      </p>
      <Live>
        2 to the {n} is {value}. The largest {n}-bit value is {value - 1}.
      </Live>
    </WidgetFrame>
  );
}

/* -------------------------------------------------------------------------- */
/*  Binary bytes                                                              */
/* -------------------------------------------------------------------------- */

export function ByteWidget() {
  const [v, setV] = React.useState(192);
  return (
    <WidgetFrame
      title="Flip the bits of a byte"
      footer="Click or tab to any bit and press Space to flip it. Count up and watch carries ripple left."
    >
      <BaseOdometer
        value={v}
        onValueChange={setV}
        bits={8}
        interactive
        placeValues
        size="md"
        bases={["bin", "dec", "hex"]}
        className="shadow-none"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setV((x) => (x + 255) % 256)}
          aria-label="Subtract one"
        >
          <Minus aria-hidden /> 1
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setV((x) => (x + 1) % 256)}
          aria-label="Add one"
        >
          <Plus aria-hidden /> 1
        </Button>
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        <PresetButtons
          label="Try"
          onPick={setV}
          presets={[
            { label: "192", value: 192, aria: "Load 192" },
            { label: "127", value: 127, aria: "Load 127" },
            { label: "128", value: 128, aria: "Load 128" },
            { label: "255", value: 255, aria: "Load 255" },
          ]}
        />
      </div>
    </WidgetFrame>
  );
}

/* -------------------------------------------------------------------------- */
/*  Converter (hexadecimal)                                                   */
/* -------------------------------------------------------------------------- */

const RADIX_OPTIONS: { value: `${Radix}`; label: string }[] = [
  { value: "2", label: "BIN" },
  { value: "8", label: "OCT" },
  { value: "10", label: "DEC" },
  { value: "16", label: "HEX" },
];
const CONVERTER_MAX = 0xffff;

export function ConverterWidget() {
  const [radix, setRadix] = React.useState<`${Radix}`>("16");
  const [raw, setRaw] = React.useState("C8");
  const id = React.useId();
  const r = Number(radix) as Radix;
  const value = parseLoose(raw, r, CONVERTER_MAX);
  const invalid = raw.trim() !== "" && value === null;

  const switchRadix = (next: `${Radix}`) => {
    // Keep the same number, rewritten in the new base.
    if (value !== null) {
      const s = value.toString(Number(next));
      setRaw(next === "16" ? s.toUpperCase() : s);
    }
    setRadix(next);
  };

  const bin = value !== null ? value.toString(2) : "";
  const padded = bin.padStart(Math.ceil(bin.length / 4) * 4, "0");
  const nibbles = padded.match(/.{4}/g) ?? [];

  return (
    <WidgetFrame title="Mini converter">
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>Type a number (0 to FFFF)</Label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Segmented
            id="converter-radix"
            aria-label="Input base"
            value={radix}
            onValueChange={switchRadix}
            options={RADIX_OPTIONS}
            size="lg"
            className="w-fit"
          />
          <Input
            id={id}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            aria-invalid={invalid}
            aria-describedby={`${id}-msg`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            inputMode={r === 16 ? "text" : "numeric"}
            className="h-11 max-w-[16rem] font-mono text-[1rem]"
          />
        </div>
        <p
          id={`${id}-msg`}
          className={cn(
            "min-h-5 text-[0.8125rem]",
            invalid ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {invalid
            ? `Not a ${RADIX_OPTIONS.find((o) => o.value === radix)?.label} number from 0 to FFFF.`
            : "Prefixes (0x, 0b, 0o), spaces and underscores are ignored."}
        </p>
      </div>

      <div className="flex flex-col divide-y divide-dashed rounded-md border px-3">
        {(["bin", "oct", "dec", "hex"] as const).map((b) => (
          <div key={b} className="flex min-h-11 items-center gap-3 py-2">
            <BaseTag base={b} size="sm" showRadix className="w-12" />
            <span className="min-w-0 overflow-x-auto">
              {value === null ? (
                <span className="font-mono text-muted-foreground">—</span>
              ) : (
                <Digits
                  base={b}
                  value={value}
                  group={b === "bin" ? 4 : b === "dec" ? 3 : false}
                  condensed={b === "bin" && bin.length > 8}
                  size="sm"
                />
              )}
            </span>
          </div>
        ))}
      </div>

      {value !== null && (
        <div className="flex flex-col gap-2">
          <p className="text-[0.75rem] text-muted-foreground">
            Each group of four bits is one hex digit
          </p>
          <div className="flex flex-wrap gap-2" aria-hidden>
            {nibbles.map((nb, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 rounded-md border bg-sunken px-2.5 py-2"
              >
                <Digits base="bin" value={nb} size="sm" />
                <span className="text-[0.6875rem] text-muted-foreground">
                  ↓
                </span>
                <Digits base="hex" value={parseInt(nb, 2)} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
      <Live>
        {value === null
          ? invalid
            ? "Invalid number"
            : ""
          : `Binary ${bin}, octal ${value.toString(8)}, decimal ${value}, hex ${value.toString(16).toUpperCase()}.`}
      </Live>
    </WidgetFrame>
  );
}

/* -------------------------------------------------------------------------- */
/*  Octal: chmod                                                              */
/* -------------------------------------------------------------------------- */

const WHO = ["Owner", "Group", "Others"] as const;
const PERMS = [
  { bit: 4, letter: "r", name: "read" },
  { bit: 2, letter: "w", name: "write" },
  { bit: 1, letter: "x", name: "execute" },
] as const;

export function ChmodWidget() {
  const [digits, setDigits] = React.useState<[number, number, number]>([
    7, 5, 5,
  ]);
  const octal = digits.join("");
  const toggle = (who: number, bit: number) =>
    setDigits((d) => {
      const next = [...d] as [number, number, number];
      next[who] ^= bit;
      return next;
    });
  return (
    <WidgetFrame title="Build a chmod mode">
      <div className="grid gap-3 sm:grid-cols-3">
        {WHO.map((who, wi) => (
          <fieldset
            key={who}
            className="flex flex-col gap-2 rounded-md border px-3 pb-3 pt-2"
          >
            <legend className="px-1 text-label text-muted-foreground">
              {who}
            </legend>
            <div className="flex gap-1.5">
              {PERMS.map((p) => {
                const on = (digits[wi] & p.bit) !== 0;
                return (
                  <button
                    key={p.letter}
                    type="button"
                    aria-pressed={on}
                    aria-label={`${who} ${p.name}`}
                    onClick={() => toggle(wi, p.bit)}
                    className={cn(
                      "flex h-12 min-w-11 flex-1 flex-col items-center justify-center rounded-md border font-mono transition-[background-color,border-color,color] duration-fast",
                      on
                        ? "border-base-bin/35 bg-base-bin/10 text-base-bin"
                        : "border-border bg-card text-muted-foreground hover:border-border-strong",
                    )}
                  >
                    <span className="text-[1rem] font-medium leading-none">
                      {on ? p.letter : "-"}
                    </span>
                    <span className="mt-1 text-[0.625rem] leading-none opacity-80">
                      {p.bit}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="flex items-baseline justify-between text-[0.75rem] text-muted-foreground">
              <Digits base="bin" value={digits[wi]} pad={3} size="xs" />
              <span>
                = <Digits base="oct" value={digits[wi]} size="xs" />
              </span>
            </p>
          </fieldset>
        ))}
      </div>
      <div className="flex flex-col gap-2 rounded-md bg-sunken px-3 py-3 font-mono text-[0.9375rem] sm:flex-row sm:items-center sm:justify-between">
        <span>
          <span className="text-muted-foreground">$ chmod </span>
          <Digits base="oct" value={octal} size="inherit" />
        </span>
        <span className="text-foreground">{permString(octal)}</span>
        <Digits
          base="bin"
          value={digits.map((d) => d.toString(2).padStart(3, "0")).join("")}
          group={3}
          size="inherit"
        />
      </div>
      <PresetButtons
        label="Common"
        onPick={(o: string) =>
          setDigits([...o].map(Number) as [number, number, number])
        }
        presets={["755", "644", "600", "777"].map((o) => ({
          label: o,
          value: o,
          aria: `Load mode ${o}`,
        }))}
      />
      <Live>
        Mode {octal}, {permString(octal)}.
      </Live>
    </WidgetFrame>
  );
}

/* -------------------------------------------------------------------------- */
/*  16-bit words                                                              */
/* -------------------------------------------------------------------------- */

export function WordWidget() {
  const [raw, setRaw] = React.useState("1F90");
  const id = React.useId();
  const value = parseLoose(raw, 16, 0xffff);
  const invalid = raw.trim() !== "" && value === null;
  const hi = value === null ? 0 : Math.floor(value / 256);
  const lo = value === null ? 0 : value % 256;
  return (
    <WidgetFrame title="Split a word into bytes">
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>16-bit hex value</Label>
        <div className="relative w-full max-w-[12rem]">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-mono text-[0.9375rem] text-muted-foreground"
          >
            0x
          </span>
          <Input
            id={id}
            value={raw}
            maxLength={8}
            onChange={(e) => setRaw(e.target.value)}
            aria-invalid={invalid}
            aria-describedby={`${id}-msg`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="h-11 pl-9 font-mono text-[1rem] uppercase"
          />
        </div>
        <p
          id={`${id}-msg`}
          className={cn(
            "min-h-5 text-[0.8125rem]",
            invalid ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {invalid
            ? "Enter 1 to 4 hex digits (0 to FFFF)."
            : "Four hex digits = two bytes = sixteen bits."}
        </p>
      </div>
      {value !== null && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { name: "High byte", v: hi, weight: "× 256" },
              { name: "Low byte", v: lo, weight: "× 1" },
            ].map((b) => (
              <div
                key={b.name}
                className="flex flex-col gap-2 rounded-md border px-3 py-3"
              >
                <p className="flex items-center justify-between text-[0.75rem] text-muted-foreground">
                  {b.name}
                  <span className="font-mono">{b.weight}</span>
                </p>
                <p className="flex flex-wrap items-baseline justify-between gap-2">
                  <Digits base="hex" value={hex2(b.v)} prefix size="md" />
                  <Digits base="bin" value={b.v} pad={8} group size="xs" />
                </p>
                <p className="font-mono text-[0.8125rem] text-muted-foreground">
                  = {Math.floor(b.v / 16)}×16 + {b.v % 16} ={" "}
                  <span className="text-foreground">{b.v}</span>
                </p>
              </div>
            ))}
          </div>
          <p className="rounded-md bg-sunken px-3 py-3 font-mono text-[0.9375rem]">
            {hi} × 256 + {lo} ={" "}
            <Digits
              base="dec"
              value={value}
              size="inherit"
              className="font-semibold"
            />
          </p>
        </>
      )}
      <div className="flex flex-col gap-2">
        <p className="text-[0.75rem] text-muted-foreground">
          Worth knowing on sight
        </p>
        <ul className="flex flex-wrap gap-2">
          {WORD_LANDMARKS.map((w) => (
            <li key={w.hex}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setRaw(w.hex)}
                aria-label={`Load 0x${w.hex}, ${w.note}`}
                className="h-auto min-h-8 gap-2 py-1.5"
              >
                <Digits base="hex" value={w.hex} size="xs" />
                <span className="text-[0.75rem] text-muted-foreground">
                  {w.note}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <Live>
        {value === null
          ? ""
          : `High byte ${hi}, low byte ${lo}, value ${value}.`}
      </Live>
    </WidgetFrame>
  );
}

/* -------------------------------------------------------------------------- */
/*  Two's complement                                                          */
/* -------------------------------------------------------------------------- */

export function TwosWidget() {
  const [u, setU] = React.useState(0b11111110);
  const s = toSigned(u, 8);
  const pattern = u.toString(2).padStart(8, "0");
  return (
    <WidgetFrame
      title="8-bit two's complement"
      footer={
        <>
          Same eight bits, two readings. Bit 7 is worth +128 unsigned and{" "}
          {MINUS}128 signed; range {MINUS}128 to 127.
        </>
      }
    >
      <BitMatrix
        bits={8}
        caption="Bits of the register, most significant first"
        rows={[
          {
            kind: "weights",
            label: "×",
            text: (p) =>
              p === 7 ? (
                <span className="text-foreground">{MINUS}128</span>
              ) : (
                2 ** p
              ),
          },
          {
            kind: "bits",
            label: "bit",
            name: "Register",
            value: u,
            onToggle: (p) => setU((x) => x ^ (1 << p)),
          },
        ]}
      />
      <Readouts
        items={[
          {
            label: "Signed",
            tag: <BaseTag base="dec" size="xs" />,
            value: signed(s),
          },
          {
            label: "Unsigned",
            tag: <BaseTag base="dec" size="xs" />,
            value: u,
          },
          {
            label: "Hex",
            tag: <BaseTag base="hex" size="xs" />,
            value: <Digits base="hex" value={hex2(u)} prefix size="inherit" />,
          },
        ]}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setU((x) => invert(x, 8))}
        >
          Invert bits
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setU((x) => (x + 1) % 256)}
        >
          Add 1
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setU((x) => negate(x, 8))}
        >
          Negate (invert, add 1)
        </Button>
      </div>
      <PresetButtons
        label="Try"
        onPick={setU}
        presets={[
          { label: `${MINUS}1`, value: 0xff, aria: "Load minus 1" },
          { label: `${MINUS}128`, value: 0x80, aria: "Load minus 128" },
          { label: "127", value: 0x7f, aria: "Load 127" },
          { label: `${MINUS}74`, value: 0xb6, aria: "Load minus 74" },
        ]}
      />
      <Live>
        Pattern {pattern}: signed {s}, unsigned {u}.
      </Live>
    </WidgetFrame>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bitwise                                                                   */
/* -------------------------------------------------------------------------- */

const OP_OPTIONS: { value: BitOp; label: string; ariaLabel: string }[] = [
  { value: "and", label: "AND", ariaLabel: "AND" },
  { value: "or", label: "OR", ariaLabel: "OR" },
  { value: "xor", label: "XOR", ariaLabel: "XOR" },
  { value: "shl", label: "<<", ariaLabel: "Shift left" },
  { value: "shr", label: ">>", ariaLabel: "Shift right" },
];

const OP_RULE: Record<BitOp, string> = {
  and: "1 only where both bits are 1. Keeps the bits the mask selects, clears the rest.",
  or: "1 where either bit is 1. Sets the bits the mask selects, keeps the rest.",
  xor: "1 where the bits differ. Flips the bits the mask selects, keeps the rest.",
  shl: "Every bit moves left; zeros enter on the right and the top bits fall off. Multiplies by 2 per place (mod 256).",
  shr: "Every bit moves right; zeros enter on the left (logical shift) and the low bits fall off. Divides by 2 per place, rounding down.",
};

const OP_SYMBOL: Record<BitOp, string> = {
  and: "AND",
  or: "OR",
  xor: "XOR",
  shl: "<<",
  shr: ">>",
};

export function BitwiseWidget() {
  const [op, setOp] = React.useState<BitOp>("and");
  const [a, setA] = React.useState(0b11001010);
  const [b, setB] = React.useState(0b00001111);
  const [shift, setShift] = React.useState<"1" | "2" | "3">("2");
  const isShift = op === "shl" || op === "shr";
  const operand = isShift ? Number(shift) : b;
  const result = applyOp(op, a, operand, 8);
  const changed = (p: number) => !isShift && bitAt(result, p) !== bitAt(a, p);

  return (
    <WidgetFrame title="Bitwise visualiser">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Segmented
          id="bitwise-op"
          aria-label="Operation"
          value={op}
          onValueChange={setOp}
          options={OP_OPTIONS}
          size="lg"
        />
        {isShift && (
          <div className="flex items-center gap-2">
            <span
              className="text-[0.8125rem] text-muted-foreground"
              id="shift-label"
            >
              by
            </span>
            <Segmented
              id="bitwise-shift"
              aria-label="Shift amount"
              value={shift}
              onValueChange={setShift}
              options={[
                { value: "1", label: "1" },
                { value: "2", label: "2" },
                { value: "3", label: "3" },
              ]}
              size="lg"
            />
          </div>
        )}
      </div>
      <BitMatrix
        bits={8}
        caption={`A ${OP_SYMBOL[op]} ${isShift ? shift : "B"}`}
        rows={[
          {
            kind: "bits",
            label: "A",
            name: "Operand A",
            value: a,
            onToggle: (p) => setA((x) => x ^ (1 << p)),
          },
          ...(isShift
            ? []
            : [
                {
                  kind: "bits" as const,
                  label: OP_SYMBOL[op],
                  name: "Mask B",
                  value: b,
                  onToggle: (p: number) => setB((x) => x ^ (1 << p)),
                },
              ]),
          { kind: "rule" },
          {
            kind: "bits",
            label: "=",
            name: "Result",
            value: result,
            tone: "result",
            highlight: changed,
          },
        ]}
      />
      <p className="text-body-sm text-muted-foreground text-pretty">
        <span className="font-mono font-medium text-foreground">
          {OP_SYMBOL[op]}
        </span>
        : {OP_RULE[op]}
        {!isShift && " Outlined result bits differ from A."}
      </p>
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-md bg-sunken px-3 py-2.5 font-mono text-[0.875rem]">
        <Digits base="hex" value={hex2(a)} prefix size="inherit" />
        <span className="text-muted-foreground">{OP_SYMBOL[op]}</span>
        {isShift ? (
          <span>{shift}</span>
        ) : (
          <Digits base="hex" value={hex2(b)} prefix size="inherit" />
        )}
        <span className="text-muted-foreground">=</span>
        <Digits base="hex" value={hex2(result)} prefix size="inherit" />
        <span className="text-muted-foreground">({result})</span>
      </p>
      <PresetButtons
        label="Recipes"
        onPick={(p: { op: BitOp; a: number; b: number }) => {
          setOp(p.op);
          setA(p.a);
          setB(p.b);
        }}
        presets={[
          {
            label: "Keep low nibble",
            value: { op: "and" as BitOp, a: 0xca, b: 0x0f },
          },
          {
            label: "Set bit 7",
            value: { op: "or" as BitOp, a: 0x2a, b: 0x80 },
          },
          {
            label: "'A' → 'a'",
            value: { op: "xor" as BitOp, a: 0x41, b: 0x20 },
            aria: "Toggle case: A XOR 0x20",
          },
          {
            label: "Network part",
            value: { op: "and" as BitOp, a: 0xa8, b: 0xc0 },
            aria: "168 AND mask 192",
          },
        ]}
      />
      <Live>
        Result {result.toString(2).padStart(8, "0")}, hex {hex2(result)},
        decimal {result}.
      </Live>
    </WidgetFrame>
  );
}

/* -------------------------------------------------------------------------- */
/*  Binary addition                                                           */
/* -------------------------------------------------------------------------- */

export function AdditionWidget() {
  const [a, setA] = React.useState(0b01011011);
  const [b, setB] = React.useState(0b00110110);
  const cols = addColumns(a, b, 8);
  const trueSum = a + b;
  return (
    <WidgetFrame title="Add with carries">
      <BitMatrix
        bits={8}
        caption="A plus B, column by column"
        rows={[
          { kind: "carry", label: "carry", carries: cols.carryIn },
          {
            kind: "bits",
            label: "A",
            name: "Operand A",
            value: a,
            onToggle: (p) => setA((x) => x ^ (1 << p)),
          },
          {
            kind: "bits",
            label: "+",
            name: "Operand B",
            value: b,
            onToggle: (p) => setB((x) => x ^ (1 << p)),
          },
          { kind: "rule" },
          {
            kind: "bits",
            label: "=",
            name: "Sum",
            value: cols.result,
            tone: "result",
          },
        ]}
      />
      <p className="rounded-md bg-sunken px-3 py-2.5 font-mono text-[0.875rem]">
        {a} + {b} = {trueSum}
        {cols.carryOut ? (
          <span className="text-warning">
            {" "}
            → carry out; 8 bits keep {cols.result}
          </span>
        ) : null}
      </p>
      <p className="text-body-sm text-muted-foreground text-pretty">
        {cols.carryOut
          ? `The sum needs 9 bits. An 8-bit register drops the carry out of bit 7 and keeps ${trueSum} − 256 = ${cols.result}: unsigned overflow. (Game questions always fit in 8 bits.)`
          : `Small 1s mark carries into the next column. ${cols.carryIn.filter(Boolean).length} carr${cols.carryIn.filter(Boolean).length === 1 ? "y" : "ies"} here; the result fits in 8 bits.`}
      </p>
      <Live>
        {a} plus {b} is {trueSum}
        {cols.carryOut ? `, which overflows 8 bits to ${cols.result}` : ""}.
      </Live>
    </WidgetFrame>
  );
}

/* -------------------------------------------------------------------------- */
/*  Colors & ASCII                                                            */
/* -------------------------------------------------------------------------- */

const CHANNELS = [
  { key: "r", name: "Red" },
  { key: "g", name: "Green" },
  { key: "b", name: "Blue" },
] as const;

export function ColorWidget() {
  const [rgb, setRgb] = React.useState<[number, number, number]>([
    0x3f, 0xa0, 0xc2,
  ]);
  const hex = rgbHex(...rgb);
  const id = React.useId();
  return (
    <WidgetFrame title="Mix a color">
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_11rem]">
        <div className="flex flex-col gap-4">
          {CHANNELS.map((c, i) => (
            <div key={c.key} className="flex flex-col gap-1">
              <Label
                htmlFor={`${id}-${c.key}`}
                className="flex items-baseline justify-between gap-3"
              >
                <span>{c.name}</span>
                <span className="flex items-baseline gap-3 font-mono text-[0.875rem]">
                  <Digits base="hex" value={hex2(rgb[i])} size="inherit" />
                  <span className="w-8 text-right text-foreground">
                    {rgb[i]}
                  </span>
                </span>
              </Label>
              <input
                id={`${id}-${c.key}`}
                type="range"
                min={0}
                max={255}
                value={rgb[i]}
                aria-valuetext={`${rgb[i]}, hex ${hex2(rgb[i])}`}
                onChange={(e) =>
                  setRgb((cur) => {
                    const next = [...cur] as [number, number, number];
                    next[i] = Number(e.target.value);
                    return next;
                  })
                }
                className="h-8 w-full cursor-pointer accent-[rgb(var(--foreground))] pointer-coarse:h-11"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <div
            aria-hidden
            className="h-24 rounded-md border border-foreground/15 shadow-xs md:h-full md:min-h-28"
            style={{ backgroundColor: hex }}
          />
          <p className="text-center font-mono text-[1rem] font-medium">
            <span className="text-muted-foreground">#</span>
            <span className="text-base-hex">{hex.slice(1)}</span>
          </p>
        </div>
      </div>
      <p className="flex flex-wrap gap-x-4 gap-y-1 rounded-md bg-sunken px-3 py-2.5 font-mono text-[0.8125rem]">
        {CHANNELS.map((c, i) => (
          <span key={c.key}>
            <span className="text-muted-foreground">
              {c.key.toUpperCase()}{" "}
            </span>
            {hex2(rgb[i])} = {Math.floor(rgb[i] / 16)}×16 + {rgb[i] % 16} ={" "}
            {rgb[i]}
          </span>
        ))}
      </p>
      <Live>
        Color {hex}: red {rgb[0]}, green {rgb[1]}, blue {rgb[2]}.
      </Live>
    </WidgetFrame>
  );
}

const ASCII_ROWS = [2, 3, 4, 5, 6, 7];

function asciiGlyph(code: number): string {
  if (code === 0x20) return "␠";
  if (code === 0x7f) return "DEL";
  return String.fromCharCode(code);
}

export function AsciiWidget() {
  const [ch, setCh] = React.useState("A");
  const id = React.useId();
  const code = asciiCode(ch);
  const partner = code === null ? null : casePartner(code);
  return (
    <WidgetFrame title="ASCII lookup">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <Label htmlFor={id}>Character</Label>
          <Input
            id={id}
            value={ch}
            maxLength={1}
            onChange={(e) => setCh(e.target.value.slice(-1))}
            aria-describedby={`${id}-msg`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="h-11 w-20 text-center font-mono text-[1.25rem]"
          />
        </div>
        {code !== null ? (
          <Readouts
            className="flex-1"
            items={[
              {
                label: "Hex",
                tag: <BaseTag base="hex" size="xs" />,
                value: (
                  <Digits base="hex" value={hex2(code)} prefix size="inherit" />
                ),
              },
              {
                label: "Decimal",
                tag: <BaseTag base="dec" size="xs" />,
                value: code,
              },
              {
                label: "Binary",
                tag: <BaseTag base="bin" size="xs" />,
                value: (
                  <Digits
                    base="bin"
                    value={code}
                    pad={8}
                    group
                    size="inherit"
                  />
                ),
              },
            ]}
          />
        ) : (
          <p id={`${id}-msg`} className="text-[0.8125rem] text-destructive">
            Type one printable ASCII character (space to ~).
          </p>
        )}
      </div>
      {code !== null && (
        <p id={`${id}-msg`} className="text-body-sm text-muted-foreground">
          {partner !== null ? (
            <>
              Flip bit 5 (XOR 0x20) and{" "}
              <span className="font-mono text-foreground">'{ch}'</span> becomes{" "}
              <span className="font-mono text-foreground">
                '{String.fromCharCode(partner)}'
              </span>{" "}
              ={" "}
              <Digits base="hex" value={hex2(partner)} prefix size="inherit" />.
            </>
          ) : (
            <>
              Row {code >> 4}, column {(code & 15).toString(16).toUpperCase()}{" "}
              of the table below.
            </>
          )}
        </p>
      )}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[34rem] border-collapse font-mono text-[0.8125rem]">
          <caption className="sr-only">
            Printable ASCII: the row is the high hex digit, the column the low
            hex digit.
          </caption>
          <thead>
            <tr className="border-b bg-sunken text-muted-foreground">
              <th scope="col" className="px-2 py-1.5 text-left font-normal">
                <span className="sr-only">High digit</span>
              </th>
              {Array.from({ length: 16 }, (_, lo) => (
                <th
                  key={lo}
                  scope="col"
                  className="px-1 py-1.5 text-center font-normal text-base-hex"
                >
                  {lo.toString(16).toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ASCII_ROWS.map((hi) => (
              <tr key={hi} className="border-b last:border-b-0">
                <th
                  scope="row"
                  className="px-2 py-1.5 text-left font-normal text-base-hex"
                >
                  {hi}_
                </th>
                {Array.from({ length: 16 }, (_, lo) => {
                  const c = hi * 16 + lo;
                  const anchor = ASCII_ANCHORS.some((a) => a.code === c);
                  const current = c === code;
                  return (
                    <td
                      key={lo}
                      aria-current={current ? "true" : undefined}
                      className={cn(
                        "px-1 py-1.5 text-center",
                        c === 0x7f && "text-[0.625rem] text-muted-foreground",
                        c === 0x20 && "text-muted-foreground",
                        anchor &&
                          "font-semibold underline decoration-border-strong underline-offset-4",
                        current && "bg-highlight/40 text-foreground",
                      )}
                    >
                      {asciiGlyph(c)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Live>
        {code === null ? "" : `'${ch}' is hex ${hex2(code)}, decimal ${code}.`}
      </Live>
    </WidgetFrame>
  );
}
