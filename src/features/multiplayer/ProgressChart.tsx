import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ProgressSeries {
  uid: string;
  name: string;
  you: boolean;
  /** marks[k] = ms at which point k + 1 was reached. */
  marks: number[];
  /** Where the line stops (finish time, or the end of the round). */
  endMs: number;
}

/**
 * Inks by seat (fixed order, never by rank): the player is always solid black
 * ink (white chalk at night); the others take the book's printing inks (teal,
 * moss, plum, ochre) in join order, then pencil. Each line also gets its own
 * dash, so the lines stay apart without colour.
 */
const SERIES_COLORS = [
  "rgb(var(--chart-2))",
  "rgb(var(--chart-3))",
  "rgb(var(--chart-4))",
  "rgb(var(--chart-5))",
];
const SERIES_DASHES = ["6 3", "2 3", "9 3 2 3", "1 0"];
const OVERFLOW_COLOR = "rgb(var(--muted-foreground) / 0.7)";
const YOU_COLOR = "rgb(var(--foreground))";

function niceStep(range: number, target: number): number {
  const raw = range / Math.max(1, target);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry.contentRect.width)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function scoreAt(marks: number[], t: number): number {
  let n = 0;
  while (n < marks.length && marks[n] <= t) n++;
  return n;
}

/**
 * Score progression: cumulative points over time, one step line per player.
 * Inline SVG (no chart library). Legend always shown; up to four lines are
 * also labelled at their end. Hover / touch shows everyone's score at that
 * second. The standings table beside it carries the same data as text.
 */
