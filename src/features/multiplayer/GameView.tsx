import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Flag, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GridPaper } from "@/components/ui/grid-paper";
import { Meter } from "@/components/ui/meter";
import { PenTick } from "@/components/ui/pen-mark";
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
import { roomApi, type Room, type RoomPlayer } from "@/hooks/useRoom";
import type { ConfirmRequest } from "./ConfirmDialog";
import {
  loadRoundRun,
  planResume,
  pruneRoundRuns,
  roundStore,
  saveRoundRun,
  snapshotCorrect,
  snapshotMarks,
  type ResumePlan,
} from "./roundResume";
import { Scoreboard } from "./Scoreboard";
import { ordinal, rankPlayers } from "./standings";
import type { LinkState } from "./useRoomState";

/** Minimum gap between score writes; the last change always gets written. */
const SCORE_PUSH_MS = 400;
/** How long the "picked up where you left off" note stays up. */
const RESUME_NOTE_MS = 8000;

function clock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
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
  // Back after a reload (or a dropped connection that reloaded the tab):
  // continue the run from this device's snapshot, else from the progress the
  // room recorded. Decided once, when the round's view mounts.
  const [plan] = useState(() =>
    planResume(loadRoundRun(roundStore(), room.id, room.serverStartedAt), me),
  );
  useEffect(() => pruneRoundRuns(roundStore()), []);

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
        roomApi.endRound(room.id).catch(() =>
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
              className="flex items-center gap-2 border-y border-warning/40 px-1 py-2 text-body-sm"
            >
              <WifiOff aria-hidden className="size-4 text-warning" />
              Reconnecting… keep playing; your answers sync when you're back.
            </p>
          )}
          {plan.kind === "finished" ? (
            <>
              <MyFinish
                room={room}
                myUid={myUid}
                figures={recordedFigures(me, mode.format)}
              />
              {strip}
            </>
          ) : (
            <Player
              room={room}
              mode={mode}
              myUid={myUid}
              target={target}
              scoreboard={strip}
              plan={plan}
              recorded={me?.progress ?? []}
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
        {/* The margin column: class standings beside the exercise. */}
        <aside className="hidden border-l border-primary/30 pl-6 lg:block">
          <div className="sticky top-8">
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
  plan,
  recorded,
}: {
  room: Room;
  mode: GameMode;
  myUid: string;
  target: number;
  scoreboard: ReactNode;
  plan: Extract<ResumePlan, { kind: "play" }>;
  /** Progress marks the room already holds for this round. */
  recorded: readonly number[];
}) {
  const { settings } = useGameSettings();
  const seed = room.seed ?? 0;
  const startAt = room.startedAt ?? Date.now();
  const round = room.serverStartedAt;
  // Past the shared start (or with progress to restore): mount running, on
  // the shared clock, instead of counting down to a start already gone by.
  const [resume] = useState(() =>
    plan.snapshot || Date.now() >= startAt
      ? { snapshot: plan.snapshot, startedAt: startAt }
      : null,
  );
  // Marks the room recorded stay as they are; any newer ones (written
  // locally just before the reload) come from the snapshot.
  const [initial] = useState(() => {
    const correct = plan.snapshot ? snapshotCorrect(plan.snapshot) : 0;
    const local = snapshotMarks(plan.snapshot);
    return {
      correct,
      marks: [...recorded.slice(0, correct), ...local.slice(recorded.length)],
    };
  });
  const marks = useRef<number[]>(initial.marks);
  const correctRef = useRef(initial.correct);
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

  const run = useRun({ mode, seed, onFinish, resume });

  // What the note says after picking the round back up.
  const [resumed] = useState(() =>
    plan.source !== "none" && run.status === "running"
      ? { question: run.index + 1, correct: run.correct, source: plan.source }
      : null,
  );
  const [noteUp, setNoteUp] = useState(true);
  useEffect(() => {
    if (!resumed) return;
    const t = window.setTimeout(() => setNoteUp(false), RESUME_NOTE_MS);
    return () => window.clearTimeout(t);
  }, [resumed]);

  // Keep this device's record of the run current, for the next reload.
  const { snapshot } = run;
  useEffect(() => {
    if (snapshot && typeof round === "number")
      saveRoundRun(roundStore(), room.id, round, snapshot);
  }, [snapshot, room.id, round]);

  // A score reached just before the reload may not have been written yet.
  useEffect(() => {
    if (resume?.snapshot) void push();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Synchronised start: everyone begins at the same server moment; a late
  // start (a slow tab) still runs on that shared clock.
  const { status, start, finish } = run;
  useEffect(() => {
    if (status !== "ready") return;
    const go = () => start(Math.max(0, Date.now() - startAt));
    const wait = startAt - Date.now();
    if (wait <= 0) {
      go();
      return;
    }
    const t = window.setTimeout(go, wait);
    return () => window.clearTimeout(t);
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

  // A run restored as finished has its summary on the first render.
  const finished = result ?? run.summary;
  if (finished)
    return (
      <>
        <MyFinish
          room={room}
          myUid={myUid}
          figures={summaryFigures(finished, mode.format)}
        />
        {scoreboard}
      </>
    );

  return (
    <div
      className="flex flex-col gap-4 sm:gap-6"
      data-index={run.index}
      data-run={run.status}
      data-resumed={resumed?.source}
    >
      <div className="flex flex-col gap-3">
        <Hud run={run} mode={mode} target={target} />
        {scoreboard}
      </div>
      <div className="relative flex min-h-[18rem] flex-col items-center justify-center">
        {run.status === "ready" ? (
          <CountdownPanel startAt={startAt} />
        ) : (
          <div className="relative w-full max-w-2xl">
            {/* The same exercise page as a solo run: the double margin rule. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-[calc(3.75rem+0.375rem)] hidden w-[3px] border-x border-primary/25 lg:block"
            />
            <GameSurface
              run={run}
              settings={settings}
              allowVisualAids={room.allowVisualAids}
              showSkip
            />
          </div>
        )}
      </div>
      {/* Under the exercise, so it never moves the prompt when it goes. */}
      <p role="status" className="mx-auto w-full max-w-2xl">
        {resumed && noteUp && run.correct === resumed.correct && (
          <span className="block rounded-sm bg-tint px-4 py-3 text-body-sm text-pretty sm:px-5">
            <span className="smallcaps mr-2 text-[0.9375rem] text-primary">
              Note
            </span>
            {resumed.source === "device"
              ? `Picked up where you left off: question ${resumed.question}, ${resumed.correct} correct. The clock kept running while the page reloaded.`
              : `Picked up from your recorded score: ${resumed.correct} correct, on to question ${resumed.question}. The clock kept running while you were away.`}
          </span>
        )}
      </p>
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
    <div className="flex flex-col gap-2.5 border-b border-foreground/25 pb-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="truncate font-serif text-title-sm font-bold">
          {mode.name}
        </p>
        <p className="shrink-0 font-mono text-[1.125rem] tabular-nums">
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
      <p className="smallcaps text-[1rem]">Get ready</p>
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

/** The figures of a finished run, from this device's run or the room's record. */
interface FinishFigures {
  correct: number;
  /** Speedrun: reached the target (otherwise the round ended first). */
  completed: boolean;
  /** Speedrun: time plus skip penalties, in ms. */
  score: number;
  penaltyMs: number;
  /** Unknown when only the room's record is left. */
  skipped?: number;
}

function summaryFigures(
  summary: RunSummary,
  format: GameMode["format"],
): FinishFigures {
  return {
    correct: summary.correct,
    completed: summary.completed,
    score: summary.score,
    penaltyMs: format === "speedrun" ? summary.score - summary.durationMs : 0,
    skipped: summary.skipped,
  };
}

function recordedFigures(
  me: RoomPlayer | undefined,
  format: GameMode["format"],
): FinishFigures {
  const penaltyMs = me?.penaltyMs ?? 0;
  const timed = typeof me?.finishMs === "number";
  return {
    correct: me?.correct ?? 0,
    completed: format !== "speedrun" || timed,
    score: timed ? (me?.finishMs ?? 0) + penaltyMs : 0,
    penaltyMs,
  };
}

function MyFinish({
  room,
  myUid,
  figures,
}: {
  room: Room;
  myUid: string;
  figures: FinishFigures;
}) {
  const mode = room.engineMode as GameMode;
  const left = waitingFor(room);
  const standings = rankPlayers(
    Object.values(room.players).filter((p) => !p.kicked),
    mode.format,
  );
  const mine = standings.find((s) => s.player.uid === myUid);
  const { correct, completed, score, penaltyMs, skipped } = figures;
  const result =
    mode.format === "speedrun"
      ? completed
        ? formatMs(score)
        : `${correct} of ${mode.spec.targetCount ?? SPEEDRUN_TARGET}`
      : mode.format === "survival"
        ? `${correct} cleared`
        : `${correct} correct`;
  const skips =
    skipped === undefined
      ? "skip penalties"
      : `${skipped} skip${skipped > 1 ? "s" : ""}`;
  return (
    <section
      aria-labelledby="my-finish"
      className="paper-sheet flex animate-sheet-in flex-col items-center gap-4 rounded-sm px-6 py-10 text-center"
      data-testid="my-finish"
    >
      <h2
        id="my-finish"
        className="flex items-center gap-2 font-serif text-headline font-bold"
      >
        <PenTick className="size-8" />
        {mode.format === "speedrun" && !completed ? "Time's up" : "Finished"}
      </h2>
      <p className="font-mono text-mono-xl tabular-nums">{result}</p>
      {mode.format === "speedrun" && completed && penaltyMs > 0 && (
        <p className="text-body-sm text-muted-foreground">
          includes {skips} · +{penaltyMs / 1000} s
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
