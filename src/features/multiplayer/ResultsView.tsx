import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, RotateCcw, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PenCircle } from "@/components/ui/pen-mark";
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
    const sprintEnd =
      mode.format === "sprint" ? (mode.spec.durationMs ?? 60_000) : 0;
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
            : sprintEnd ||
              (s.player.progress[s.player.progress.length - 1] ?? 0),
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
      toast({
        variant: "destructive",
        title: "Couldn't reopen the lobby",
        description: "Try again.",
      });
      setBusy(false);
    }
  };

  return (
    <>
      <div className="container grid flex-1 gap-10 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] md:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-10 pb-28 md:pb-0">
          <header className="flex flex-col">
            <div className="smallcaps mb-6 flex items-baseline justify-between gap-4 border-b border-foreground/20 pb-1.5">
              <span className="min-w-0 truncate">{mode.name}</span>
              <span className="shrink-0 font-mono text-[0.8125rem] [font-variant-caps:normal]">
                {standings.length} player{standings.length === 1 ? "" : "s"}
              </span>
            </div>
            <h1 className="font-serif text-display-lg font-bold text-balance">
              {mine?.winner
                ? `You won${winners.length > 1 ? " (tied)" : ""}`
                : title}
            </h1>
            {lede && (
              <p
                className="mt-3 text-body-lg text-muted-foreground"
                role="status"
              >
                {lede}
              </p>
            )}
          </header>

          {/* Next step: fixed to the bottom on phones, under the headline on desktop. Solid paper, no glass. */}
          <div className="fixed inset-x-0 bottom-0 z-20 -mt-4 border-t-[3px] border-double border-foreground/60 bg-background px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:static md:border-0 md:bg-transparent md:p-0">
            <div className="mx-auto flex max-w-3xl flex-col gap-2 md:mx-0">
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
                  className="md:hidden"
                  onClick={() => setChatOpen(true)}
                >
                  <MessageSquare aria-hidden />
                  Chat
                </Button>
                {isHost && (
                  <Button
                    type="button"
                    size="lg"
                    className="flex-1 md:flex-none"
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
                  className={cn(!isHost && "flex-1 md:flex-none")}
                  onClick={onLeave}
                >
                  Leave room
                </Button>
              </div>
            </div>
          </div>

          <section
            aria-labelledby="standings-title"
            className="flex flex-col gap-3"
          >
            <h2
              id="standings-title"
              className="font-serif text-title font-bold"
            >
              Standings
            </h2>
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Standings for this round, best first
              </caption>
              <thead>
                <tr className="rule-double">
                  <th scope="col" className="smallcaps w-12 pb-1.5 font-medium">
                    Rank
                  </th>
                  <th scope="col" className="smallcaps pb-1.5 font-medium">
                    Name
                  </th>
                  <th
                    scope="col"
                    className="smallcaps pb-1.5 text-right font-medium"
                  >
                    Result
                  </th>
                  <th
                    scope="col"
                    className="smallcaps hidden w-20 pb-1.5 text-right font-medium sm:table-cell"
                  >
                    Wins
                  </th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s) => {
                  const you = s.player.uid === myUid;
                  const r = resultText(s, mode);
                  return (
                    <tr
                      key={s.player.uid}
                      className="border-b border-primary/20 align-baseline"
                    >
                      <td className="py-3 font-mono text-[1.0625rem] tabular-nums text-primary">
                        {s.rank}
                      </td>
                      <th
                        scope="row"
                        className="py-3 pr-3 text-left font-normal"
                      >
                        <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span
                            className={cn(
                              "font-serif text-[1.125rem] font-bold",
                              you && "highlighter",
                            )}
                          >
                            {name(s.player.uid)}
                          </span>
                          {you && <YouTag />}
                          {s.winner && (
                            <span className="font-serif text-[0.9375rem] font-medium tracking-[0.06em] text-foreground [font-variant-caps:all-small-caps]">
                              winner
                            </span>
                          )}
                        </span>
                        {(s.dropout || r.note) && (
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 font-sans text-[0.8125rem] text-muted-foreground">
                            {s.dropout && (
                              <span className="inline-flex items-center gap-1 text-warning">
                                <WifiOff aria-hidden className="size-3" />
                                Disconnected
                              </span>
                            )}
                            {r.note && <span>{r.note}</span>}
                          </span>
                        )}
                        <span className="mt-0.5 block font-sans text-[0.8125rem] text-muted-foreground sm:hidden">
                          <span className="font-mono">{s.player.wins}</span> win
                          {s.player.wins === 1 ? "" : "s"} in this room
                        </span>
                      </th>
                      <td className="whitespace-nowrap py-3 text-right">
                        <span className="font-mono text-[1.125rem] tabular-nums">
                          {s.winner ? (
                            <PenCircle delay={250}>
                              <span className="inline-block min-w-[1.5em] text-center">
                                {r.main}
                              </span>
                            </PenCircle>
                          ) : (
                            r.main
                          )}
                        </span>
                        {r.unit && (
                          <span className="ml-1.5 font-sans text-[0.8125rem] text-muted-foreground">
                            {r.unit}
                          </span>
                        )}
                      </td>
                      <td className="hidden py-3 text-right font-mono tabular-nums sm:table-cell">
                        {s.player.wins}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="font-sans text-[0.8125rem] text-muted-foreground">
              Wins count rounds won in this room.
            </p>
          </section>

          {hasProgress && (
            <section
              aria-labelledby="progress-title"
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-0.5">
                <h2
                  id="progress-title"
                  className="font-serif text-title font-bold"
                >
                  How the round unfolded
                </h2>
                <p className="text-body-sm text-muted-foreground">
                  {mode.format === "survival"
                    ? "Questions cleared"
                    : "Correct answers"}{" "}
                  over time. Hover or tap the graph to compare at any second.
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
          className="paper-sheet sticky top-20 hidden h-[min(42rem,calc(100dvh-7rem))] flex-col overflow-hidden rounded-sm md:flex"
        >
          <h2
            id="results-chat"
            className="border-b border-foreground/25 px-4 py-3 font-serif text-title-sm font-bold"
          >
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
        <SheetContent
          side="bottom"
          className="flex h-[85dvh] flex-col gap-0 rounded-t-sm p-0"
        >
          <SheetHeader className="border-b border-foreground/25 px-4 py-3 text-left">
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
