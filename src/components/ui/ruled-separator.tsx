import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ruledSeparatorVariants = cva("shrink-0 bg-border", {
  variants: {
    orientation: {
      horizontal: "h-[1px] w-full",
      vertical: "h-full w-[1px]",
    },
    variant: {
      default: "",
      double: "relative",
      dashed: "border-dashed",
    },
    spacing: {
      default: "my-4",
      sm: "my-3",
      lg: "my-6",
      none: "my-0",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    variant: "default",
    spacing: "default",
  },
});

export interface RuledSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ruledSeparatorVariants> {
  decorative?: boolean;
}

const RuledSeparator = React.forwardRef<HTMLDivElement, RuledSeparatorProps>(
  (
    {
      className,
      orientation = "horizontal",
      variant,
      spacing,
      decorative = true,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role={decorative ? "none" : "separator"}
        aria-orientation={orientation || undefined}
        className={cn(
          ruledSeparatorVariants({ orientation, variant, spacing }),
          className,
        )}
        {...props}
      >
        {variant === "double" && (
          <div
            className={cn(
              "absolute bg-border",
              orientation === "horizontal"
                ? "h-[1px] w-full top-[3px]"
                : "w-[1px] h-full left-[3px]",
            )}
          />
        )}
      </div>
    );
  },
);
RuledSeparator.displayName = "RuledSeparator";

export { RuledSeparator, ruledSeparatorVariants };
