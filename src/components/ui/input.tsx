import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Input — a form field printed on the page: a fresh-sheet fill, a hairline
 * box and a heavier bottom rule to write on. 16px text on touch devices
 * (prevents iOS zoom). `variant="answer"` is the exercise answer blank on
 * game surfaces: no box, one long rule, typewriter numerals.
 */
const inputVariants = cva(
  [
    "flex w-full min-w-0 text-foreground",
    "transition-[border-color,box-shadow,background-color] duration-fast ease-out",
    "placeholder:text-muted-foreground/80",
    "focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "h-10 rounded-sm border border-input/70 border-b-input bg-card px-3 font-sans text-base sm:text-[0.9375rem]",
          "shadow-[inset_0_-1px_0_rgb(var(--input))] hover:border-input",
          "focus-visible:border-primary focus-visible:shadow-[inset_0_-1px_0_rgb(var(--primary)),0_0_0_3px_rgb(var(--ring)/0.16)]",
          "aria-[invalid=true]:border-pen aria-[invalid=true]:shadow-[inset_0_-1px_0_rgb(var(--pen))]",
          "dark:bg-sunken/70",
        ].join(" "),
        sm: [
          "h-8 rounded-sm border border-input/70 border-b-input bg-card px-2.5 font-sans text-base sm:text-label",
          "hover:border-input focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgb(var(--ring)/0.16)]",
          "aria-[invalid=true]:border-pen dark:bg-sunken/70",
        ].join(" "),
        answer: [
          "h-16 rounded-none border-0 border-b-2 border-foreground/70 bg-transparent px-2 text-center font-mono text-mono-xl font-medium tracking-[0.04em] sm:h-[4.75rem]",
          "hover:border-foreground focus-visible:border-primary focus-visible:bg-tint/50",
          "aria-[invalid=true]:border-pen",
        ].join(" "),
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
