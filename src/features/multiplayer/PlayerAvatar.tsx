import { cn } from "@/lib/utils";
import { initials } from "./names";

/** Initials, set in typewriter. Decorative: the name is always written next to it. */
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
        "flex shrink-0 items-center justify-center rounded-sm border font-mono font-medium",
        size === "md" ? "size-9 text-[0.75rem]" : "size-7 text-[0.6875rem]",
        you
          ? "border-primary/60 text-foreground"
          : "border-foreground/30 text-foreground",
        muted && "border-dashed text-muted-foreground",
      )}
    >
      {initials(name)}
    </span>
  );
}

/**
 * The "you" marker next to the current player's name: a small-caps word in
 * the spot colour, the way a register marks its own line. Screen readers hear
 * "(you)".
 */
export function YouTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "shrink-0 font-serif text-[0.9375rem] font-medium leading-none tracking-[0.06em] text-primary [font-variant-caps:all-small-caps]",
        className,
      )}
    >
      <span className="sr-only">(</span>you<span className="sr-only">)</span>
    </span>
  );
}
