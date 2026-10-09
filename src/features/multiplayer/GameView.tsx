import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, Flag, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GridPaper } from "@/components/ui/grid-paper";
import { Meter } from "@/components/ui/meter";
import { toast } from "@/components/ui/use-toast";
import { useGameSettings } from "@/data";
import { GameSurface } from "@/features/play/GameSurface";
import {
  formatMs,
  SPEEDRUN_TARGET,
  useRun,
  type GameMode,
  type RunSummary,
} from "@/game";
import { roomApi, type Room } from "@/hooks/useRoom";
import type { ConfirmRequest } from "./ConfirmDialog";
import { Scoreboard } from "./Scoreboard";
import { ordinal, rankPlayers } from "./standings";
import type { LinkState } from "./useRoomState";

/** Minimum gap between score writes; the last change always gets written. */
const SCORE_PUSH_MS = 400;

function clock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function playKey(room: Room) {
  return `bmg:mp:${room.id}:${room.serverStartedAt}`;
}

export function GameView({
  room,
  myUid,
  names,
  link,
  confirm,
}: {
  room: Room;
  myUid: string;
  names: Map<string, string>;
  link: LinkState;
  confirm: (request: ConfirmRequest) => void;
}) {
  const mode = room.engineMode as GameMode;
  const me = room.players[myUid];
  // Reloaded mid-round (or already done): watch instead of starting over,
  // so recorded progress is never replaced by a fresh run.
  const [spectating] = useState(() => {
    if (me?.finished) return true;
    try {
      if (sessionStorage.getItem(playKey(room))) return true;
    } catch {
      /* storage unavailable */
    }
    return (me?.correct ?? 0) > 0 && Date.now() > (room.startedAt ?? 0) + 1000;
  });

  const players = useMemo(
    () => Object.values(room.players).filter((p) => !p.kicked),
    [room.players],
  );
  const target = mode.spec.targetCount ?? SPEEDRUN_TARGET;
  const isHost = room.hostUid === myUid;

  // Sprint rounds have a hard deadline: the host closes the round shortly
  // after it, even if someone's tab went quiet without disconnecting.
  const deadline =
    mode.format === "sprint" && room.startedAt
      ? room.startedAt + (mode.spec.durationMs ?? 60_000) + 5000
      : null;
  useEffect(() => {
    if (!isHost || deadline === null) return;
    const t = window.setTimeout(
      () => void roomApi.endRound(room.id).catch(() => undefined),
      Math.max(0, deadline - Date.now()),
    );
    return () => window.clearTimeout(t);
  }, [isHost, deadline, room.id]);

  const endRound = () =>
    confirm({
      title: "End the round now?",
      description:
        "Everyone stops where they are. Unfinished players are ranked by their progress.",
      confirm: "End round",
      destructive: true,
      onConfirm: () =>
        roomApi
          .endRound(room.id)
          .catch(() =>
            toast({
              variant: "destructive",
              title: "Round not ended",
              description: "Try again.",
            }),
          ),
    });

  // Phones and tablets: a compact strip right under the timer, so live scores
  // stay above the on-screen keyboard.
  const strip = (
    <Scoreboard
      players={players}
      myUid={myUid}
      names={names}
      format={mode.format}
      target={target}
      compact
      className="lg:hidden"
    />
  );

  return (
    <div
      className="relative isolate flex flex-1 flex-col"
      data-testid="mp-game"
      data-mode-id={room.mode.id}
      data-seed={room.seed}
    >
      <GridPaper fade />
      <h1 className="sr-only">{mode.name}, round in progress</h1>
      <div className="container grid flex-1 gap-6 py-4 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-10 lg:py-8">
        <div className="flex min-w-0 flex-col gap-4">
          {link === "reconnecting" && (
            <p
              role="status"
              className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/[0.07] px-3 py-2 text-body-sm"
            >
              <WifiOff aria-hidden className="size-4 text-warning" />
              Reconnecting… keep playing; your answers sync when you're back.
            </p>
          )}
          {spectating ? (
            <>
              <Spectator room={room} myUid={myUid} />
              {strip}
            </>
          ) : (
            <Player
              room={room}
              mode={mode}
              myUid={myUid}
              target={target}
              scoreboard={strip}
            />
          )}
          {isHost && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={endRound}
                className="text-muted-foreground"
              >
                <Flag aria-hidden />
                End round for everyone
              </Button>
            </div>
          )}
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-lg border bg-card/80 p-3 backdrop-blur-[2px]">
            <Scoreboard
              players={players}
              myUid={myUid}
              names={names}
              format={mode.format}
              target={target}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

/** The playing player's run: countdown, HUD, surface, score sync. */
function Player({
  room,
  mode,
  myUid,
  target,
  scoreboard,
}: {
  room: Room;
  mode: GameMode;
  myUid: string;
  target: number;
  scoreboard: ReactNode;
}) {
  const { settings } = useGameSettings();
  const seed = room.seed ?? 0;
  const startAt = room.startedAt ?? Date.now();
  const marks = useRef<number[]>([]);
  const correctRef = useRef(0);
  const lastPush = useRef(0);
  const pushTimer = useRef<number | undefined>(undefined);
  const [result, setResult] = useState<RunSummary | null>(null);

  const push = useCallback(() => {
    window.clearTimeout(pushTimer.current);
    pushTimer.current = undefined;
    lastPush.current = Date.now();
    return roomApi.updatePlayerScore(
      room.id,
      correctRef.current,
      correctRef.current,
      marks.current,
    );
  }, [room.id]);

  const onFinish = useCallback(
    async (summary: RunSummary) => {
      setResult(summary);
      correctRef.current = summary.correct;
      // Exact progression from the outcomes (the last mark may not have been
      // recorded by the effect yet when the run ends on that answer).
      let t = 0;
      const exact: number[] = [];
      for (const o of summary.outcomes) {
        t += o.elapsedMs;
        if (o.result === "correct") exact.push(t);
      }
      if (exact.length >= marks.current.length) marks.current = exact;
      try {
        await push();
        if (mode.format === "speedrun") {
          // An unfinished speedrun (round ended by the host) is not a finish.
          if (summary.completed)
            await roomApi.finishGame(room.id, {
              finishMs: summary.durationMs,
              penaltyMs: summary.score - summary.durationMs,
            });
        } else {
          await roomApi.finishGame(room.id);
        }
      } catch (error) {
        console.error("Error reporting the finish:", error);
      }
    },
    [mode.format, push, room.id],
  );

  const run = useRun({ mode, seed, onFinish });

  // Synchronised start: everyone begins at the same server moment.
  const { status, start, finish } = run;
  useEffect(() => {
    if (status !== "ready") return;
    const go = () => {
      start();
      try {
        sessionStorage.setItem(playKey(room), "1");
      } catch {
        /* storage unavailable */
      }
    };
    const wait = startAt - Date.now();
    if (wait <= 0) {
      go();
      return;
    }
    const t = window.setTimeout(go, wait);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, startAt, start]);

  // Sprint ends at the shared deadline even if this client started late.
  useEffect(() => {
    if (mode.format !== "sprint" || status !== "running") return;
    const deadline = startAt + (mode.spec.durationMs ?? 60_000) + 150;
    const t = window.setTimeout(finish, Math.max(0, deadline - Date.now()));
    return () => window.clearTimeout(t);
  }, [mode, status, startAt, finish]);

  // Record when each point was reached, then write (throttled).
  useEffect(() => {
    if (run.correct <= marks.current.length) return;
    while (marks.current.length < run.correct)
      marks.current.push(run.elapsedMs);
    correctRef.current = run.correct;
    const since = Date.now() - lastPush.current;
    if (since >= SCORE_PUSH_MS) void push();
    else if (pushTimer.current === undefined)
      pushTimer.current = window.setTimeout(
        () => void push(),
        SCORE_PUSH_MS - since,
      );
  }, [run.correct, run.elapsedMs, push]);

  // Leaving the game screen (round ended) flushes a pending write.
  useEffect(
    () => () => {
      if (pushTimer.current !== undefined) void push();
    },
    [push],
  );

  if (result)
    return (
      <>
        <MyFinish room={room} myUid={myUid} summary={result} />
        {scoreboard}
      </>
    );

  return (
    <div
      className="flex flex-col gap-4 sm:gap-6"
      data-index={run.index}
      data-run={run.status}
    >
      <div className="flex flex-col gap-3">
        <Hud run={run} mode={mode} target={target} />
        {scoreboard}
      </div>
      <div className="relative flex min-h-[18rem] flex-col items-center justify-center">
        {run.status === "ready" ? (
          <CountdownPanel startAt={startAt} />
        ) : (
          <GameSurface
            run={run}
            settings={settings}
            allowVisualAids={room.allowVisualAids}
            showSkip
          />
        )}
      </div>
    </div>
  );
}

type Run = ReturnType<typeof useRun>;

function Hud({
  run,
  mode,
  target,
}: {
  run: Run;
  mode: GameMode;
  target: number;
}) {
  const announce = useTimeAnnouncements(run.timeLeftMs);
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card/90 px-4 py-3 shadow-xs backdrop-blur-[2px]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="truncate text-label font-medium">{mode.name}</p>
        <p className="shrink-0 font-mono text-[0.9375rem] tabular-nums">
          {mode.format === "speedrun" ? (
            <span>{formatMs(run.elapsedMs + run.penaltyMs)}</span>
          ) : mode.format === "sprint" ? (
            <span aria-hidden>{clock(run.timeLeftMs ?? 0)}</span>
          ) : (
            <span>{run.correct} cleared</span>
          )}
        </p>
      </div>
      {mode.format === "sprint" && (
        <Meter
          variant="timer"
          value={Math.ceil((run.timeLeftMs ?? 0) / 1000)}
          max={Math.round((mode.spec.durationMs ?? 60_000) / 1000)}
          label="Time left"
          valueText={`${Math.ceil((run.timeLeftMs ?? 0) / 1000)} seconds`}
        />
      )}
      {mode.format === "speedrun" && (
        <Meter
          value={run.correct}
          max={target}
          label="Correct answers"
          showLabel
          display={`${run.correct} / ${target}`}
        />
      )}
      {mode.format === "survival" && (
        <div className="grid grid-cols-[minmax(0,6rem)_minmax(0,1fr)] items-end gap-4">
          <Meter
            variant="lives"
            value={run.lives ?? 0}
            max={mode.spec.lives ?? 3}
            label="Lives"
            showLabel
            display={`${run.lives ?? 0}`}
          />
          <Meter
            variant="timer"
            value={Math.ceil((run.questionTimeLeftMs ?? 0) / 100)}
            max={Math.ceil((run.questionTimeLimitMs ?? 1) / 100)}
            label="This question"
            showLabel
            display={`${Math.ceil((run.questionTimeLeftMs ?? 0) / 1000)} s`}
          />
        </div>
      )}
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </div>
  );
}

