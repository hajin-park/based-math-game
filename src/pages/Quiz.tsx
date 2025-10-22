import { useState, useEffect, useContext, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { QuizPrompt, QuizStats } from "@features/quiz";
import { QuizContext, ResultContext } from "@/contexts/GameContexts";
import { useGameSettings } from "@/hooks/useGameSettings";
import { getGameModeById } from "@/types/gameMode";
import Countdown from "@/components/Countdown";
import ExitButton from "@/components/ExitButton";

export default function Quiz() {
    const quizContext = useContext(QuizContext);
    const resultContext = useContext(ResultContext);

    if (!quizContext || !resultContext) {
        throw new Error('Quiz must be used within QuizContext and ResultContext providers');
    }

    const { settings } = quizContext;
    const { setResults } = resultContext;
    const { settings: gameSettings } = useGameSettings();
    const [showCountdown, setShowCountdown] = useState(gameSettings.countdownStart);
    const [running, setRunning] = useState(true);
    const [score, setScore] = useState(0);
    const [randomSetting, setRandomSetting] = useState(
        settings.questions[
            Math.floor(Math.random() * settings.questions.length)
        ]
    );
    const navigate = useNavigate();

    // Use ref to capture the latest score value to prevent race conditions
    const scoreRef = useRef(score);

    // Track game start time for duration calculation (set when countdown completes)
    const startTimeRef = useRef<number | null>(null);

    // Track keystrokes and backspaces for accuracy calculation
    const totalKeystrokesRef = useRef(0);
    const backspaceCountRef = useRef(0);

    // Track if timer should start (after countdown)
    const [timerShouldStart, setTimerShouldStart] = useState(!gameSettings.countdownStart);

    // Create expiry timestamp only once to prevent timer reset
    const expiryTimestamp = useMemo(() => {
        const time = new Date();
        time.setSeconds(time.getSeconds() + settings.duration);
        return time;
    }, [settings.duration]);

    // Handle countdown completion
    const handleCountdownComplete = () => {
        setShowCountdown(false);
        setTimerShouldStart(true);
        startTimeRef.current = Date.now(); // Start tracking time when countdown completes
    };

    console.log(settings);

    // Keep scoreRef in sync with score state
    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

    // Check if target questions reached (for speed run modes)
    useEffect(() => {
        if (settings.gameModeId) {
            const gameMode = getGameModeById(settings.gameModeId);
            if (gameMode?.targetQuestions && score >= gameMode.targetQuestions) {
                // Target reached, end the game
                setRunning(false);
            }
        }
    }, [score, settings.gameModeId]);

    useEffect(() => {
        if (!running) {
            // Calculate game duration (only if timer actually started)
            const duration = startTimeRef.current
                ? Math.floor((Date.now() - startTimeRef.current) / 1000)
                : 0;

            // Calculate accuracy: (total keystrokes - backspaces) / total keystrokes
            const totalKeystrokes = totalKeystrokesRef.current;
            const backspaceCount = backspaceCountRef.current;
            const accuracy = totalKeystrokes > 0
                ? ((totalKeystrokes - backspaceCount) / totalKeystrokes) * 100
                : 0;

            // Use scoreRef.current to get the final score value
            setResults({
                score: scoreRef.current,
                duration,
                gameModeId: settings.gameModeId,
                totalKeystrokes,
                backspaceCount,
                accuracy: Math.round(accuracy * 100) / 100 // Round to 2 decimal places
            });
            navigate("/results");
        }
    }, [running, navigate, setResults, settings.gameModeId]);

    useEffect(() => {
        const randomIndex = Math.floor(
            Math.random() * settings.questions.length
        );
        setRandomSetting(settings.questions[randomIndex]);
    }, [score, settings.questions]);

    return (
        <>
            <ExitButton onExit={() => navigate('/')} />
            {showCountdown && (
                <Countdown
                    onComplete={handleCountdownComplete}
                    duration={3}
                />
            )}
            <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-4xl shadow-lg">
                    <QuizStats
                        expiryTimestamp={expiryTimestamp}
                        setRunning={setRunning}
                        score={score}
                        shouldStartTimer={timerShouldStart}
                    />
                    <CardContent className="p-0">
                        <QuizPrompt
                            score={score}
                            setScore={setScore}
                            setting={randomSetting}
                            gameSettings={gameSettings}
                            onKeystroke={() => totalKeystrokesRef.current++}
                            onBackspace={() => backspaceCountRef.current++}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
