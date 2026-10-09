import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { baseMeta, type BaseLike } from "@/lib/bases";

const baseTagVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center gap-1 whitespace-nowrap rounded-sm border font-mono font-medium uppercase leading-none tracking-[0.06em]",
  {
    variants: {
      variant: {
        soft: "",
        solid: "border-transparent",
        outline: "bg-transparent",
      },
      size: {
        xs: "h-[1.125rem] px-1 text-[0.5625rem]",
        sm: "h-5 px-1.5 text-[0.625rem]",
        md: "h-6 px-2 text-[0.6875rem]",
        lg: "h-7 px-2.5 text-[0.75rem]",
      },
    },
    defaultVariants: { variant: "soft", size: "md" },
  },
);

export interface BaseTagProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof baseTagVariants> {
  /** "bin" | "oct" | "dec" | "hex", a radix (2/8/10/16) or a name ("Binary"). */
  base: BaseLike;
  /** Append the radix as a subscript, e.g. BIN₂. */
  showRadix?: boolean;
  /** Override the label (defaults to BIN/OCT/DEC/HEX). */
  label?: React.ReactNode;
}

/**
 * BaseTag — the identity pill for a number base. Always pair a number shown in
 * a base with its tag (or colour it via <Digits>), never rely on colour alone.
 *
 *   <BaseTag base="hex" />            → HEX
 *   <BaseTag base={2} showRadix />    → BIN₂
 */
const BaseTag = React.forwardRef<HTMLSpanElement, BaseTagProps>(
  ({ base, variant, size, showRadix, label, className, ...props }, ref) => {
    const meta = baseMeta(base);
    const tone =
      variant === "solid"
        ? meta.bg
        : variant === "outline"
          ? cn(meta.text, meta.border)
          : cn(meta.text, meta.softBg, meta.border);
    return (
      <span
        ref={ref}
        title={`${meta.name} (base ${meta.radix})`}
        className={cn(baseTagVariants({ variant, size }), tone, className)}
        {...props}
      >
        {label ?? meta.tag}
        {showRadix && (
          <sub className="-mb-[0.2em] text-[0.8em] normal-case opacity-70">
            {meta.radix}
          </sub>
        )}
      </span>
    );
  },
);
BaseTag.displayName = "BaseTag";

export { BaseTag, baseTagVariants };
