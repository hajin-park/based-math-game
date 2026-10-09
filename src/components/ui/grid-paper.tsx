import * as React from "react";

import { cn } from "@/lib/utils";

export interface GridPaperProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Minor cell size in px (major lines every 5 cells). Default 8. */
  cell?: number;
  /** Fade the grid out towards the edges (radial mask). */
  fade?: boolean;
}

/**
 * GridPaper — graph-paper texture. Use on the hero and on game surfaces only
 * (never behind body copy). Renders an absolutely positioned, decorative
 * layer; put it inside a `relative` parent.
 *
 *   <section className="relative">
 *     <GridPaper fade />
 *     …content…
 *   </section>
 */
const GridPaper = React.forwardRef<HTMLDivElement, GridPaperProps>(
  ({ cell = 8, fade = false, className, style, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "grid-paper pointer-events-none absolute inset-0 -z-10",
        fade && "mask-fade-edges",
        className,
      )}
      style={{ ["--cell" as string]: `${cell}px`, ...style }}
      {...props}
    />
  ),
);
GridPaper.displayName = "GridPaper";

export { GridPaper };
