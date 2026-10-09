import { cn } from "@/lib/utils";
import { initials } from "./names";

/** Initials chip. Decorative: the name is always written next to it. */
export function PlayerAvatar({
  name,
  you,
  muted,
  size = "md",
}: {
  name: string;
  you?: boolean;
  muted?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border font-mono font-medium",
        size === "md" ? "size-9 text-[0.75rem]" : "size-7 text-[0.6875rem]",
        you
          ? "border-primary/50 bg-primary/10 text-foreground"
          : "border-border-strong bg-sunken text-foreground",
        muted && "border-dashed bg-transparent text-muted-foreground",
      )}
    >
      {initials(name)}
    </span>
  );
}

/** The "You" marker shown next to the current player's name everywhere. */
export function YouTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center rounded-sm bg-foreground px-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-background",
        className,
      )}
    >
      You
    </span>
  );
}
