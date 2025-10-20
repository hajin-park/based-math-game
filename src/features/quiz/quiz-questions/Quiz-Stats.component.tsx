import { useEffect } from "react";
import { useTimer } from "react-timer-hook";
import { CardHeader } from "@/components/ui/card";

export default function QuizStats({ expiryTimestamp, setRunning, score }) {
    function handleOnExpire() {
        setRunning(false);
    }

    const timer = useTimer({
        expiryTimestamp,
        onExpire: handleOnExpire,
    });

    // Cleanup timer on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            timer.pause();
        };
    }, [timer]);

    // Pause timer when tab is not visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                timer.pause();
            } else {
                timer.resume();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [timer]);

    return (
        <CardHeader className="flex flex-row justify-between">
            <h2>Seconds left: {timer.totalSeconds}</h2>
            <h2>Score: {score}</h2>
        </CardHeader>
    );
}
