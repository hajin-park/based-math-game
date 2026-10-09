import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

/** @deprecated Use <PageHeader> (page tops) or a plain h2.text-headline. */

const sectionHeaderVariants = cva("flex flex-col gap-2.5", {
  variants: {
    align: {
      left: "items-start text-left",
      center: "items-center text-center",
      right: "items-end text-right",
    },
    spacing: {
      default: "mb-6",
      sm: "mb-4",
      lg: "mb-8",
      none: "mb-0",
    },
  },
  defaultVariants: {
    align: "left",
    spacing: "default",
  },
});

const titleVariants = cva(
  "font-serif font-medium tracking-[-0.015em] text-foreground text-balance",
  {
    variants: {
      size: {
        sm: "text-[1.375rem] leading-tight md:text-[1.625rem]",
        default: "text-headline",
        lg: "text-display-lg",
        xl: "text-display-xl",
      },
      underline: {
        none: "",
        ink: "ink-underline-visible",
        hover: "ink-underline",
      },
    },
    defaultVariants: {
      size: "default",
      underline: "none",
    },
  },
);

export interface SectionHeaderProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionHeaderVariants> {
  title: string;
  description?: string;
  icon?: LucideIcon;
  titleSize?: VariantProps<typeof titleVariants>["size"];
  titleUnderline?: VariantProps<typeof titleVariants>["underline"];
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    {
      className,
      align,
      spacing,
      title,
      description,
      icon: Icon,
      titleSize,
      titleUnderline,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(sectionHeaderVariants({ align, spacing }), className)}
        {...props}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon className="size-5 shrink-0 text-muted-foreground md:size-6" />
          )}
          <h2
            className={cn(
              titleVariants({ size: titleSize, underline: titleUnderline }),
            )}
          >
            {title}
          </h2>
        </div>
        {description && (
          <p className="max-w-prose text-body text-muted-foreground text-pretty">
            {description}
          </p>
        )}
      </div>
    );
  },
);
SectionHeader.displayName = "SectionHeader";

export { SectionHeader, sectionHeaderVariants, titleVariants };
