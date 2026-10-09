import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button — the only clickable "box" in the system.
 *
 * Variants
 *  - default / primary: red-pen fill. One per view (the main action).
 *  - secondary: quiet filled well. Supporting actions.
 *  - outline: hairline box. Alternatives next to a primary.
 *  - ghost: no chrome until hover. Toolbars, nav, icon buttons.
 *  - link: inline text action.
 *  - destructive: irreversible actions (always confirm).
 *
 * Sizes: sm (32px), default (40px), lg (48px), xl (56px, hero CTAs),
 * icon / icon-sm / icon-lg. Compact sizes get an invisible ≥44px hit area
 * on coarse pointers (see the `pointer-coarse:after` rule below).
 */
const buttonVariants = cva(
  [
    "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans font-medium",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-fast ease-out",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(var(--shadow)/0.12)] hover:bg-primary-hover",
        primary:
          "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(var(--shadow)/0.12)] hover:bg-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-border/80 dark:hover:bg-border",
        outline:
          "border border-input bg-card text-foreground shadow-xs hover:border-border-strong hover:bg-accent dark:bg-transparent",
        ghost: "text-foreground hover:bg-accent",
        link: "h-auto px-0 text-primary underline decoration-primary/40 underline-offset-[0.22em] hover:decoration-primary",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3 text-label",
        default: "h-10 px-4 text-[0.9375rem]",
        lg: "h-12 px-5 text-base",
        xl: "h-14 px-6 text-base [&_svg]:size-[1.125rem]",
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
