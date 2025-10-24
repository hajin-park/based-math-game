import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const paperCardVariants = cva(
  "rounded-sm border bg-card text-card-foreground shadow-sm paper-texture",
  {
    variants: {
      variant: {
        default: "",
        folded: "folded-corner",
        "folded-sm": "folded-corner folded-corner-sm",
        "folded-lg": "folded-corner folded-corner-lg",
        bookmark: "bookmark-ribbon",
        interactive: "page-curl cursor-pointer",
      },
      padding: {
        default: "p-4",
        sm: "p-3",
        lg: "p-5",
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
  extends React.HTMLAttributes<HTMLDivElement>,
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
    className={cn("flex flex-col space-y-1.5 p-6", className)}
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
      "font-serif font-semibold leading-none tracking-academic",
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
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
PaperCardDescription.displayName = "PaperCardDescription";

const PaperCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
PaperCardContent.displayName = "PaperCardContent";

const PaperCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
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
