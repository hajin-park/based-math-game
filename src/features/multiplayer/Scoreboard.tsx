import { memo, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, WifiOff } from "lucide-react";

import type { Format } from "@/game";
import type { RoomPlayer } from "@/hooks/useRoom";
import { cn } from "@/lib/utils";
import { YouTag } from "./PlayerAvatar";
import { ordinal, rankPlayers } from "./standings";

function liveValue(p: RoomPlayer, format: Format, target: number): string {
  if (format === "speedrun") {
    if (p.finished && typeof p.finishMs === "number")
      return `${((p.finishMs + (p.penaltyMs ?? 0)) / 1000).toFixed(2)} s`;
    return `${p.correct}/${target}`;
  }
  return String(p.score);
}

export interface ScoreboardProps {
  players: RoomPlayer[];
  myUid: string;
  names: Map<string, string>;
  format: Format;
  /** Speedrun target. */
  target: number;
  /** Phones: one horizontal strip instead of a list. */
  compact?: boolean;
  className?: string;
}

/**
 * Live in-round standings. Rows glide to their new position (no motion when
 * reduced motion is requested); the player's own rank change is announced
 * politely, at most every few seconds.
 */
export const Scoreboard = memo(function Scoreboard({
  players,
  myUid,
  names,
  format,
  target,
  compact,
  className,
}: ScoreboardProps) {
  const reduce = useReducedMotion();
  const standings = rankPlayers(
    players.filter((p) => !p.kicked),
    format,
  );
  const mine = standings.find((s) => s.player.uid === myUid);
  const announcement = useRankAnnouncement(
    compact ? undefined : mine?.rank,
    standings.length,
  );
  const unit =
    format === "speedrun" ? "correct" : format === "survival" ? "cleared" : "correct";

  if (compact) {
    return (
      <section aria-label="Live scores" className={className}>
        {/* Focusable so keyboard users can scroll a long strip. */}
        <ol
          tabIndex={0}
          aria-label="Players by rank"
          className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
        >
          {standings.map((s) => {
            const you = s.player.uid === myUid;
            return (
              <motion.li
                key={s.player.uid}
                layout={reduce ? false : "position"}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-[0.8125rem]",
                  you && "border-primary/40 bg-primary/[0.05]",
                  s.dropout && "text-muted-foreground",
                )}
              >
                <span className="font-mono text-[0.6875rem] text-muted-foreground">
                  {s.rank}
                </span>
                <span className="max-w-[7rem] truncate font-medium">
                  {you ? "You" : (names.get(s.player.uid) ?? s.player.displayName)}
                </span>
                <span className="font-mono tabular-nums">
                  {liveValue(s.player, format, target)}
                </span>
                {s.player.finished && (
                  <>
                    <Check aria-hidden className="size-3.5 text-success" />
                    <span className="sr-only">finished</span>
                  </>
                )}
                {s.dropout && (
                  <>
                    <WifiOff aria-hidden className="size-3.5 text-warning" />
                    <span className="sr-only">disconnected</span>
                  </>
                )}
              </motion.li>
            );
          })}
        </ol>
      </section>
    );
  }

  return (
    <section aria-labelledby="scoreboard-title" className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="scoreboard-title" className="eyebrow">
          Live scores
        </h2>
        <span className="text-[0.75rem] text-muted-foreground">{unit}</span>
      </div>
      <ol className="flex flex-col gap-1">
        {standings.map((s) => {
          const you = s.player.uid === myUid;
          const name = names.get(s.player.uid) ?? s.player.displayName;
          return (
            <motion.li
              key={s.player.uid}
              layout={reduce ? false : "position"}
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-md px-3 py-2",
                you ? "bg-primary/[0.06]" : "bg-card/70",
                s.dropout && "text-muted-foreground",
              )}
            >
              <span className="w-5 font-mono text-[0.75rem] text-muted-foreground">
                {s.rank}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-[0.9375rem]">{name}</span>
                  {you && <YouTag />}
                </span>
                {(s.player.finished || s.dropout) && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[0.75rem]",
                      s.dropout ? "text-warning" : "text-success",
                    )}
                  >
                    {s.dropout ? (
                      <WifiOff aria-hidden className="size-3" />
                    ) : (
                      <Check aria-hidden className="size-3" />
                    )}
                    {s.dropout ? "Disconnected" : "Finished"}
                  </span>
                )}
              </span>
              <span className="font-mono text-[0.9375rem] tabular-nums">
                {liveValue(s.player, format, target)}
              </span>
            </motion.li>
          );
        })}
      </ol>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
});

/** "You're 2nd of 4", spoken when the rank settles, never more than every 4 s. */
function useRankAnnouncement(rank: number | undefined, of: number) {
  const [text, setText] = useState("");
  const last = useRef<{ rank?: number; at: number }>({ at: 0 });
  useEffect(() => {
    if (rank === undefined || rank === last.current.rank) return;
    const t = window.setTimeout(
      () => {
        last.current = { rank, at: Date.now() };
        setText(`You're ${ordinal(rank)} of ${of}`);
      },
      Math.max(1500, 4000 - (Date.now() - last.current.at)),
    );
    return () => window.clearTimeout(t);
  }, [rank, of]);
  return text;
}
