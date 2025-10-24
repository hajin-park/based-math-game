import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const notebookInputVariants = cva(
  "flex w-full bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "h-9 rounded-sm border border-input shadow-sm focus-visible:ring-1 focus-visible:ring-ring",
        underline:
          "h-9 border-0 border-b-2 border-border rounded-none focus-visible:border-primary",
        ruled:
          "h-auto min-h-[6rem] rounded-sm border border-input shadow-sm ruled-lines p-3 focus-visible:ring-1 focus-visible:ring-ring",
        "ruled-margin":
          "h-auto min-h-[6rem] rounded-sm border border-input shadow-sm ruled-lines-margin p-3 pl-12 focus-visible:ring-1 focus-visible:ring-ring",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface NotebookInputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>,
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
