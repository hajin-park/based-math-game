import * as React from "react";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { cn } from "@/lib/utils";
import {
  BASES,
  BASE_ORDER,
  formatInBase,
  groupDigits,
  placeValue,
  widthForBits,
  type BaseKey,
} from "@/lib/bases";
import { BaseTag } from "@/components/ui/base-tag";

const DEFAULT_SEQUENCE = [
  42, 255, 128, 7, 173, 64, 200, 19, 99, 240, 1, 170, 85, 31,
];

const SIZES = {
  sm: {
    root: "text-[1rem]",
    row: "gap-3 py-1.5",
    tag: "sm" as const,
    tagCol: "w-9 pt-[calc(0.6em-0.625rem)]",
  },
  md: {
    root: "text-[1.5rem]",
    row: "gap-4 py-2.5",
    tag: "sm" as const,
    tagCol: "w-11 pt-[calc(0.6em-0.625rem)]",
  },
  lg: {
    root: "text-[clamp(1.625rem,0.9rem+2.9vw,2.625rem)]",
    row: "gap-4 py-3 sm:gap-6 sm:py-3.5",
    tag: "md" as const,
    tagCol: "w-12 pt-[calc(0.6em-0.75rem)] sm:w-24",
  },
};

export interface BaseOdometerProps {
  /** Controlled value. */
  value?: number;
  /** Uncontrolled starting value (default 42). */
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Word width; drives zero-padding of every row. Default 8. */
  bits?: number;
  /** Rows to show, in order. Default BIN, OCT, DEC, HEX. */
  bases?: BaseKey[];
  /** Cycle through `sequence` every N ms (true = 2600ms). Pausable. */
  autoPlay?: boolean | number;
  sequence?: number[];
  /** Binary digits become toggle buttons ("flip a bit"). */
  interactive?: boolean;
  /** Show place-value weights under the binary row. */
  placeValues?: boolean;
  size?: keyof typeof SIZES;
  /** Header strip with caption + play/pause. Default true for lg. */
  header?: boolean;
  caption?: React.ReactNode;
  /** Show the base's full name under its tag (default: lg only). */
  names?: boolean;
  /** Footer hint (shown on fine pointers for interactive odometers). */
  hint?: React.ReactNode;
  className?: string;
}

