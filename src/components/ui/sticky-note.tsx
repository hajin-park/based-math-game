import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * @deprecated Use <Callout> styling via <Alert> or a bordered note. Kept for
 * legacy pages; renders as a quiet margin note (no rotation, no yellow pad).
 */

const stickyNoteVariants = cva("sticky-note", {
  variants: {
    variant: {
      default: "", // Yellow
      info: "sticky-note-blue",
      success: "sticky-note-green",
      warning: "sticky-note-pink",
    },
    size: {
      default: "p-4",
      sm: "p-3 text-sm",
      lg: "p-6",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface StickyNoteProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stickyNoteVariants> {}

const StickyNote = React.forwardRef<HTMLDivElement, StickyNoteProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      role="note"
      className={cn(stickyNoteVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
StickyNote.displayName = "StickyNote";

const StickyNoteTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      "mb-1.5 font-sans text-[0.9375rem] font-semibold leading-snug text-foreground",
      className,
    )}
    {...props}
  />
));
StickyNoteTitle.displayName = "StickyNoteTitle";

const StickyNoteDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-body-sm text-muted-foreground [&_p]:leading-relaxed",
      className,
    )}
    {...props}
  />
));
StickyNoteDescription.displayName = "StickyNoteDescription";

export { StickyNote, StickyNoteTitle, StickyNoteDescription };
