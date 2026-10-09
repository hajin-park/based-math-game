import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Input — hairline field on the raised surface. 16px text on touch devices
 * (prevents iOS zoom). Use `variant="answer"` for the big mono answer field on
 * game surfaces.
 */
const inputVariants = cva(
  [
    "flex w-full min-w-0 rounded-md border border-input bg-card text-foreground shadow-xs",
    "transition-[border-color,box-shadow] duration-fast ease-out",
    "placeholder:text-muted-foreground/80 hover:border-border-strong",
    "focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgb(var(--ring)/0.16)] focus-visible:outline-none",
    "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:shadow-[0_0_0_3px_rgb(var(--destructive)/0.16)]",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "dark:bg-sunken/60",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "h-10 px-3 text-base sm:text-[0.9375rem]",
        sm: "h-8 px-2.5 text-base sm:text-label",
        answer:
          "h-16 px-4 text-center font-mono text-mono-lg tracking-wide sm:h-[4.5rem] sm:text-[1.75rem]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface InputProps
  extends
    React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
