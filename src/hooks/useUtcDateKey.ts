import { useEffect, useState } from "react";
import { utcDateKey } from "@/game";

/** Ms from `now` until the next 00:00 UTC. */
export function msUntilUtcMidnight(now = Date.now()): number {
  const d = new Date(now);
  return (
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) - now
  );
}

/**
 * Today's UTC date key ("YYYY-MM-DD"), updated when the day rolls over, so a
 * page left open past midnight (the daily, its leaderboard) moves to the new
 * day instead of offering yesterday's challenge. Also re-checks when the tab
 * becomes visible again, since timers sleep with the device.
 */
export function useUtcDateKey(): string {
  const [date, setDate] = useState(() => utcDateKey());
  useEffect(() => {
    const sync = () => setDate(utcDateKey());
    sync();
    // A little past midnight, so the new key is certain.
    const t = window.setTimeout(sync, msUntilUtcMidnight() + 500);
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [date]);
  return date;
}
