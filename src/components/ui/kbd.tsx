import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const kbdVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center rounded-[2px] border border-b-[2px] border-foreground/30 border-b-foreground/45 bg-card font-mono font-medium leading-none text-foreground/80",
  {
    variants: {
      size: {
        sm: "h-5 min-w-5 px-1 text-[0.6875rem]",
        md: "h-6 min-w-6 px-1.5 text-[0.75rem]",
      },
      tone: {
        default: "",
        /** For use on a primary (filled) button. */
        inverse:
          "border-current border-b-current bg-transparent text-current opacity-60",
      },
    },
    defaultVariants: { size: "md", tone: "default" },
  },
);

export interface KbdProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof kbdVariants> {}

/**
 * Kbd — a typewriter key. Use to teach shortcuts inline ("Press <Kbd>Enter</Kbd>").
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
