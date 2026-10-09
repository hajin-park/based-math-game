import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const titleVariants = cva(
  "font-serif font-medium text-foreground text-balance [font-variation-settings:'opsz'_72]",
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
  /** Mono uppercase overline, e.g. "Multiplayer" or "Chapter 2". */
  eyebrow?: React.ReactNode;
  /** The page's h1. Wrap a word in <em> for the serif-italic accent. */
  title: React.ReactNode;
  /** One or two sentences. Max ~34rem. */
  lede?: React.ReactNode;
  /** Buttons, right-aligned on desktop, stacked under the lede on mobile. */
  actions?: React.ReactNode;
  align?: "left" | "center";
  /** Hairline under the header. */
  divider?: boolean;
  /** Heading level (default h1). */
  as?: "h1" | "h2";
}

/**
 * PageHeader — the top of every app/marketing page.
 *
 *   <PageHeader eyebrow="Leaderboard" title={<>Fastest <em>hands</em></>}
 *     lede="Top scores for each official mode." actions={<Button>…</Button>} />
 */
const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
  (
    {
      eyebrow,
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
        "flex flex-col gap-6",
        align === "left" &&
          actions &&
          "md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center",
        divider && "border-b pb-8",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "flex min-w-0 flex-col gap-3",
          align === "center" && "items-center",
        )}
      >
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Heading
          className={cn(
            titleVariants({ size }),
            "[&_em]:font-serif [&_em]:italic [&_em]:text-primary",
          )}
        >
          {title}
        </Heading>
        {lede && (
          <p
            className={cn(
              "max-w-lede text-body-lg text-muted-foreground text-pretty",
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
    </header>
  ),
);
PageHeader.displayName = "PageHeader";

export { PageHeader };