export function ProgressChart({
  series,
  yMax,
  durationMs,
  unit,
  className,
}: {
  series: ProgressSeries[];
  /** Top of the y axis (speedrun target; otherwise the best score). */
  yMax: number;
  durationMs: number;
  unit: string;
  className?: string;
}) {
  const titleId = useId();
  const [box, width] = useWidth<HTMLDivElement>();
  const [hoverMs, setHoverMs] = useState<number | null>(null);

  const colored = useMemo(() => {
    let i = 0;
    return series.map((s) => {
      if (s.you) return { ...s, color: YOU_COLOR, dash: undefined };
      const k = i++;
      return {
        ...s,
        color: k < SERIES_COLORS.length ? SERIES_COLORS[k] : OVERFLOW_COLOR,
        dash: SERIES_DASHES[k % SERIES_DASHES.length],
      };
    });
  }, [series]);

  const height = 220;
  const labelled = colored.length <= 4;
  const pad = {
    top: 12,
    right: labelled && width > 420 ? 96 : 14,
    bottom: 28,
    left: 34,
  };
  const w = Math.max(0, width - pad.left - pad.right);
  const h = height - pad.top - pad.bottom;
  const top = Math.max(1, yMax);
  const total = Math.max(1000, durationMs);
  const x = (ms: number) => pad.left + (Math.min(ms, total) / total) * w;
  const y = (v: number) => pad.top + h - (v / top) * h;
  const yStep = Math.max(1, Math.round(niceStep(top, 4)));
  const xStep = niceStep(total / 1000, width < 420 ? 4 : 8) * 1000;

  const path = (s: (typeof colored)[number]) => {
    let d = `M${x(0)},${y(0)}`;
    s.marks.forEach((t, k) => {
      d += `H${x(t)}V${y(k + 1)}`;
    });
    return d + `H${x(Math.max(s.endMs, s.marks[s.marks.length - 1] ?? 0))}`;
  };

  // Spread end labels so they never overlap.
  const labels = useMemo(() => {
    if (!labelled) return [];
    const placed = colored
      .map((s) => ({ s, y: y(s.marks.length) }))
      .sort((a, b) => a.y - b.y);
    for (let i = 1; i < placed.length; i++)
      if (placed[i].y - placed[i - 1].y < 14)
        placed[i].y = placed[i - 1].y + 14;
    return placed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colored, labelled, width, top]);

  const onPointer = (clientX: number, target: SVGSVGElement) => {
    const r = target.getBoundingClientRect();
    const px = clientX - r.left - pad.left;
    if (px < 0 || px > w) return setHoverMs(null);
    setHoverMs((px / w) * total);
  };

  const summary = colored
    .map((s) => `${s.name}${s.you ? " (you)" : ""}: ${s.marks.length} ${unit}`)
    .join("; ");

  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <div ref={box} className="relative w-full">
        {width > 0 && (
          <div
            aria-hidden
            className="grid-paper pointer-events-none absolute"
            style={{
              left: pad.left,
              top: pad.top,
              width: w,
              height: h,
            }}
          />
        )}
        {width > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-labelledby={titleId}
            className="relative block touch-pan-y select-none"
            onPointerMove={(e) => onPointer(e.clientX, e.currentTarget)}
            onPointerDown={(e) => onPointer(e.clientX, e.currentTarget)}
            onPointerLeave={() => setHoverMs(null)}
          >
            <title id={titleId}>{`Score over time. ${summary}.`}</title>
            {/* Recessive grid and axes */}
            {Array.from(
              { length: Math.floor(top / yStep) + 1 },
              (_, i) => i * yStep,
            ).map((v) => (
              <g key={`y${v}`}>
                <line
                  x1={pad.left - 4}
                  x2={pad.left}
                  y1={y(v)}
                  y2={y(v)}
                  stroke="rgb(var(--foreground) / 0.6)"
                  strokeWidth={1}
                />
                <text
                  x={pad.left - 8}
                  y={y(v)}
                  dy="0.32em"
                  textAnchor="end"
                  className="fill-muted-foreground font-mono text-[10px]"
                >
                  {v}
                </text>
              </g>
            ))}
            {Array.from(
              { length: Math.floor(total / xStep) + 1 },
              (_, i) => i * xStep,
            ).map((t) => (
              <g key={`x${t}`}>
                <line
                  x1={x(t)}
                  x2={x(t)}
                  y1={pad.top + h}
                  y2={pad.top + h + 4}
                  stroke="rgb(var(--foreground) / 0.6)"
                  strokeWidth={1}
                />
                <text
                  x={x(t)}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-muted-foreground font-mono text-[10px]"
                >
                  {Math.round(t / 1000)} s
                </text>
              </g>
            ))}
            {/* Axes: two hairlines in ink */}
            <path
              d={`M${pad.left},${pad.top}V${pad.top + h}H${pad.left + w}`}
              fill="none"
              stroke="rgb(var(--foreground) / 0.7)"
              strokeWidth={1}
              shapeRendering="crispEdges"
            />

            {/* Others first, the player's own line on top */}
            {[...colored]
              .sort((a, b) => Number(a.you) - Number(b.you))
              .map((s) => (
                <path
                  key={s.uid}
                  d={path(s)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={s.you ? 2.5 : 1.75}
                  strokeDasharray={s.dash}
                  strokeLinejoin="round"
                  strokeLinecap={s.dash ? "butt" : "round"}
                />
              ))}

            {labels.map(({ s, y: ly }) => (
              <text
                key={`l${s.uid}`}
                x={pad.left + w + 8}
                y={ly}
                dy="0.32em"
                className={cn(
                  "fill-foreground font-sans text-[11px]",
                  s.you && "font-bold",
                  width <= 420 && "hidden",
                )}
              >
                {s.name.length > 12 ? `${s.name.slice(0, 11)}…` : s.name}{" "}
                {s.marks.length}
              </text>
            ))}

            {hoverMs !== null && (
              <line
                x1={x(hoverMs)}
                x2={x(hoverMs)}
                y1={pad.top}
                y2={pad.top + h}
                stroke="rgb(var(--foreground) / 0.35)"
                strokeWidth={1}
              />
            )}
          </svg>
        )}
        {hoverMs !== null && width > 0 && (
          <div
            aria-hidden
            className="paper-sheet pointer-events-none absolute top-2 z-10 min-w-36 rounded-sm px-3 py-2 font-sans text-[0.75rem]"
            style={{
              left: Math.min(Math.max(0, x(hoverMs) + 10), width - 160),
            }}
          >
            <p className="mb-1 font-mono text-muted-foreground">
              {(hoverMs / 1000).toFixed(1)} s
            </p>
            {colored.map((s) => (
              <p key={s.uid} className="flex items-center gap-2">
                <Swatch color={s.color} dash={s.dash} you={s.you} />
                <span className="flex-1 truncate">{s.name}</span>
                <span className="font-mono tabular-nums">
                  {scoreAt(s.marks, hoverMs)}
                </span>
              </p>
            ))}
          </div>
        )}
      </div>
      <figcaption>
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 font-sans text-[0.8125rem]">
          {colored.map((s) => (
            <li key={s.uid} className="flex items-center gap-1.5">
              <Swatch color={s.color} dash={s.dash} you={s.you} />
              <span className={cn(s.you && "font-bold")}>
                {s.name}
                {s.you && " (you)"}
              </span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

/** A short sample of a series' line for the legend and the hover slip. */
function Swatch({
  color,
  dash,
  you,
}: {
  color: string;
  dash?: string;
  you: boolean;
}) {
  return (
    <svg aria-hidden width="18" height="6" className="shrink-0">
      <line
        x1="1"
        x2="17"
        y1="3"
        y2="3"
        stroke={color}
        strokeWidth={you ? 2.5 : 1.75}
        strokeDasharray={dash}
      />
    </svg>
  );
}
