import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { inputVariants } from "@/components/ui/input";

/** @deprecated Use <Input> / a <textarea> with inputVariants. */

const notebookInputVariants = cva(
  "flex w-full text-base sm:text-[0.9375rem] placeholder:text-muted-foreground/80 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: inputVariants(),
        underline:
          "h-10 rounded-none border-0 border-b border-input bg-transparent px-0.5 transition-colors duration-fast hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:shadow-[0_1px_0_rgb(var(--primary))]",
        ruled: cn(
          inputVariants(),
          "ruled-lines h-auto min-h-[6rem] px-3 py-0 leading-[1.5rem] [background-attachment:local]",
        ),
        "ruled-margin": cn(
          inputVariants(),
          "ruled-lines-margin h-auto min-h-[6rem] py-0 pl-12 pr-3 leading-[1.5rem] [background-attachment:local]",
        ),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface NotebookInputProps
  extends
    React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>,
    VariantProps<typeof notebookInputVariants> {
  multiline?: boolean;
}

const NotebookInput = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  NotebookInputProps
>(({ className, variant, type, multiline = false, ...props }, ref) => {
  // Use textarea for ruled variants or when multiline is true
  const isTextarea =
    multiline || variant === "ruled" || variant === "ruled-margin";

  if (isTextarea) {
    return (
      <textarea
        className={cn(notebookInputVariants({ variant, className }))}
        ref={ref as React.Ref<HTMLTextAreaElement>}
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    );
  }

  return (
    <input
      type={type}
      className={cn(notebookInputVariants({ variant, className }))}
      ref={ref as React.Ref<HTMLInputElement>}
      {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
    />
  );
});
NotebookInput.displayName = "NotebookInput";

export { NotebookInput, notebookInputVariants };
