import { useEffect, useMemo, useRef, useState } from "react";
import { Crown, MessageSquare, RotateCcw, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/use-toast";
import { formatMs, SPEEDRUN_TARGET, type GameMode } from "@/game";
import { roomApi, type Room, type RoomPlayer } from "@/hooks/useRoom";
import type { ChatMessage } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { YouTag } from "./PlayerAvatar";
import { ProgressChart, type ProgressSeries } from "./ProgressChart";
import { RoomChat } from "./RoomChat";
import { ordinal, rankPlayers, type Standing } from "./standings";
import type { FeedEvent } from "./useRoomState";

function resultText(
  s: Standing<RoomPlayer>,
  mode: GameMode,
): { main: string; unit?: string; note?: string } {
  const p = s.player;
  if (mode.format === "speedrun") {
    const target = mode.spec.targetCount ?? SPEEDRUN_TARGET;
    if (s.totalMs !== undefined)
      return {
        main: formatMs(s.totalMs),
        note: p.penaltyMs ? `incl. +${p.penaltyMs / 1000} s skips` : undefined,
      };
    return {
      main: `${p.correct}/${target}`,
      unit: "correct",
      note: s.dropout ? "Left the round" : "Did not finish",
    };
  }
  return {
    main: String(p.score),
    unit: mode.format === "survival" ? "cleared" : "correct",
    note: s.dropout
      ? "Left the round"
      : p.score > 0 && typeof p.scoreMs === "number"
        ? `last point at ${formatMs(p.scoreMs)}`
        : undefined,
  };
}

/** "3 correct ahead of Ada." / "0.42 s ahead of Ada." */
function winMargin(
  me: Standing<RoomPlayer>,
  next: Standing<RoomPlayer>,
  mode: GameMode,
  nextName: string,
): string {
  if (mode.format === "speedrun") {
    if (me.totalMs !== undefined && next.totalMs !== undefined)
      return `${formatMs(next.totalMs - me.totalMs)} ahead of ${nextName}.`;
    return `The only one to reach ${mode.spec.targetCount ?? SPEEDRUN_TARGET}.`;
  }
  const diff = me.player.score - next.player.score;
  const unit = mode.format === "survival" ? "cleared" : "correct";
  return diff > 0
    ? `${diff} ${unit} ahead of ${nextName}.`
    : `Level with ${nextName}, but you got there first.`;
}

export function ResultsView({
  room,
  myUid,
  names,
  messages,
  events,
  onLeave,
}: {
  room: Room;
  myUid: string;
  names: Map<string, string>;
  messages: ChatMessage[];
  events: FeedEvent[];
  onLeave: () => void;
}) {
  const mode = room.engineMode as GameMode;
  const isHost = room.hostUid === myUid;
  const [chatOpen, setChatOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const standings = useMemo(
    () =>
      rankPlayers(
        Object.values(room.players).filter((p) => !p.kicked),
        mode.format,
      ),
    [room.players, mode.format],
  );
  const mine = standings.find((s) => s.player.uid === myUid);
  const winners = standings.filter((s) => s.winner);
  const name = (uid: string) =>
    names.get(uid) ?? room.players[uid]?.displayName ?? "Player";

  // The winner's client records the win (rules: players write only their own node).
  const credited = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!mine?.winner || credited.current === room.serverStartedAt) return;
    credited.current = room.serverStartedAt;
    void roomApi.incrementWins(room.id, myUid).catch(() => undefined);
  }, [mine?.winner, room.id, room.serverStartedAt, myUid]);

  const title = !winners.length
    ? "No winner this round"
    : mine?.winner
      ? winners.length > 1
        ? "You tied for first"
        : "You won"
      : winners.length > 1
        ? `${winners.map((w) => name(w.player.uid)).join(" and ")} tied`
        : `${name(winners[0].player.uid)} wins`;
  const runnerUp = standings.find((s) => s.rank > 1);
  const lede = !mine
    ? undefined
    : mine.dropout
      ? "You left before finishing, so this round doesn't count for you."
      : mine.winner && runnerUp && winners.length === 1
        ? winMargin(mine, runnerUp, mode, name(runnerUp.player.uid))
        : `You placed ${ordinal(mine.rank)} of ${standings.length}.`;

  const series: ProgressSeries[] = useMemo(() => {
    const sprintEnd = mode.format === "sprint" ? (mode.spec.durationMs ?? 60_000) : 0;
    return [...standings]
      .sort((a, b) => (a.player.joinedAt ?? 0) - (b.player.joinedAt ?? 0))
      .map((s) => ({
        uid: s.player.uid,
        name: name(s.player.uid),
        you: s.player.uid === myUid,
        marks: s.player.progress,
        endMs:
          s.player.finished && typeof s.player.finishMs === "number"
            ? s.player.finishMs
            : sprintEnd || (s.player.progress[s.player.progress.length - 1] ?? 0),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standings, myUid, names, mode]);

  const chartDuration =
    mode.format === "sprint"
      ? (mode.spec.durationMs ?? 60_000)
      : Math.max(1000, ...series.map((s) => s.endMs));
  const yMax =
    mode.format === "speedrun"
      ? (mode.spec.targetCount ?? SPEEDRUN_TARGET)
      : Math.max(1, ...series.map((s) => s.marks.length));
  const hasProgress = series.some((s) => s.marks.length > 0);

  const playAgain = async () => {
    setBusy(true);
    try {
      await roomApi.resetRoom(room.id);
    } catch {
      toast({ variant: "destructive", title: "Couldn't reopen the lobby", description: "Try again." });
      setBusy(false);
    }
  };

  return (
    <>
      <div className="container grid flex-1 gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:py-12">
        <div className="flex min-w-0 flex-col gap-10 pb-28 lg:pb-0">
          <header className="flex flex-col gap-3">
            <p className="eyebrow">Results · {mode.name}</p>
            <h1 className="font-serif text-display-lg font-medium text-balance [font-variation-settings:'opsz'_72]">
              {mine?.winner ? (
                <>
                  You <em className="italic text-primary">won</em>
                  {winners.length > 1 && " (tied)"}
                </>
              ) : (
                title
              )}
            </h1>
            {lede && (
              <p className="text-body-lg text-muted-foreground" role="status">
                {lede}
              </p>
            )}
          </header>

          {/* Next step: fixed to the bottom on phones/tablets, under the headline on desktop. */}
          <div className="fixed inset-x-0 bottom-0 z-20 -mt-4 border-t bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <div className="mx-auto flex max-w-3xl flex-col gap-2 lg:mx-0">
              {!isHost && (
                <p className="text-body-sm text-muted-foreground">
                  Waiting for {name(room.hostUid)} to start the next round.
                </p>
              )}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="lg:hidden"
                  onClick={() => setChatOpen(true)}
                >
                  <MessageSquare aria-hidden />
                  Chat
                </Button>
                {isHost && (
                  <Button
                    type="button"
                    size="lg"
                    className="flex-1 lg:flex-none"
                    onClick={playAgain}
                    disabled={busy}
                  >
                    <RotateCcw aria-hidden />
                    Play again
                  </Button>
                )}
                <Button
                  type="button"
                  variant={isHost ? "ghost" : "outline"}
                  size="lg"
                  className={cn(!isHost && "flex-1 lg:flex-none")}
                  onClick={onLeave}
                >
                  Leave room
                </Button>
              </div>
            </div>
          </div>

          <section aria-labelledby="standings-title" className="flex flex-col gap-3">
            <h2 id="standings-title" className="text-title font-semibold">
              Standings
            </h2>
            <ol className="flex flex-col divide-y rounded-lg border bg-card">
              {standings.map((s) => {
                const you = s.player.uid === myUid;
                const r = resultText(s, mode);
                return (
                  <li
                    key={s.player.uid}
                    className={cn(
                      "grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 sm:px-4",
                      you && "bg-primary/[0.035]",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-[1.125rem] tabular-nums",
                        s.rank === 1 && s.winner ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      <span className="sr-only">Rank </span>
                      {s.rank}
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-[0.9375rem] font-medium">
                          {name(s.player.uid)}
                        </span>
                        {you && <YouTag />}
                        {s.winner && (
                          <span className="inline-flex items-center gap-1 text-[0.75rem] text-foreground">
                            <Crown aria-hidden className="size-3.5" />
                            Winner
                          </span>
                        )}
                      </span>
                      <span className="flex flex-wrap items-center gap-x-3 text-[0.8125rem] text-muted-foreground">
                        {s.dropout && (
                          <span className="inline-flex items-center gap-1 text-warning">
                            <WifiOff aria-hidden className="size-3" />
                            Disconnected
                          </span>
                        )}
                        <span>
                          {s.player.wins} win{s.player.wins === 1 ? "" : "s"} in this room
                        </span>
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-0.5 text-right">
                      <span className="text-[0.8125rem] text-muted-foreground">
                        <span className="font-mono text-[1.0625rem] tabular-nums text-foreground">
                          {r.main}
                        </span>
                        {r.unit && <> {r.unit}</>}
                      </span>
                      {r.note && (
                        <span className="text-[0.75rem] text-muted-foreground">{r.note}</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>

          {hasProgress && (
            <section aria-labelledby="progress-title" className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h2 id="progress-title" className="text-title font-semibold">
                  How the round unfolded
                </h2>
                <p className="text-body-sm text-muted-foreground">
                  {mode.format === "survival" ? "Questions cleared" : "Correct answers"} over time.
                  Hover or tap the chart to compare at any second.
                </p>
              </div>
              <ProgressChart
                series={series}
                yMax={yMax}
                durationMs={chartDuration}
                unit={mode.format === "survival" ? "cleared" : "correct"}
              />
            </section>
          )}
        </div>

        <aside
          aria-labelledby="results-chat"
          className="sticky top-20 hidden h-[min(40rem,calc(100dvh-7rem))] flex-col overflow-hidden rounded-lg border bg-card lg:flex"
        >
          <h2 id="results-chat" className="border-b px-4 py-3 text-title-sm font-semibold">
            Chat
          </h2>
          <RoomChat
            roomId={room.id}
            myUid={myUid}
            names={names}
            messages={messages}
            events={events}
            className="flex-1"
          />
        </aside>
      </div>
      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent side="bottom" className="flex h-[85dvh] flex-col gap-0 rounded-t-xl p-0">
          <SheetHeader className="border-b px-4 py-3 text-left">
            <SheetTitle>Chat</SheetTitle>
            <SheetDescription className="sr-only">
              Messages from everyone in the room
            </SheetDescription>
          </SheetHeader>
          <RoomChat
            roomId={room.id}
            myUid={myUid}
            names={names}
            messages={messages}
            events={events}
            className="flex-1"
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
