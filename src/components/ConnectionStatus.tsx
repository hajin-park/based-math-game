import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** How long a drop must last before we mention it. */
const GRACE_MS = 3000;

/**
 * Global "you're offline" notice, driven by the browser's online/offline
 * events (no database socket is opened just for this). Nothing is shown
 * until a drop has lasted a few seconds; "Back online" is shown only to
 * people who saw the offline notice. Room pages show their own connection
 * state in the room bar, so this stays out of their way.
 */
export default function ConnectionStatus() {
  const { pathname } = useLocation();
  const [state, setState] = useState<"hidden" | "offline" | "restored">(
    "hidden",
  );

  useEffect(() => {
    let shownOffline = false;
    let timer: number | undefined;
    const onOnline = () => {
      window.clearTimeout(timer);
      if (shownOffline) {
        shownOffline = false;
        setState("restored");
        timer = window.setTimeout(() => setState("hidden"), 3000);
      }
    };
    const onOffline = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (navigator.onLine) return;
        shownOffline = true;
        setState("offline");
      }, GRACE_MS);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    if (!navigator.onLine) onOffline();
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const inRoom = pathname.startsWith("/multiplayer/lobby/");

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-50 flex justify-center sm:inset-x-auto sm:bottom-4 sm:right-4"
    >
      {state !== "hidden" && !inRoom && (
        <p
          className={cn(
            "pointer-events-auto flex max-w-sm items-center gap-2 rounded-lg border bg-popover px-4 py-3 text-body-sm shadow-lg",
            state === "offline" && "border-warning/40",
          )}
        >
          {state === "offline" ? (
            <WifiOff aria-hidden className="size-4 shrink-0 text-warning" />
          ) : (
            <Wifi aria-hidden className="size-4 shrink-0 text-success" />
          )}
          {state === "offline"
            ? "You're offline. Multiplayer resumes when the connection is back."
            : "Back online."}
        </p>
      )}
    </div>
  );
}