/** Speaks "30 seconds left" / "10 seconds left" once each. */
function useTimeAnnouncements(timeLeftMs: number | null) {
  const [text, setText] = useState("");
  const said = useRef(new Set<number>());
  const secs = timeLeftMs === null ? null : Math.ceil(timeLeftMs / 1000);
  useEffect(() => {
    if (secs === null) return;
    for (const mark of [30, 10]) {
      if (secs <= mark && secs > mark - 2 && !said.current.has(mark)) {
        said.current.add(mark);
        setText(`${mark} seconds left`);
      }
    }
  }, [secs]);
  return text;
}

/** 3-2-1 before the shared start; isolated so only it re-renders per tick. */
function CountdownPanel({ startAt }: { startAt: number }) {
  const [left, setLeft] = useState(() => Math.max(0, startAt - Date.now()));
  useEffect(() => {
    const id = window.setInterval(
      () => setLeft(Math.max(0, startAt - Date.now())),
      100,
    );
    return () => window.clearInterval(id);
  }, [startAt]);
  const n = Math.ceil(left / 1000);
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="eyebrow">Get ready</p>
      <p
        key={n}
        className="font-mono text-[clamp(4rem,18vw,7rem)] font-medium leading-none tabular-nums motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95"
        aria-hidden
      >
        {n > 0 ? n : "Go"}
      </p>
      <p className="text-body-sm text-muted-foreground">
        Same questions for everyone. Answers submit themselves.
      </p>
      <p aria-live="assertive" className="sr-only">
        {n > 0 ? `Starting in ${n}` : "Go"}
      </p>
    </div>
  );
}

