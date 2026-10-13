import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

export interface TrendPoint {
  /** x label source (ms timestamp). */
  at: number;
  value: number;
  /** Tooltip line under the value, e.g. the mode name. */
  detail?: string;
}

interface TrendChartProps {
  points: TrendPoint[];
  /** Accessible name, e.g. "Correct answers per minute, last 30 runs". */
  label: string;
  /** Formats a value for ticks and the tooltip ("12.4"). */
  formatValue: (v: number) => string;
  /** Unit after values in the tooltip ("/min"). */
  unit?: string;
  formatDate: (ms: number) => string;
  /**
   * Circle each point that beat every earlier point (a new best) in red pen.
   * Off by default.
   */
  markBests?: boolean;
  height?: number;
  className?: string;
}

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (m * exp >= v) return m * exp;
  }
  return 10 * exp;
}

/**
 * A small red-pen loop around a plotted point, in pixel space: two tilted
 * arcs that overshoot where they started, like a quick circle by hand.
 */
function penLoop(cx: number, cy: number, rx = 10, ry = 7.5): string {
  const f = (n: number) => n.toFixed(1);
  const k = 0.55;
  const p = (dx: number, dy: number) => `${f(cx + dx)},${f(cy + dy)}`;
  // Counter-clockwise from just left of the top, round past the start.
  return [
    `M${p(-2, -ry)}`,
    `C${p(-2 - rx * k, -ry)} ${p(-rx, -ry * k)} ${p(-rx, 0.4)}`,
    `C${p(-rx, ry * k)} ${p(-rx * k, ry + 0.5)} ${p(0.5, ry + 0.5)}`,
    `C${p(rx * k, ry + 0.5)} ${p(rx + 0.6, ry * k)} ${p(rx + 0.6, -0.6)}`,
    `C${p(rx + 0.6, -ry * k)} ${p(rx * k - 1, -ry - 1.4)} ${p(-5.5, -ry - 0.6)}`,
  ].join(" ");
}

/**
 * A single-series plot on graph paper: hairline axes, typewriter ticks, an
 * ink line, and (optionally) each new best circled in red pen. Crosshair +
 * slip on hover/touch, arrow-key navigation. Drawn in pixel space (measured
 * width) so lines stay crisp at every size.
 */
