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
 * EmptyState — every list, table and history view needs one. Says what would
 * be here, why it is empty, and the single next step.
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
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border-strong text-center",
        size === "md" ? "gap-4 px-6 py-14" : "gap-3 px-4 py-8",
        className,
      )}
      {...props}
    >
      {icon && (
        <div
          aria-hidden
          className="grid size-11 place-items-center rounded-lg border bg-card text-muted-foreground shadow-xs [&_svg]:size-5"
        >
          {icon}
        </div>
      )}
      <div className="flex max-w-sm flex-col gap-1.5">
        <h3 className="text-title-sm font-semibold text-foreground">{title}</h3>
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
        <p className="hidden items-center gap-1.5 text-[0.75rem] text-muted-foreground pointer-fine:flex">
          {hint}
        </p>
      )}
    </div>
  ),
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
