import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge — a small printed label in a hairline box, set in small caps.
 * Never a loud fill except `solid`. For number bases use <BaseTag>.
 */
const badgeVariants = cva(
  "inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-sm border px-2 font-sans text-[0.8125rem] font-medium leading-none [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-primary/35 bg-tint text-primary",
        solid: "border-transparent bg-foreground text-background",
        secondary: "border-transparent bg-sunken text-foreground",
        outline: "border-foreground/30 bg-transparent text-muted-foreground",
        success: "border-success/35 bg-success/10 text-success",
        warning: "border-warning/35 bg-warning/10 text-warning",
        destructive: "border-pen/35 bg-pen/10 text-pen",
        info: "border-primary/35 bg-tint text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