export function TrendChart({
  points,
  label,
  formatValue,
  unit,
  formatDate,
  markBests = false,
  height = 200,
  className,
}: TrendChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const titleId = useId();
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pad = { top: 14, right: 14, bottom: 28, left: 40 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const max = useMemo(
    () => niceMax(Math.max(...points.map((p) => p.value), 0) * 1.08),
    [points],
  );
  const ticks = [0, max / 4, max / 2, (max * 3) / 4, max];
  const x = (i: number) =>
    pad.left +
    (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;

  const path = points
    .map(
      (p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`,
    )
    .join("");

  // Indices of new bests (each point strictly above every earlier one).
  const bests = useMemo(() => {
    if (!markBests) return [];
    const out: number[] = [];
    let best = -Infinity;
    points.forEach((p, i) => {
      if (p.value > best) {
        if (i > 0) out.push(i);
        best = p.value;
      }
    });
    return out;
  }, [points, markBests]);

  const pick = (clientX: number) => {
    const el = wrapRef.current;
    if (!el || !points.length) return;
    const rect = el.getBoundingClientRect();
    const rel = clientX - rect.left - pad.left;
    const i =
      points.length <= 1
        ? 0
        : Math.round((rel / Math.max(1, innerW)) * (points.length - 1));
    setActive(Math.min(points.length - 1, Math.max(0, i)));
  };

  const last = points.length - 1;
  const shown = active ?? null;
  const tipLeft = shown !== null ? x(shown) : 0;
  const flip = shown !== null && tipLeft > width - 160;
  const isBest = (i: number) => bests.includes(i);

  return (
    <figure className={cn("relative flex flex-col gap-2", className)}>
      <div
        ref={wrapRef}
        className="relative w-full touch-pan-y select-none focus-visible:outline-offset-4"
        style={{ height }}
        role="img"
        aria-labelledby={titleId}
        tabIndex={points.length ? 0 : -1}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={() => setActive(null)}
        onBlur={() => setActive(null)}
        onKeyDown={(e) => {
          if (!points.length) return;
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            const d = e.key === "ArrowLeft" ? -1 : 1;
            setActive((cur) =>
              Math.min(last, Math.max(0, (cur ?? (d < 0 ? last + 1 : -1)) + d)),
            );
          } else if (e.key === "Home") setActive(0);
          else if (e.key === "End") setActive(last);
          else if (e.key === "Escape") setActive(null);
        }}
      >
        <span id={titleId} className="sr-only">
          {label}
          {points.length
            ? `. ${points.length} runs, from ${formatValue(points[0].value)} to ${formatValue(points[last].value)}${unit ?? ""}.${bests.length ? ` ${bests.length} new ${bests.length === 1 ? "best" : "bests"} along the way.` : ""} Use arrow keys to read each run.`
            : ""}
        </span>
        {width > 0 && (
          <>
            {/* Graph paper under the plot area only. */}
            <div
              aria-hidden
              className="grid-paper absolute"
              style={{
                left: pad.left,
                top: pad.top,
                width: innerW,
                height: innerH,
              }}
            />
            <svg
              width={width}
              height={height}
              aria-hidden
              className="relative block overflow-visible"
            >
              {/* Axes */}
              <line
                x1={pad.left}
                x2={pad.left}
                y1={pad.top}
                y2={pad.top + innerH}
                className="stroke-foreground/60"
                strokeWidth={1}
                shapeRendering="crispEdges"
              />
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={pad.top + innerH}
                y2={pad.top + innerH}
                className="stroke-foreground/60"
                strokeWidth={1}
                shapeRendering="crispEdges"
              />
              {ticks.map((t, i) => (
                <g key={t}>
                  <line
                    x1={pad.left - 4}
                    x2={pad.left}
                    y1={y(t)}
                    y2={y(t)}
                    className="stroke-foreground/60"
                    strokeWidth={1}
                    shapeRendering="crispEdges"
                  />
                  {i % 2 === 0 && (
                    <text
                      x={pad.left - 8}
                      y={y(t)}
                      dy="0.32em"
                      textAnchor="end"
                      className="fill-muted-foreground font-mono text-[11px] tabular-nums"
                    >
                      {Number(t.toFixed(1))}
                    </text>
                  )}
                </g>
              ))}
              {points.length > 0 && (
                <>
                  <text
                    x={x(0)}
                    y={height - 8}
                    textAnchor={points.length > 1 ? "start" : "middle"}
                    className="fill-muted-foreground font-mono text-[11px]"
                  >
                    {formatDate(points[0].at)}
                  </text>
                  {points.length > 1 && (
                    <text
                      x={x(last)}
                      y={height - 8}
                      textAnchor="end"
                      className="fill-muted-foreground font-mono text-[11px]"
                    >
                      {formatDate(points[last].at)}
                    </text>
                  )}
                </>
              )}
              {shown !== null && (
                <line
                  x1={x(shown)}
                  x2={x(shown)}
                  y1={pad.top}
                  y2={pad.top + innerH}
                  className="stroke-primary/60"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  shapeRendering="crispEdges"
                />
              )}
              <path
                d={path}
                fill="none"
                className="stroke-foreground"
                strokeWidth={1.75}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={x(i)}
                  cy={y(p.value)}
                  r={points.length > 20 ? 1.75 : 2.25}
                  className="fill-foreground"
                />
              ))}
              {bests.map((i, n) => (
                <path
                  key={`best-${i}`}
                  d={penLoop(x(i), y(points[i].value))}
                  pathLength={1}
                  strokeWidth={1.6}
                  className="animate-pen-draw fill-none stroke-pen [stroke-dasharray:1] [stroke-linecap:round]"
                  style={
                    reduce
                      ? { strokeDashoffset: 0, animation: "none" }
                      : {
                          strokeDashoffset: 1,
                          animation: `pen-draw 420ms cubic-bezier(0.65,0,0.35,1) ${200 + n * 90}ms both`,
                        }
                  }
                />
              ))}
              {shown !== null && (
                <circle
                  cx={x(shown)}
                  cy={y(points[shown].value)}
                  r={4.5}
                  className="fill-card stroke-foreground"
                  strokeWidth={1.75}
                />
              )}
            </svg>
          </>
        )}
        {shown !== null && (
          <div
            className="paper-sheet pointer-events-none absolute top-0 z-10 min-w-36 rounded-sm px-3 py-2"
            style={{
              left: tipLeft,
              transform: `translateX(${flip ? "calc(-100% - 10px)" : "10px"})`,
            }}
          >
            <p className="font-mono text-mono-md font-medium tabular-nums text-foreground">
              {formatValue(points[shown].value)}
              {unit && (
                <span className="ml-0.5 text-[0.75rem] text-muted-foreground">
                  {unit}
                </span>
              )}
              {isBest(shown) && (
                <span className="smallcaps ml-2 text-[0.875rem] text-pen">
                  new best
                </span>
              )}
            </p>
            {points[shown].detail && (
              <p className="whitespace-nowrap font-sans text-[0.75rem] text-foreground">
                {points[shown].detail}
              </p>
            )}
            <p className="whitespace-nowrap font-mono text-[0.75rem] text-muted-foreground">
              {formatDate(points[shown].at)}
            </p>
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {shown !== null
          ? `${formatValue(points[shown].value)}${unit ?? ""}${isBest(shown) ? ", a new best" : ""}, ${points[shown].detail ?? ""}, ${formatDate(points[shown].at)}`
          : ""}
      </p>
    </figure>
  );
}
