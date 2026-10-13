import { useCallback, useEffect, useRef, useState } from "react";

import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

interface CountdownProps {
  onComplete: () => void;
  /** Seconds to count down from (default 3). */
  duration?: number;
  /** Render in place instead of as a full-screen overlay. */
  inline?: boolean;
  /**
   * Let the player start immediately with Enter, Space or a tap. Leave off
   * when the start time is shared (multiplayer rooms).
   */
  skippable?: boolean;
  /** Running head above the number (default "Get ready"). */
  caption?: string;
  /** Quiet line under the number (default "Pencils ready."). */
  note?: string;
  /** Extra classes for the full-screen overlay. */
  className?: string;
}

/**
 * 3-2-1 before a run: big typewriter numerals between two rules on the
 * paper, a running head and a quiet line. Announced assertively to screen
 * readers; no motion under prefers-reduced-motion.
 */
export default function Countdown({
  onComplete,
  duration = 3,
  inline = false,
  skippable = false,
  caption = "Get ready",
  note = "Pencils ready.",
  className,
}: CountdownProps) {
  const [count, setCount] = useState(duration);
  const done = useRef(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const complete = useCallback(() => {
    if (done.current) return;
    done.current = true;
    onCompleteRef.current();
  }, []);

  useEffect(() => {
    if (count <= 0) {
      complete();
      return;
    }
    const t = window.setTimeout(() => setCount((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [count, complete]);

  useEffect(() => {
    if (!skippable) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        complete();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skippable, complete]);

  const content = (
    <div className="flex w-full max-w-sm flex-col items-center text-center">
      <p className="smallcaps w-full border-b border-foreground/25 pb-2">
        {caption}
      </p>
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="grid h-[1.15em] place-items-center py-2 font-mono text-[clamp(6rem,3.5rem+11vw,10rem)] font-medium leading-none tabular-nums"
      >
        <span
          key={count}
          className={cn(
            "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200",
            count <= 1 ? "text-primary" : "text-foreground",
          )}
        >
          {Math.max(count, 1)}
        </span>
      </div>
      <p className="w-full border-t border-foreground/25 pt-3 font-serif text-body-lg italic text-foreground/80">
        {note}
      </p>
      {skippable && (
        <p className="mt-4 hidden items-center gap-1.5 text-label text-muted-foreground pointer-fine:inline-flex">
          Press <Kbd size="sm">Enter</Kbd> to start now
        </p>
      )}
      {skippable && (
        <p className="mt-4 text-label text-muted-foreground pointer-fine:hidden">
          Tap to start now
        </p>
      )}
    </div>
  );

  if (inline) return content;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 grid place-items-center bg-background px-4",
        className,
      )}
      onClick={skippable ? complete : undefined}
    >
      {content}
    </div>
  );
}