/** One rolling digit. The strip is decorative; text is exposed per row. */
function Wheel({
  digit,
  alphabet,
  delay,
  dim,
}: {
  digit: string;
  alphabet: string;
  delay: number;
  dim?: boolean;
}) {
  const index = Math.max(0, alphabet.indexOf(digit));
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-block h-[1.2em] overflow-hidden transition-opacity duration-slow",
        dim && "opacity-30",
      )}
    >
      <span
        className="flex flex-col transition-transform duration-slow ease-spring will-change-transform"
        style={{
          transform: `translateY(${-index * 1.2}em)`,
          transitionDelay: `${delay}ms`,
        }}
      >
        {alphabet.split("").map((c) => (
          <span key={c} className="block h-[1.2em] leading-[1.2em]">
            {c}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * BaseOdometer — the signature element: one number shown simultaneously in
 * BIN / OCT / DEC / HEX, base-coloured, with digits that roll like a
 * mechanical counter. Least-significant digits align in one column.
 *
 *   <BaseOdometer size="lg" autoPlay interactive placeValues />
 *   <BaseOdometer value={404} bits={12} bases={["bin","hex"]} size="md" />
 */
export function BaseOdometer({
  value: controlled,
  defaultValue = 42,
  onValueChange,
  bits = 8,
  bases = BASE_ORDER,
  autoPlay = false,
  sequence = DEFAULT_SEQUENCE,
  interactive = false,
  placeValues = false,
  size = "md",
  header,
  caption,
  names,
  hint,
  className,
}: BaseOdometerProps) {
  const showNames = names ?? size === "lg";
  const reduceMotion = useReducedMotion();
  const [internal, setInternal] = React.useState(defaultValue);
  const value = controlled ?? internal;
  const max = 2 ** bits - 1;
  const n = Math.min(Math.max(0, Math.trunc(value)), max);

  const setValue = React.useCallback(
    (next: number) => {
      if (controlled === undefined) setInternal(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );

  // ---- autoplay (pausable; off by default under reduced motion) ----------
  const interval = typeof autoPlay === "number" ? autoPlay : 2600;
  const [playing, setPlaying] = React.useState(Boolean(autoPlay));
  const [visible, setVisible] = React.useState(true);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const stepRef = React.useRef(0);

  React.useEffect(() => {
    if (reduceMotion) setPlaying(false);
  }, [reduceMotion]);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    if (!autoPlay || !playing || !visible) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      stepRef.current = (stepRef.current + 1) % sequence.length;
      setValue(sequence[stepRef.current] & max);
    }, interval);
    return () => window.clearInterval(id);
  }, [autoPlay, playing, visible, interval, sequence, max, setValue]);

  const flipBit = (position: number) => {
    setPlaying(false);
    setValue(n ^ (1 << position));
  };

  const s = SIZES[size];
  const showHeader = header ?? size === "lg";
  const summary = bases
    .map((b) => `${BASES[b].name} ${formatInBase(n, b, widthForBits(bits, b))}`)
    .join(", ");

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border bg-card/90 shadow-md backdrop-blur-[1px]",
        className,
      )}
    >
      {showHeader && (
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5 sm:px-5">
          <p className="eyebrow flex items-center gap-2">
            <span
              aria-hidden
              className={cn(
                "inline-block size-1.5 rounded-full bg-primary",
                playing && visible && "motion-safe:animate-pulse",
              )}
            />
            {caption ?? `${bits}-bit word`}
          </p>
          {autoPlay && (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={
                playing ? "Pause number animation" : "Play number animation"
              }
              className="-mr-1.5 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-fast hover:bg-accent hover:text-foreground pointer-coarse:size-11 [&_svg]:size-3.5"
            >
              {playing ? <Pause /> : <Play />}
            </button>
          )}
        </div>
      )}

      <p className="sr-only" aria-live={interactive ? "polite" : "off"}>
        {summary}
      </p>

      <div
        className={cn(
          "px-4 font-mono font-medium tabular-nums leading-none sm:px-5 [font-stretch:87.5%]",
          s.root,
        )}
      >
        {bases.map((b, rowIndex) => {
          const meta = BASES[b];
          const width = widthForBits(bits, b);
          const digits = formatInBase(n, b, width);
          const firstSig = Math.min(
            digits.search(/[^0]/) === -1 ? width - 1 : digits.search(/[^0]/),
            width - 1,
          );
          // Nibbles always; hex bytes only when the width splits evenly;
          // octal/decimal stay ungrouped at word widths.
          const groupSize =
            b === "bin" ? 4 : b === "hex" && width % 2 === 0 ? 2 : 0;
          const groups = groupDigits(digits, groupSize);
          const isBin = b === "bin";
          let i = 0;
          return (
            <div
              key={b}
              className={cn(
                "flex items-start justify-between",
                s.row,
                rowIndex > 0 && "border-t border-dashed",
              )}
            >
              <div
                className={cn(
                  "flex shrink-0 flex-col items-start gap-1.5",
                  s.tagCol,
                )}
              >
                <BaseTag base={b} size={s.tag} showRadix />
                {showNames && (
                  <span className="hidden font-sans text-[0.75rem] font-normal leading-none tracking-normal text-muted-foreground [font-stretch:100%] sm:block">
                    {meta.name}
                  </span>
                )}
              </div>
              <div className={cn("flex items-start", meta.text)} data-numeric>
                {groups.map((g, gi) => (
                  <span
                    key={gi}
                    className={cn("flex items-start", gi > 0 && "ml-[0.4ch]")}
                  >
                    {g.split("").map(() => {
                      const di = i++;
                      const position = width - 1 - di;
                      const digit = digits[di];
                      const delay = reduceMotion ? 0 : position * 22;
                      const wheel = (
                        <Wheel
                          digit={digit}
                          alphabet={meta.alphabet}
                          delay={delay}
                          dim={di < firstSig}
                        />
                      );
                      const pv =
                        isBin && placeValues ? placeValue(2, position) : null;
                      const weight = pv && (
                        <span
                          aria-hidden
                          className="mt-1.5 flex flex-col items-center gap-1 font-mono text-[max(0.26em,0.5625rem)] font-normal leading-none text-muted-foreground [font-stretch:87.5%]"
                        >
                          <span className="flex h-2 items-start">
                            <span
                              className={cn(
                                "w-px bg-border-strong",
                                position % 4 === 3 ? "h-2" : "h-1",
                              )}
                            />
                          </span>
                          {pv.kind === "weight" ? (
                            pv.text
                          ) : (
                            <span>
                              2<sup>{pv.exp}</sup>
                            </span>
                          )}
                        </span>
                      );
                      if (isBin && interactive) {
                        const on = digit === "1";
                        return (
                          <button
                            key={di}
                            type="button"
                            aria-pressed={on}
                            aria-label={`Bit ${position}, worth ${2 ** position}`}
                            onClick={() => flipBit(position)}
                            className="group/bit -mx-[0.04em] flex flex-col items-center rounded-[4px] px-[0.04em] transition-colors duration-fast hover:bg-base-bin/10 focus-visible:outline-offset-0"
                          >
                            {wheel}
                            {weight}
                          </button>
                        );
                      }
                      return (
                        <span key={di} className="flex flex-col items-center">
                          {wheel}
                          {weight}
                        </span>
                      );
                    })}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {hint && (
        <div className="hidden items-center justify-between gap-3 border-t px-4 py-2.5 text-[0.75rem] text-muted-foreground pointer-fine:flex sm:px-5">
          {hint}
        </div>
      )}
    </div>
  );
}
