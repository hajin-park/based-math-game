/**
 * Locale-aware time formatting for account pages (leaderboard "updated",
 * run history, profile). Uses the browser's locale; never hard-codes en-US.
 */

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 3600_000],
  ["month", 30 * 24 * 3600_000],
  ["week", 7 * 24 * 3600_000],
  ["day", 24 * 3600_000],
  ["hour", 3600_000],
  ["minute", 60_000],
];

let rtf: Intl.RelativeTimeFormat | null = null;
function relativeFormatter() {
  if (!rtf) rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  return rtf;
}

/** "3 minutes ago", "yesterday", "just now". */
export function relativeTime(ms: number, now: number = Date.now()): string {
  if (!ms) return "—";
  const diff = ms - now;
  const abs = Math.abs(diff);
  if (abs < 45_000) return "just now";
  for (const [unit, size] of UNITS) {
    if (abs >= size || unit === "minute") {
      return relativeFormatter().format(Math.round(diff / size), unit);
    }
  }
  return "just now";
}

/** "9 Oct 2026" in the user's locale. */
export function formatDate(ms: number): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(ms);
}

/** "9 Oct, 14:05" in the user's locale. */
export function formatDateTime(ms: number): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(ms);
}

/** Practice time: "42 s", "12 min", "3 h 05 min". */
export function formatPracticeTime(ms: number): {
  value: string;
  unit: string;
} {
  const s = Math.round(Math.max(0, ms) / 1000);
  if (s < 60) return { value: String(s), unit: "s" };
  const m = Math.round(s / 60);
  if (m < 60) return { value: String(m), unit: "min" };
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return {
    value: `${h}:${String(rem).padStart(2, "0")}`,
    unit: "h",
  };
}

/** Local calendar day key "YYYY-MM-DD" (for streaks: the student's day). */
export function localDayKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