function waitingFor(room: Room): number {
  return Object.values(room.players).filter(
    (p) => !p.finished && !p.disconnected && !p.kicked,
  ).length;
}

function MyFinish({
  room,
  myUid,
  summary,
}: {
  room: Room;
  myUid: string;
  summary: RunSummary;
}) {
  const mode = room.engineMode as GameMode;
  const left = waitingFor(room);
  const standings = rankPlayers(
    Object.values(room.players).filter((p) => !p.kicked),
    mode.format,
  );
  const mine = standings.find((s) => s.player.uid === myUid);
  const result =
    mode.format === "speedrun"
      ? summary.completed
        ? formatMs(summary.score)
        : `${summary.correct} of ${mode.spec.targetCount ?? SPEEDRUN_TARGET}`
      : mode.format === "survival"
        ? `${summary.correct} cleared`
        : `${summary.correct} correct`;
  return (
    <section
      aria-labelledby="my-finish"
      className="flex flex-col items-center gap-4 rounded-xl border bg-card px-6 py-10 text-center shadow-xs"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-success/10 text-success">
        <Check aria-hidden className="size-5" />
      </span>
      <h2 id="my-finish" className="font-serif text-headline font-medium">
        {mode.format === "speedrun" && !summary.completed
          ? "Time's up"
          : "Finished"}
      </h2>
      <p className="font-mono text-mono-xl tabular-nums">{result}</p>
      {summary.skipped > 0 && mode.format === "speedrun" && (
        <p className="text-body-sm text-muted-foreground">
          includes {summary.skipped} skip{summary.skipped > 1 ? "s" : ""} · +
          {(summary.score - summary.durationMs) / 1000} s
        </p>
      )}
      <p className="text-body-sm text-muted-foreground" role="status">
        {left > 0
          ? `${mine ? `You're ${ordinal(mine.rank)} so far. ` : ""}Waiting for ${left} player${left > 1 ? "s" : ""} to finish…`
          : "Tallying the results…"}
      </p>
    </section>
  );
}

function Spectator({ room, myUid }: { room: Room; myUid: string }) {
  const me = room.players[myUid];
  const left = waitingFor(room);
  // Not playing on: count as done so the round can end without us (a
  // speedrun without a time ranks by progress, like any unfinished run).
  const done = !!me?.finished;
  const [finishedBefore] = useState(done);
  useEffect(() => {
    if (!done) void roomApi.finishGame(room.id).catch(() => undefined);
  }, [done, room.id]);
  return (
    <section
      aria-labelledby="spectating"
      className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-10 text-center"
    >
      <p className="eyebrow">This round</p>
      <h2 id="spectating" className="font-serif text-headline font-medium">
        {finishedBefore ? "You've finished" : "You left mid-round"}
      </h2>
      <p className="max-w-sm text-body-sm text-muted-foreground">
        {finishedBefore
          ? "Your result is in."
          : `Your progress so far is kept: ${me?.correct ?? 0} correct. You'll play the next round from the start.`}{" "}
        {left > 0
          ? `Waiting for ${left} player${left > 1 ? "s" : ""}.`
          : "Results are on the way."}
      </p>
    </section>
  );
}
