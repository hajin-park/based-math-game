/**
 * Run screen: /play/:modeId (custom drills: /play/custom?c=…, daily:
 * /play/daily:YYYY-MM-DD for today only). Immersive: no nav or footer.
 * The page is an exercise sheet: a test-paper header with the examiner's
 * box and the clock as a printed rule, then one problem at a time in a
 * centred column with the problem number in the margin.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import Countdown from "@/components/Countdown";
import { GridPaper } from "@/components/ui/grid-paper";
import { Kbd } from "@/components/ui/kbd";
import { toast } from "@/components/ui/use-toast";
import { useGameSettings, usePersonalBest } from "@/data";
import {
  customMode,
  dailyDateOf,
  getMode,
  randomSeed,
  useRun,
  utcDateKey,
  type CustomConfig,
  type GameMode,
  type RunSummary,
} from "@/game";
import { GameSurface, useSoundCues } from "@/features/play/GameSurface";
import { RunHeader } from "@/features/play/RunHeader";
import { decodeCustomConfig } from "@/features/play/links";
import { formatLine, modeTitle } from "@/features/play/describe";
import { PauseOverlay } from "@/features/play/PauseOverlay";
import {
  rememberResults,
  setLastMode,
  type ResultsState,
} from "@/features/play/session";
import { cn } from "@/lib/utils";

type Resolved =
  | { ok: true; mode: GameMode; custom?: CustomConfig }
  | { ok: false; to: string; message?: string };

function resolveMode(modeId: string, c: string | null): Resolved {
  if (modeId === "custom") {
    const config = decodeCustomConfig(c);
    if (!config)
      return {
        ok: false,
        to: "/play",
        message: "That custom drill link is incomplete or broken.",
      };
    return { ok: true, mode: customMode(config), custom: config };
  }
  const date = dailyDateOf(modeId);
  if (modeId.startsWith("daily:")) {
    if (!date || date !== utcDateKey())
      return {
        ok: false,
        to: "/daily",
        message: "Only today's daily challenge can be played.",
      };
  }
  const mode = getMode(modeId);
  if (!mode)
    return {
      ok: false,
      to: "/play",
      message: `There is no mode called “${modeId.slice(0, 40)}”.`,
    };
  return { ok: true, mode };
}

function RedirectWithToast({ to, message }: { to: string; message?: string }) {
  useEffect(() => {
    if (message) toast({ title: "Can't start that run", description: message });
  }, [message]);
  return <Navigate to={to} replace />;
}

export default function PlayRun() {
  const { modeId = "" } = useParams();
  const [params] = useSearchParams();
  const c = params.get("c");
  const location = useLocation();
  const resolved = useMemo(() => resolveMode(modeId, c), [modeId, c]);
  if (!resolved.ok)
    return <RedirectWithToast to={resolved.to} message={resolved.message} />;
  // A new location (Play again) remounts the screen with a fresh run.
  return (
    <RunScreen
      key={location.key}
      mode={resolved.mode}
      custom={resolved.custom}
    />
  );
}

type Phase = "loading" | "countdown" | "playing";

function RunScreen({
  mode,
  custom,
}: {
  mode: GameMode;
  custom?: CustomConfig;
}) {
  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = useGameSettings();
  const { best } = usePersonalBest(mode.id);
  const [seed] = useState(randomSeed);
  const [phase, setPhase] = useState<Phase>("loading");
  const [paused, setPaused] = useState(false);
  const cues = useSoundCues(settings.soundEffects);

  const bestRef = useRef(best);
  useEffect(() => {
    bestRef.current = best;
  }, [best]);

  const onFinish = useCallback(
    (summary: RunSummary) => {
      if (!summary.completed) return;
      cues.play("finish");
      setLastMode(mode.id, custom);
      const state: ResultsState = {
        summary,
        custom,
        previousBest: mode.topicId === "custom" ? null : bestRef.current,
      };
      rememberResults(state);
      navigate("/results", { replace: true, state });
    },
    [cues, mode, custom, navigate],
  );

  const run = useRun({ mode, seed, onFinish, paused });
  const running = run.status === "running";

  // Settings decide whether to count down. Guests resolve immediately.
  useEffect(() => {
    if (phase !== "loading" || settingsLoading) return;
    setPhase(settings.countdownStart ? "countdown" : "playing");
  }, [phase, settingsLoading, settings.countdownStart]);

  const start = run.start;
  useEffect(() => {
    if (phase === "playing") start();
  }, [phase, start]);

  // Escape pauses (the overlay's own Escape resumes). Leaving the tab pauses
  // too, so a notification never costs a life.
  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || paused) return;
      if (document.querySelector("[role=alertdialog],[role=dialog]")) return;
      e.preventDefault();
      setPaused(true);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") setPaused(true);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [running, paused]);

  const exit = useCallback(() => {
    navigate(
      mode.format === "daily"
        ? "/daily"
        : `/play?mode=${encodeURIComponent(mode.id)}`,
      { replace: true },
    );
  }, [navigate, mode]);

  useEffect(() => {
    document.title = `${modeTitle(mode)} · Based Math Game`;
  }, [mode]);

  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      <RunHeader
        run={run}
        previousBest={best}
        onPause={() => setPaused(true)}
        cues={cues}
      />
      <section
        aria-label="Game"
        className="relative isolate flex flex-1 justify-center px-4 sm:px-6"
      >
        <div className="relative flex w-full max-w-2xl flex-col">
          {/* Graph lines only around the work, and the exercise book's
              double margin rule on wide screens. */}
          <GridPaper fade className="-inset-x-24 opacity-80" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-[calc(3.75rem+0.375rem)] hidden w-[3px] border-x border-primary/25 lg:block"
          />
          <div
            className={cn(
              "flex w-full flex-col pb-8 pt-7 sm:my-auto sm:pb-14 sm:pt-10 pointer-coarse:my-0 pointer-coarse:pt-5 [@media(max-height:560px)]:my-0 [@media(max-height:560px)]:pt-3",
              paused && "invisible",
            )}
            aria-hidden={paused || undefined}
          >
            <GameSurface run={run} settings={settings} />
          </div>
          <p className="mb-6 hidden items-center gap-5 pl-[4.75rem] text-label text-muted-foreground sm:pointer-fine:flex [@media(max-height:560px)]:hidden">
            <span className="inline-flex items-center gap-1.5">
              <Kbd size="sm">Tab</Kbd> skip
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Kbd size="sm">Esc</Kbd> pause
            </span>
            <span className="font-serif italic">Answers mark themselves.</span>
          </p>
        </div>
      </section>
      <PauseOverlay
        open={paused && running}
        practice={mode.format === "practice"}
        onResume={() => setPaused(false)}
        onLeave={exit}
      />
      {phase === "countdown" && (
        <Countdown
          skippable
          caption={`${modeTitle(mode)} · ${formatLine(mode)}`}
          onComplete={() => setPhase("playing")}
        />
      )}
    </div>
  );
}
