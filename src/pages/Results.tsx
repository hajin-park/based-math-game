import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { QuizContext, ResultContext } from "@/contexts/GameContexts";
import { useStats } from "@/hooks/useStats";
import { getGameModeById } from "@/types/gameMode";

export default function Quiz() {
    const navigate = useNavigate();
    const { saveGameResult } = useStats();
    const [saving, setSaving] = useState(false);
    const hasSavedRef = useRef(false);

    const quizContext = useContext(QuizContext);
    const resultContext = useContext(ResultContext);

    if (!quizContext || !resultContext) {
        throw new Error('Results must be used within QuizContext and ResultContext providers');
    }

    const { results } = resultContext;
    const { settings } = quizContext;

    // Save game results to Firebase (only once on mount)
    useEffect(() => {
        const saveResults = async () => {
            // Prevent duplicate saves (important for React Strict Mode in development)
            if (hasSavedRef.current) {
                return;
            }

            // Only save if trackStats is true (default to true for backward compatibility)
            const shouldTrack = settings.trackStats !== false;

            if (results.score !== undefined && results.duration && shouldTrack) {
                hasSavedRef.current = true;
                setSaving(true);
                try {
                    await saveGameResult({
                        score: results.score,
                        duration: results.duration,
                        gameModeId: results.gameModeId,
                        totalKeystrokes: results.totalKeystrokes,
                        backspaceCount: results.backspaceCount,
                        accuracy: results.accuracy,
                    });
                } catch (error) {
                    console.error('Failed to save game results:', error);
                    hasSavedRef.current = false; // Reset on error to allow retry
                } finally {
                    setSaving(false);
                }
            }
        };

        saveResults();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - only run once on mount

    const gameMode = results.gameModeId ? getGameModeById(results.gameModeId) : null;
    const shouldTrack = settings.trackStats !== false;

    return (
        <div className="flex justify-center items-center h-full">
            <Card className="w-96">
                <CardHeader className="text-center">
                    <h1 className="text-2xl font-bold">Quiz Complete!</h1>
                    {gameMode && (
                        <p className="text-muted-foreground">{gameMode.name}</p>
                    )}
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Your Score</p>
                        <p className="text-4xl font-bold">{results.score}</p>
                    </div>
                    {results.duration && (
                        <div>
                            <p className="text-sm text-muted-foreground">Time</p>
                            <p className="text-xl">{results.duration}s</p>
                        </div>
                    )}
                    {results.accuracy !== undefined && (
                        <div>
                            <p className="text-sm text-muted-foreground">Accuracy</p>
                            <p className="text-xl font-semibold">{results.accuracy.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {results.totalKeystrokes} keystrokes, {results.backspaceCount} backspaces
                            </p>
                        </div>
                    )}
                    {saving && (
                        <p className="text-sm text-muted-foreground">Saving results...</p>
                    )}
                    {!shouldTrack && (
                        <p className="text-sm text-muted-foreground italic">
                            This game was not tracked
                        </p>
                    )}
                </CardContent>
                <CardFooter className="flex gap-2 justify-center">
                    <Button onClick={() => navigate("/stats")} variant="outline">
                        View Stats
                    </Button>
                    <Button onClick={() => navigate("/")}>
                        Play Again
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
