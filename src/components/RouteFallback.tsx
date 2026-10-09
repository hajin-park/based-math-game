import { useEffect, useState } from "react";
import { BaseOdometer } from "@/components/ui/base-odometer";

/**
 * Suspense / auth-loading fallback. Waits 200ms before showing anything so
 * fast navigations never flash a loader, then shows a compact odometer.
 */
export default function RouteFallback({
  fullScreen = false,
}: {
  fullScreen?: boolean;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setShow(true), 200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        fullScreen
          ? "grid min-h-dvh place-items-center px-4"
          : // A full viewport tall, so the footer never jumps into view
            // and back while a lazy route loads (layout shift).
            "grid min-h-[calc(100dvh-var(--nav-h))] place-items-center px-4"
      }
    >
      <div
        className={
          show
            ? "flex w-full max-w-[15rem] flex-col items-center gap-3 animate-in fade-in-0 duration-300"
            : "invisible"
        }
      >
        <BaseOdometer
          size="sm"
          bases={["bin", "hex"]}
          autoPlay={650}
          header={false}
          className="shadow-sm"
        />
        <p className="text-[0.75rem] text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
