import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * @deprecated Use <Card> (src/components/ui/card.tsx). Kept so legacy pages
 * render in the new visual language; see DESIGN.md → Migration.
 */

const paperCardVariants = cva(
  "relative rounded-lg border bg-card text-card-foreground shadow-xs",
  {
    variants: {
      variant: {
        default: "",
        folded: "",
        "folded-sm": "",
        "folded-lg": "",
        bookmark: "bookmark-ribbon",
        interactive:
          "page-curl cursor-pointer hover:border-border-strong hover:shadow-md",
      },
      padding: {
        default: "p-5",
        sm: "p-4",
        lg: "p-6",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  },
);

export interface PaperCardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof paperCardVariants> {}

const PaperCard = React.forwardRef<HTMLDivElement, PaperCardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(paperCardVariants({ variant, padding, className }))}
      {...props}
    />
  ),
);
PaperCard.displayName = "PaperCard";

const PaperCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5 p-5", className)}
    {...props}
  />
));
PaperCardHeader.displayName = "PaperCardHeader";

const PaperCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-sans text-title font-semibold text-foreground",
      className,
    )}
    {...props}
  />
));
PaperCardTitle.displayName = "PaperCardTitle";

const PaperCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-body-sm text-muted-foreground", className)}
    {...props}
  />
));
PaperCardDescription.displayName = "PaperCardDescription";

const PaperCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
));
PaperCardContent.displayName = "PaperCardContent";

const PaperCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2 p-5 pt-0", className)}
    {...props}
  />
));
PaperCardFooter.displayName = "PaperCardFooter";

export {
  PaperCard,
  PaperCardHeader,
  PaperCardFooter,
  PaperCardTitle,
  PaperCardDescription,
  PaperCardContent,
};
