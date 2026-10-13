import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const titleVariants = cva(
  "font-serif font-bold text-foreground text-balance [&_em]:italic",
  {
    variants: {
      size: {
        sm: "text-headline",
        md: "text-display-lg",
        lg: "text-display-xl",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface PageHeaderProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, "title">,
    VariantProps<typeof titleVariants> {
  /**
   * The running head: the small-caps line printed across the top of the page
   * above a rule ("Contents", "Daily · 13 Oct 2026"). Optional; leave it out
   * when it would only repeat the title.
   */
  eyebrow?: React.ReactNode;
  /** Right side of the running head (a folio, a date, a count). */
  folio?: React.ReactNode;
  /** Section number set in the spot colour before the title ("2.3", "§"). */
  number?: React.ReactNode;
  /** The page's h1. <em> sets a word in italic (never in colour). */
  title: React.ReactNode;
  /** One or two sentences. */
  lede?: React.ReactNode;
  /** Buttons, right-aligned on desktop, stacked under the lede on mobile. */
  actions?: React.ReactNode;
  align?: "left" | "center";
  /** Double rule under the header, like a chapter opening. */
  divider?: boolean;
  /** Heading level (default h1). */
  as?: "h1" | "h2";
}

/**
 * PageHeader — a chapter opening: optional running head, a Computer Modern
 * bold title (with an optional spot-blue section number), a lede, actions.
 *
 *   <PageHeader folio="Top 50" number="§" title="Leaderboard"
 *     lede="Top scores for each ranked mode." actions={<Button>…</Button>} />
 */
const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
  (
    {
      eyebrow,
      folio,
      number,
      title,
      lede,
      actions,
      align = "left",
      divider,
      size,
      as: Heading = "h1",
      className,
      children,
      ...props
    },
    ref,
  ) => (
    <header
      ref={ref}
      className={cn(
        "flex flex-col",
        align === "center" && "items-center text-center",
        divider && "rule-double pb-8",
        className,
      )}
      {...props}
    >
      {(eyebrow || folio) && (
        <div
          className={cn(
            "smallcaps mb-7 flex w-full items-baseline justify-between gap-4 border-b border-foreground/20 pb-1.5",
          )}
        >
          <span className="min-w-0 truncate">{eyebrow}</span>
          {folio && (
            <span className="shrink-0 font-mono text-[0.8125rem] [font-variant-caps:normal]">
              {folio}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "flex w-full flex-col gap-6",
          align === "left" &&
            actions &&
            "md:flex-row md:items-end md:justify-between",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-col gap-3",
            align === "center" && "items-center",
          )}
        >
          <Heading className={titleVariants({ size })}>
            {number && (
              <span className="mr-[0.45em] text-primary">{number}</span>
            )}
            {title}
          </Heading>
          {lede && (
            <p
              className={cn(
                "max-w-[38rem] text-body-lg text-muted-foreground text-pretty",
                align === "center" && "mx-auto",
              )}
            >
              {lede}
            </p>
          )}
          {children}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  ),
);
PageHeader.displayName = "PageHeader";

export { PageHeader };
