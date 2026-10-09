import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const kbdVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center rounded-[5px] border border-b-2 border-border-strong bg-card font-mono font-medium leading-none text-muted-foreground shadow-[0_1px_0_rgb(var(--shadow)/0.04)]",
  {
    variants: {
      size: {
        sm: "h-5 min-w-5 px-1 text-[0.625rem]",
        md: "h-6 min-w-6 px-1.5 text-[0.6875rem]",
      },
      tone: {
        default: "",
        /** For use on a primary (filled) button. */
        inverse:
          "border-white/25 border-b-white/35 bg-white/10 text-current shadow-none dark:border-black/20 dark:border-b-black/30 dark:bg-black/10",
      },
    },
    defaultVariants: { size: "md", tone: "default" },
  },
);

export interface KbdProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof kbdVariants> {}

/**
 * Kbd — a keycap. Use to teach shortcuts inline ("Press <Kbd>Enter</Kbd>").
 * Hide keyboard hints on touch-only devices with `hidden pointer-fine:inline-flex`.
 */
const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, size, tone, ...props }, ref) => (
    <kbd
      ref={ref}
      className={cn(kbdVariants({ size, tone }), className)}
      {...props}
    />
  ),
);
Kbd.displayName = "Kbd";

/** A key combination: <KbdCombo keys={["⌘", "K"]} /> */
function KbdCombo({
  keys,
  className,
  size,
  tone,
}: { keys: string[]; className?: string } & VariantProps<typeof kbdVariants>) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {keys.map((k) => (
        <Kbd key={k} size={size} tone={tone}>
          {k}
        </Kbd>
      ))}
    </span>
  );
}

export { Kbd, KbdCombo, kbdVariants };
