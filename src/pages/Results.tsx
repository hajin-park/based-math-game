import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { QuizContext, ResultContext } from "@/contexts/GameContexts";
import { useStats } from "@/hooks/useStats";
import { getGameModeById } from "@/types/gameMode";
import {
    Trophy,
    Clock,
    Target,
    Keyboard,
    Home,
    BarChart3,
    Info
} from "lucide-react";

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
        <div className="flex justify-center items-center min-h-[calc(100vh-8rem)] p-4">
            <Card className="w-full max-w-lg border-2 shadow-xl animate-in">
                <CardHeader className="text-center space-y-4 pb-6">
                    <div className="flex items-center justify-center gap-2">
                        <Trophy className="h-8 w-8 text-success" />
                        <h1 className="text-3xl font-bold gradient-text">Quiz Complete!</h1>
                    </div>
                    {gameMode && (
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant="secondary" className="text-base px-4 py-1">
                                {gameMode.name}
                            </Badge>
                        </div>
                    )}
                </CardHeader>

                <Separator />

                <CardContent className="pt-6 space-y-6">
                    {/* Score - Primary Metric */}
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Trophy className="h-5 w-5" />
                            <p className="text-sm font-medium uppercase tracking-wide">Your Score</p>
                        </div>
                        <p className="text-6xl font-bold gradient-text animate-pulse-glow">
                            {results.score}
                        </p>
                    </div>

                    <Separator />

                    {/* Secondary Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        {results.duration && (
                            <div className="text-center space-y-2 p-4 rounded-lg bg-muted/50">
                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <p className="text-xs font-medium uppercase">Time</p>
                                </div>
                                <p className="text-2xl font-bold">{results.duration}s</p>
                            </div>
                        )}
                        {results.accuracy !== undefined && (
                            <div className="text-center space-y-2 p-4 rounded-lg bg-muted/50">
                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                    <Target className="h-4 w-4" />
                                    <p className="text-xs font-medium uppercase">Accuracy</p>
                                </div>
                                <p className="text-2xl font-bold">{results.accuracy.toFixed(1)}%</p>
                            </div>
                        )}
                    </div>

                    {/* Keystroke Details */}
                    {results.totalKeystrokes !== undefined && (
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Keyboard className="h-4 w-4 text-primary" />
                                <p className="text-sm font-medium">Keystroke Analysis</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                <div>Total: {results.totalKeystrokes}</div>
                                <div>Backspaces: {results.backspaceCount}</div>
                            </div>
                        </div>
                    )}

                    {/* Status Messages */}
                    {saving && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                            <span>Saving results...</span>
                        </div>
                    )}
                    {!shouldTrack && (
                        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                            <Info className="h-4 w-4" />
                            <span className="italic">This game was not tracked</span>
                        </div>
                    )}
                </CardContent>

                <Separator />

                <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Button
                        onClick={() => navigate("/stats")}
                        variant="outline"
                        className="w-full sm:w-1/2"
                    >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Stats
                    </Button>
                    <Button
                        onClick={() => navigate("/")}
                        className="w-full sm:w-1/2 shadow-sm"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Play Again
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
