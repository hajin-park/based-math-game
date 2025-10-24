import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const sectionHeaderVariants = cva("flex flex-col gap-2", {
  variants: {
    align: {
      left: "items-start text-left",
      center: "items-center text-center",
      right: "items-end text-right",
    },
    spacing: {
      default: "mb-4",
      sm: "mb-3",
      lg: "mb-5",
      none: "mb-0",
    },
  },
  defaultVariants: {
    align: "left",
    spacing: "default",
  },
});

const titleVariants = cva(
  "font-serif font-semibold tracking-academic leading-tight",
  {
    variants: {
      size: {
        sm: "text-xl md:text-2xl",
        default: "text-2xl md:text-3xl",
        lg: "text-3xl md:text-4xl",
        xl: "text-4xl md:text-5xl",
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
  extends React.HTMLAttributes<HTMLDivElement>,
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
            <Icon className="h-6 w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
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
          <p className="text-sm md:text-base text-muted-foreground max-w-prose">
            {description}
          </p>
        )}
      </div>
    );
  },
);
SectionHeader.displayName = "SectionHeader";

export { SectionHeader, sectionHeaderVariants, titleVariants };
