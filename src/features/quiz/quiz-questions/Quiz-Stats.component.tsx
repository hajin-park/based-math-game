import { useEffect, useRef, useState } from "react";
import { useTimer } from "react-timer-hook";
import { CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizStatsProps {
  expiryTimestamp: Date;
  setRunning: (running: boolean) => void;
  score: number;
  timer?: ReturnType<typeof useTimer>;
  shouldStartTimer?: boolean; // For singleplayer: controls when timer starts (after countdown)
  isUnlimited?: boolean; // For unlimited time mode
  isSpeedrun?: boolean; // For speedrun mode (count up, show questions instead of score)
  targetQuestions?: number; // Target questions for speedrun mode
  gameStartTime?: number; // For multiplayer speedrun: the room.startedAt timestamp
}

export default function QuizStats({
  expiryTimestamp,
  setRunning,
  score,
  timer: externalTimer,
  shouldStartTimer = true,
  isUnlimited = false,
  isSpeedrun = false,
  targetQuestions,
  gameStartTime,
}: QuizStatsProps) {
  function handleOnExpire() {
    // For speedrun modes, timer expiry doesn't end the game
    if (!isSpeedrun) {
      setRunning(false);
    }
  }

  // Use external timer if provided (for multiplayer), otherwise create new timer (for singleplayer)
  const internalTimer = useTimer({
    expiryTimestamp,
    onExpire: handleOnExpire,
    autoStart: false, // Don't auto-start, we'll manually restart
  });

  // Use external timer if provided, otherwise use internal timer
  const timer = externalTimer || internalTimer;

  // Store timer in ref to avoid dependency issues
  const timerRef = useRef(timer);
  timerRef.current = timer;

  // Track if timer has been started
  const hasStartedRef = useRef(false);

  // Track when the timer actually started (for speedrun elapsed time calculation)
  // Use state instead of ref so changes trigger the animation loop effect
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);

  // Force re-render for speedrun timer updates using requestAnimationFrame for accuracy
  const [, forceUpdate] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  // For singleplayer, restart the timer when shouldStartTimer becomes true
  useEffect(() => {
    if (!externalTimer && shouldStartTimer && !hasStartedRef.current) {
      // Restart timer to ensure it starts counting down
      internalTimer.restart(expiryTimestamp, true);
      hasStartedRef.current = true;
      // Record the actual start time for speedrun elapsed calculation
      if (isSpeedrun) {
        setTimerStartTime(Date.now());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldStartTimer]); // Start when shouldStartTimer becomes true

  // For speedrun mode, update the display using requestAnimationFrame for smooth, accurate updates
  useEffect(() => {
    if (isSpeedrun && (timerStartTime || gameStartTime)) {
      let lastSecond = -1;

      const updateTimer = () => {
        const startTime = gameStartTime || timerStartTime;
        if (startTime) {
          const currentSecond = Math.floor((Date.now() - startTime) / 1000);
          // Only force update when the second actually changes
          if (currentSecond !== lastSecond) {
            lastSecond = currentSecond;
            forceUpdate((prev) => prev + 1);
          }
        }
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      };

      // Force an immediate update to show 00:00 right away
      forceUpdate((prev) => prev + 1);

      // Then start the animation loop
      animationFrameRef.current = requestAnimationFrame(updateTimer);

      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isSpeedrun, gameStartTime, timerStartTime]);

  // Calculate total seconds from timer components
  const totalSeconds = timer.seconds + timer.minutes * 60 + timer.hours * 3600;

  // For speedrun mode, calculate elapsed time (count up from 0)
  // Use actual elapsed time from when timer started, not inverted countdown
  let elapsedSeconds: number;
  if (isSpeedrun) {
    // For multiplayer, use gameStartTime if provided
    if (gameStartTime) {
      elapsedSeconds = Math.max(
        0,
        Math.floor((Date.now() - gameStartTime) / 1000),
      );
    }
    // For singleplayer, use timerStartTime
    else if (timerStartTime) {
      elapsedSeconds = Math.floor((Date.now() - timerStartTime) / 1000);
    }
    // Timer hasn't started yet, show 0
    else {
      elapsedSeconds = 0;
    }
  } else {
    elapsedSeconds = totalSeconds;
  }

  // Debug logging for multiplayer timer
  useEffect(() => {
    if (externalTimer) {
      console.log("QuizStats timer update:", {
        isRunning: timer.isRunning,
        totalSeconds,
        elapsedSeconds,
        isSpeedrun,
        seconds: timer.seconds,
        minutes: timer.minutes,
      });
    }
  }, [
    externalTimer,
    timer.isRunning,
    timer.seconds,
    timer.minutes,
    totalSeconds,
    elapsedSeconds,
    isSpeedrun,
  ]);

  // Format time as MM:SS or show "Unlimited"
  const displaySeconds = isSpeedrun ? elapsedSeconds : totalSeconds;
  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;
  const formattedTime = isUnlimited
    ? "∞"
    : `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Determine if time is running low (less than 10 seconds) - not applicable for unlimited or speedrun
  const isLowTime =
    !isUnlimited && !isSpeedrun && totalSeconds <= 10 && totalSeconds > 0;
  const isCriticalTime =
    !isUnlimited && !isSpeedrun && totalSeconds <= 5 && totalSeconds > 0;

  // Cleanup timer on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      timerRef.current.pause();
    };
  }, []); // Only run on mount/unmount

  // Pause timer when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        timerRef.current.pause();
      } else {
        timerRef.current.resume();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []); // Only run on mount/unmount

  return (
    <CardHeader className="border-b">
      <div className="flex items-center justify-between gap-4">
        {/* Timer Display */}
        <div className="flex items-center gap-3">
          <Clock
            className={cn(
              "h-6 w-6 flex-shrink-0",
              isCriticalTime && "text-red-600 dark:text-red-400 animate-pulse",
              isLowTime &&
                !isCriticalTime &&
                "text-orange-600 dark:text-orange-400",
            )}
          />
          <div className="flex flex-col justify-center">
            <span className="text-xs text-muted-foreground leading-tight">
              {isSpeedrun ? "Elapsed" : "Time"}
            </span>
            <span
              className={cn(
                "text-2xl font-bold font-mono tabular-nums leading-tight",
                isCriticalTime &&
                  "text-red-600 dark:text-red-400 animate-pulse",
                isLowTime &&
                  !isCriticalTime &&
                  "text-orange-600 dark:text-orange-400",
              )}
            >
              {formattedTime}
            </span>
          </div>
        </div>

        {/* Score/Questions Display */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end justify-center">
            <span className="text-xs text-muted-foreground leading-tight">
              {isSpeedrun ? "Questions" : "Score"}
            </span>
            <Badge
              variant="secondary"
              className="text-xl font-bold px-3 py-1 mt-0.5"
            >
              {isSpeedrun && targetQuestions
                ? `${score}/${targetQuestions}`
                : score}
            </Badge>
          </div>
          <Trophy className="h-6 w-6 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
        </div>
      </div>
    </CardHeader>
  );
}
