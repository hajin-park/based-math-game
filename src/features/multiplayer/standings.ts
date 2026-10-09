/**
 * Ranking of room players, shared by the live scoreboard and the results.
 *
 * Speedrun: finished players by total time (run time + skip penalties, ms
 * precision), then unfinished players by correct answers.
 * Sprint / survival: by score, ties broken by who reached it first.
 *
 * A dropout (disconnected without finishing) is always ranked below everyone
 * still in the round and can never win. Exact ties share a rank.
 */
import type { Format } from "@/game";

export interface StandingInput {
  uid: string;
  score: number;
  correct: number;
  finished: boolean;
  finishMs?: number;
  penaltyMs?: number;
  scoreMs?: number;
  disconnected?: boolean;
  joinedAt?: number;
}

export interface Standing<P extends StandingInput = StandingInput> {
  player: P;
  /** 1-based; tied players share a rank. */
  rank: number;
  /** Disconnected before finishing. */
  dropout: boolean;
  /** Speedrun: finished total time in ms. */
  totalMs?: number;
  /** Eligible to be credited with the win (rank 1 and a real result). */
  winner: boolean;
}

function totalMs(p: StandingInput): number | undefined {
  if (!p.finished || typeof p.finishMs !== "number") return undefined;
  return p.finishMs + (p.penaltyMs ?? 0);
}

/** Lexicographic sort key: lower is better at every position. */
function sortKey(p: StandingInput, format: Format): number[] {
  const dropout = !p.finished && !!p.disconnected ? 1 : 0;
  const reachedAt = p.score > 0 ? (p.scoreMs ?? Number.MAX_SAFE_INTEGER) : 0;
  if (format === "speedrun") {
    const total = totalMs(p);
    return total !== undefined
      ? [dropout, 0, total]
      : [dropout, 1, -p.correct, reachedAt];
  }
  return [dropout, -p.score, reachedAt];
}

function compareKeys(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

export function rankPlayers<P extends StandingInput>(
  players: readonly P[],
  format: Format,
): Standing<P>[] {
  const keyed = players.map((p) => ({ p, key: sortKey(p, format) }));
  keyed.sort(
    (a, b) =>
      compareKeys(a.key, b.key) ||
      (a.p.joinedAt ?? 0) - (b.p.joinedAt ?? 0) ||
      a.p.uid.localeCompare(b.p.uid),
  );
  let rank = 0;
  return keyed.map(({ p, key }, i) => {
    if (i === 0 || compareKeys(keyed[i - 1].key, key) !== 0) rank = i + 1;
    const dropout = !p.finished && !!p.disconnected;
    const total = format === "speedrun" ? totalMs(p) : undefined;
    const hasResult =
      format === "speedrun" ? total !== undefined : p.score > 0;
    return {
      player: p,
      rank,
      dropout,
      totalMs: total,
      winner: rank === 1 && !dropout && hasResult,
    };
  });
}

/** "1st", "2nd", "3rd", "11th"… */
export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}
