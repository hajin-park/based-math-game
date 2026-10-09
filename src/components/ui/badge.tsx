import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge — small status label. Tinted wash + matching text; never a loud fill
 * except `solid`. For number bases use <BaseTag>.
 */
const badgeVariants = cva(
  "inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-sm border px-2 text-[0.75rem] font-medium leading-none [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-primary/25 bg-primary/10 text-primary",
        solid: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border-strong bg-transparent text-muted-foreground",
        success: "border-success/25 bg-success/10 text-success",
        warning: "border-warning/25 bg-warning/10 text-warning",
        destructive: "border-destructive/25 bg-destructive/10 text-destructive",
        info: "border-info/25 bg-info/10 text-info",
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
