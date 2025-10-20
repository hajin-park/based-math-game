import { useContext, useEffect, useState } from "react";
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

    const quizContext = useContext(QuizContext);
    const resultContext = useContext(ResultContext);

    if (!quizContext || !resultContext) {
        throw new Error('Results must be used within QuizContext and ResultContext providers');
    }

    const { settings } = quizContext;
    const { results } = resultContext;

    // Save game results to Firebase
    useEffect(() => {
        const saveResults = async () => {
            if (results.score !== undefined && results.duration && !saving) {
                setSaving(true);
                try {
                    await saveGameResult({
                        score: results.score,
                        duration: results.duration,
                        gameModeId: results.gameModeId,
                    });
                } catch (error) {
                    console.error('Failed to save game results:', error);
                } finally {
                    setSaving(false);
                }
            }
        };

        saveResults();
    }, []);

    const gameMode = results.gameModeId ? getGameModeById(results.gameModeId) : null;

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
                    {saving && (
                        <p className="text-sm text-muted-foreground">Saving results...</p>
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
