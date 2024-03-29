import { useTimer } from "react-timer-hook";
import { CardHeader } from "@/components/ui/card";

export default function QuizStats({ expiryTimestamp, setRunning, score }) {
    function handleOnExpire() {
        setRunning(false);
    }

    const { totalSeconds } = useTimer({
        expiryTimestamp,
        onExpire: handleOnExpire,
    });

    return (
        <CardHeader className="flex flex-row justify-between">
            <h2>Seconds left: {totalSeconds}</h2>
            <h2>Score: {score}</h2>
        </CardHeader>
    );
}
