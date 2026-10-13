import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Field label voice for the room worksheets: small caps, ink. Spread onto a
 * <Label>, <legend> or <span> so the printed form reads like one document.
 */
export const FIELD_LABEL =
  "font-serif text-[1.0625rem] font-medium leading-tight tracking-[0.05em] text-foreground [font-variant-caps:all-small-caps]";

/**
 * One line of a printed worksheet: the field's name (and a note under it) in
 * the left column, the control on the right, a hairline above. Stacks on
 * narrow screens. `dense` narrows the label column for dialogs.
 */
export function FormRow({
  label,
  note,
  children,
  dense,
  className,
}: {
  label: ReactNode;
  note?: ReactNode;
  children: ReactNode;
  dense?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-x-8 gap-y-3 border-t border-foreground/15 py-6",
        dense
          ? "sm:grid-cols-[8.5rem_minmax(0,1fr)]"
          : "md:grid-cols-[11rem_minmax(0,1fr)]",
        className,
      )}
    >
      <div className="flex flex-col gap-1.5">
        {label}
        {note && (
          <div className="font-sans text-[0.8125rem] leading-snug text-muted-foreground">
            {note}
          </div>
        )}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
