import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button — a printed box you can press. Square corners, Computer Modern Sans.
 *
 * Variants
 *  - default / primary: solid ink (yellow chalk on the chalkboard). One per
 *    view: the main action.
 *  - secondary: a spot-blue tint screen. Supporting actions.
 *  - outline: a ruled box. Alternatives next to a primary.
 *  - ghost: no chrome until hover. Toolbars, nav, icon buttons.
 *  - link: inline text action.
 *  - destructive: red pen. Irreversible actions (always confirm).
 *
 * Sizes: sm (32px), default (40px), lg (48px), xl (56px, the cover's Play),
 * icon / icon-sm / icon-lg. Compact sizes get an invisible ≥44px hit area
 * on coarse pointers.
 */
const buttonVariants = cva(
  [
    "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-sm font-sans font-bold tracking-[0.01em]",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-fast ease-out",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background shadow-[0_1px_0_rgb(var(--shadow)/0.25)] hover:bg-foreground/85 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary-hover",
        primary:
          "bg-foreground text-background shadow-[0_1px_0_rgb(var(--shadow)/0.25)] hover:bg-foreground/85 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary-hover",
        secondary:
          "bg-tint text-foreground hover:bg-primary/15 dark:hover:bg-primary/15",
        outline:
          "border border-foreground/55 bg-transparent text-foreground hover:border-foreground hover:bg-accent dark:border-foreground/45",
        ghost: "font-medium text-foreground hover:bg-accent",
        link: "h-auto px-0 font-medium text-primary underline decoration-primary/40 underline-offset-[0.22em] hover:decoration-primary",
        destructive: "bg-pen text-pen-foreground hover:bg-pen/90",
      },
      size: {
        sm: "h-8 px-3 text-label",
        default: "h-10 px-4 text-[0.9375rem]",
        lg: "h-12 px-5 text-base",
        xl: "h-14 px-7 text-[1.0625rem] [&_svg]:size-[1.125rem]",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          // ≥44px hit area on touch for compact sizes, without growing the
          // visual box: an invisible pseudo-element extends the target.
          (size === "sm" || size === "icon-sm" || size === "icon") &&
            "pointer-coarse:after:absolute pointer-coarse:after:-inset-1.5 pointer-coarse:after:content-['']",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
