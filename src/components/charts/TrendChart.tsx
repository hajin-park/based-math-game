import { useEffect, useId, useMemo, useRef, useState } from "react";

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
 * A single-series line chart in plain SVG: 2px ink line, recessive grid,
 * crosshair + tooltip on hover/touch, arrow-key navigation, and the latest
 * point marked in the accent. Drawn in pixel space (measured width) so lines
 * stay crisp at every size.
 */
export function TrendChart({
  points,
  label,
  formatValue,
  unit,
  formatDate,
  height = 168,
  className,
}: TrendChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const titleId = useId();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pad = { top: 12, right: 12, bottom: 24, left: 36 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const max = useMemo(
    () => niceMax(Math.max(...points.map((p) => p.value), 0) * 1.08),
    [points],
  );
  const ticks = [0, max / 2, max];
  const x = (i: number) =>
    pad.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;

  const path = points
    .map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join("");

  const pick = (clientX: number) => {
    const el = wrapRef.current;
    if (!el || !points.length) return;
    const rect = el.getBoundingClientRect();
    const rel = clientX - rect.left - pad.left;
    const i =
      points.length <= 1 ? 0 : Math.round((rel / Math.max(1, innerW)) * (points.length - 1));
    setActive(Math.min(points.length - 1, Math.max(0, i)));
  };

  const last = points.length - 1;
  const shown = active ?? null;
  const tipLeft = shown !== null ? x(shown) : 0;
  const flip = shown !== null && tipLeft > width - 150;

  return (
    <figure className={cn("relative flex flex-col gap-2", className)}>
      <div
        ref={wrapRef}
        className="relative w-full touch-pan-y select-none rounded-md focus-visible:outline-offset-4"
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
            ? `. ${points.length} runs, from ${formatValue(points[0].value)} to ${formatValue(points[last].value)}${unit ?? ""}. Use arrow keys to read each run.`
            : ""}
        </span>
        {width > 0 && (
          <svg width={width} height={height} aria-hidden className="block overflow-visible">
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={pad.left}
                  x2={width - pad.right}
                  y1={y(t)}
                  y2={y(t)}
                  className={t === 0 ? "stroke-border-strong" : "stroke-border"}
                  strokeWidth={1}
                  shapeRendering="crispEdges"
                />
                <text
                  x={pad.left - 8}
                  y={y(t)}
                  dy="0.32em"
                  textAnchor="end"
                  className="fill-muted-foreground font-mono text-[10px] tabular-nums"
                >
                  {Number(t.toFixed(1))}
                </text>
              </g>
            ))}
            {points.length > 0 && (
              <>
                <text
                  x={x(0)}
                  y={height - 6}
                  textAnchor={points.length > 1 ? "start" : "middle"}
                  className="fill-muted-foreground text-[10px]"
                >
                  {formatDate(points[0].at)}
                </text>
                {points.length > 1 && (
                  <text
                    x={x(last)}
                    y={height - 6}
                    textAnchor="end"
                    className="fill-muted-foreground text-[10px]"
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
                className="stroke-border-strong"
                strokeWidth={1}
                shapeRendering="crispEdges"
              />
            )}
            <path
              d={path}
              fill="none"
              className="stroke-foreground/80"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {points.length > 0 && (
              <circle
                cx={x(last)}
                cy={y(points[last].value)}
                r={4}
                className="fill-primary stroke-card"
                strokeWidth={2}
              />
            )}
            {shown !== null && (
              <circle
                cx={x(shown)}
                cy={y(points[shown].value)}
                r={4.5}
                className="fill-card stroke-foreground"
                strokeWidth={2}
              />
            )}
          </svg>
        )}
        {shown !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 min-w-32 rounded-md border bg-popover px-3 py-2 shadow-lg"
            style={{
              left: tipLeft,
              transform: `translateX(${flip ? "calc(-100% - 10px)" : "10px"})`,
            }}
          >
            <p className="font-mono text-[0.9375rem] font-medium tabular-nums text-foreground">
              {formatValue(points[shown].value)}
              {unit && (
                <span className="ml-0.5 text-[0.75rem] text-muted-foreground">
                  {unit}
                </span>
              )}
            </p>
            {points[shown].detail && (
              <p className="whitespace-nowrap text-[0.75rem] text-foreground">
                {points[shown].detail}
              </p>
            )}
            <p className="whitespace-nowrap text-[0.75rem] text-muted-foreground">
              {formatDate(points[shown].at)}
            </p>
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {shown !== null
          ? `${formatValue(points[shown].value)}${unit ?? ""}, ${points[shown].detail ?? ""}, ${formatDate(points[shown].at)}`
          : ""}
      </p>
    </figure>
  );
}
