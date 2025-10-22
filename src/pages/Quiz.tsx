import { useState, useEffect, useContext, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { QuizPrompt, QuizStats } from "@features/quiz";
import { QuizContext, ResultContext } from "@/contexts/GameContexts";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useGameSettings } from "@/hooks/useGameSettings";
import Countdown from "@/components/Countdown";

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

    // Track game start time for duration calculation
    const startTimeRef = useRef(Date.now());

    // Create expiry timestamp only once to prevent timer reset
    const expiryTimestamp = useMemo(() => {
        const time = new Date();
        time.setSeconds(time.getSeconds() + settings.duration);
        return time;
    }, [settings.duration]);

    console.log(settings);

    // Keep scoreRef in sync with score state
    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

    useEffect(() => {
        if (!running) {
            // Calculate game duration
            const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

            // Use scoreRef.current to get the final score value
            setResults({
                score: scoreRef.current,
                duration,
                gameModeId: settings.gameModeId
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

    // Add keyboard shortcuts (Escape to exit)
    useKeyboardShortcuts({
        'escape': () => {
            if (window.confirm('Exit game and return to menu? Your progress will not be saved.')) {
                navigate('/');
            }
        }
    });

    return (
        <>
            {showCountdown && (
                <Countdown
                    onComplete={() => setShowCountdown(false)}
                    duration={3}
                />
            )}
            <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-4xl shadow-lg">
                    <QuizStats
                        expiryTimestamp={expiryTimestamp}
                        setRunning={setRunning}
                        score={score}
                    />
                    <CardContent className="p-0">
                        <QuizPrompt
                            score={score}
                            setScore={setScore}
                            setting={randomSetting}
                            gameSettings={gameSettings}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
