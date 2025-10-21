import { useEffect, useRef } from "react";
import { useTimer } from "react-timer-hook";
import { CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuizStats({ expiryTimestamp, setRunning, score, timer: externalTimer }) {
    function handleOnExpire() {
        setRunning(false);
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

    // For singleplayer, restart the timer when component mounts
    useEffect(() => {
        if (!externalTimer) {
            // Restart timer to ensure it starts counting down
            internalTimer.restart(expiryTimestamp, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    // Calculate total seconds from timer components
    const totalSeconds = timer.seconds + timer.minutes * 60 + timer.hours * 3600;

    // Format time as MM:SS
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Determine if time is running low (less than 10 seconds)
    const isLowTime = totalSeconds <= 10 && totalSeconds > 0;
    const isCriticalTime = totalSeconds <= 5 && totalSeconds > 0;

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

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []); // Only run on mount/unmount

    return (
        <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-4">
                {/* Timer Display */}
                <div className="flex items-center gap-3">
                    <Clock className={cn(
                        "h-6 w-6 flex-shrink-0",
                        isCriticalTime && "text-red-600 dark:text-red-400 animate-pulse",
                        isLowTime && !isCriticalTime && "text-orange-600 dark:text-orange-400"
                    )} />
                    <div className="flex flex-col justify-center">
                        <span className="text-xs text-muted-foreground leading-tight">Time</span>
                        <span className={cn(
                            "text-2xl font-bold font-mono tabular-nums leading-tight",
                            isCriticalTime && "text-red-600 dark:text-red-400 animate-pulse",
                            isLowTime && !isCriticalTime && "text-orange-600 dark:text-orange-400"
                        )}>
                            {formattedTime}
                        </span>
                    </div>
                </div>

                {/* Score Display */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end justify-center">
                        <span className="text-xs text-muted-foreground leading-tight">Score</span>
                        <Badge variant="secondary" className="text-xl font-bold px-3 py-1 mt-0.5">
                            {score}
                        </Badge>
                    </div>
                    <Trophy className="h-6 w-6 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                </div>
            </div>
        </CardHeader>
    );
}
