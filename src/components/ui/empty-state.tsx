import * as React from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** A lucide icon element, or a <Digits>/<BaseTag> for flavour. */
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** One primary action (and optionally one secondary). */
  action?: React.ReactNode;
  /** Optional keyboard hint, e.g. <>Press <Kbd>N</Kbd> to create</>. */
  hint?: React.ReactNode;
  size?: "sm" | "md";
}

/**
 * EmptyState — a page with nothing written on it yet. Ruled top and bottom,
 * an italic note in the middle, and the single next step.
 *
 *   <EmptyState icon={<History />} title="No games yet"
 *     description="Finish a sprint and your scores appear here."
 *     action={<Button asChild><Link to="/play">Start a sprint</Link></Button>} />
 */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      hint,
      size = "md",
      className,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center border-y border-foreground/15 text-center",
        size === "md" ? "gap-4 px-6 py-14" : "gap-3 px-4 py-8",
        className,
      )}
      {...props}
    >
      {icon && (
        <div aria-hidden className="text-muted-foreground [&_svg]:size-6">
          {icon}
        </div>
      )}
      <div className="flex max-w-sm flex-col gap-1.5">
        <h3 className="font-serif text-title-sm font-normal italic text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-body-sm text-muted-foreground text-pretty">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {action}
        </div>
      )}
      {hint && (
        <p className="hidden items-center gap-1.5 font-sans text-[0.8125rem] text-muted-foreground pointer-fine:flex">
          {hint}
        </p>
      )}
    </div>
  ),
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
