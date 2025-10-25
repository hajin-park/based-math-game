import { useState, useEffect, useContext, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { QuizPrompt, QuizStats } from "@features/quiz";
import { QuizContext, ResultContext } from "@/contexts/GameContexts";
import { useGameSettings } from "@/hooks/useGameSettings";
import { getGameModeById, isSpeedrunMode } from "@/types/gameMode";
import Countdown from "@/components/Countdown";
import ExitButton from "@/components/ExitButton";

export default function Quiz() {
  const quizContext = useContext(QuizContext);
  const resultContext = useContext(ResultContext);
  const navigate = useNavigate();

  if (!quizContext || !resultContext) {
    throw new Error(
      "Quiz must be used within QuizContext and ResultContext providers",
    );
  }

  const { settings } = quizContext;
  const { setResults } = resultContext;
  const { settings: gameSettings, loading: gameSettingsLoading } = useGameSettings();

  // Initialize all state and refs before any conditional returns
  // Start with true, will be updated when settings load
  const [showCountdown, setShowCountdown] = useState(true);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [randomSetting, setRandomSetting] = useState<
    [string, string, number, number] | null
  >(
    settings?.questions?.length > 0
      ? settings.questions[
          Math.floor(Math.random() * settings.questions.length)
        ]
      : null,
  );

  // Determine if this is a speedrun mode
  const gameMode = useMemo(
    () => (settings.gameModeId ? getGameModeById(settings.gameModeId) : null),
    [settings.gameModeId],
  );
  const isSpeedrun = useMemo(() => isSpeedrunMode(gameMode), [gameMode]);

  // Use ref to capture the latest score value to prevent race conditions
  const scoreRef = useRef(score);

  // Track game start time for duration calculation (set when countdown completes)
  const startTimeRef = useRef<number | null>(null);

  // Track keystrokes and backspaces for accuracy calculation
  const totalKeystrokesRef = useRef(0);
  const backspaceCountRef = useRef(0);

  // Track if we've initialized the countdown state from settings
  const hasInitializedCountdownRef = useRef(false);

  // Track if timer should start (after countdown)
  const [timerShouldStart, setTimerShouldStart] = useState(false);

  // Create expiry timestamp - will be set when countdown completes or immediately if no countdown
  const [expiryTimestamp, setExpiryTimestamp] = useState<Date>(() => {
    const time = new Date();
    time.setSeconds(time.getSeconds() + 60); // Placeholder
    return time;
  });

  // Update countdown state when gameSettings loads (only once)
  useEffect(() => {
    if (!hasInitializedCountdownRef.current && !gameSettingsLoading) {
      hasInitializedCountdownRef.current = true;
      setShowCountdown(gameSettings.countdownStart);
      setTimerShouldStart(!gameSettings.countdownStart);

      // If countdown is disabled, create the expiry timestamp immediately and start timer
      if (!gameSettings.countdownStart) {
        const time = new Date();
        const duration =
          isSpeedrun || settings.duration === 0 ? 86400 : settings.duration;
        time.setSeconds(time.getSeconds() + duration);
        setExpiryTimestamp(time);
        startTimeRef.current = Date.now();
      }
    }
  }, [gameSettings.countdownStart, gameSettingsLoading, isSpeedrun, settings.duration]);

  // Validate settings - if invalid, redirect to home
  useEffect(() => {
    if (!settings || !settings.questions || settings.questions.length === 0) {
      console.error("Invalid quiz settings - redirecting to home");
      navigate("/", { replace: true });
    }
  }, [settings, navigate]);

  // Keep scoreRef in sync with score state
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Check if target questions reached (for speed run modes)
  useEffect(() => {
    if (
      isSpeedrun &&
      gameMode?.targetQuestions &&
      score >= gameMode.targetQuestions
    ) {
      // Target reached, end the game
      setRunning(false);
    }
  }, [score, isSpeedrun, gameMode]);

  useEffect(() => {
    if (!running) {
      // Calculate game duration (only if timer actually started)
      const duration = startTimeRef.current
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0;

      // Calculate accuracy: (total keystrokes - backspaces) / total keystrokes
      const totalKeystrokes = totalKeystrokesRef.current;
      const backspaceCount = backspaceCountRef.current;
      const accuracy =
        totalKeystrokes > 0
          ? ((totalKeystrokes - backspaceCount) / totalKeystrokes) * 100
          : 0;

      // For speedrun modes, score is the elapsed time (lower is better)
      // For timed modes, score is the number of correct answers
      const finalScore = isSpeedrun ? duration : scoreRef.current;

      setResults({
        score: finalScore,
        duration,
        gameModeId: settings.gameModeId,
        totalKeystrokes,
        backspaceCount,
        accuracy: Math.round(accuracy * 100) / 100, // Round to 2 decimal places
      });
      navigate("/results");
    }
  }, [running, navigate, setResults, settings.gameModeId, isSpeedrun]);

  useEffect(() => {
    if (settings?.questions?.length > 0) {
      const randomIndex = Math.floor(Math.random() * settings.questions.length);
      setRandomSetting(settings.questions[randomIndex]);
    }
  }, [score, settings.questions]);

  // Early return with loading state if settings are invalid
  if (
    !settings ||
    !settings.questions ||
    settings.questions.length === 0 ||
    !randomSetting
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle countdown completion
  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setTimerShouldStart(true);
    startTimeRef.current = Date.now(); // Start tracking time when countdown completes

    // Create the actual expiry timestamp NOW (after countdown)
    const time = new Date();
    const duration =
      isSpeedrun || settings.duration === 0 ? 86400 : settings.duration;
    time.setSeconds(time.getSeconds() + duration);
    setExpiryTimestamp(time);
  };

  console.log(settings);

  return (
    <>
      <ExitButton onExit={() => navigate("/")} />
      {showCountdown && (
        <Countdown onComplete={handleCountdownComplete} duration={3} />
      )}
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-4xl shadow-lg">
          <QuizStats
            expiryTimestamp={expiryTimestamp}
            setRunning={setRunning}
            score={score}
            shouldStartTimer={timerShouldStart}
            isUnlimited={settings.duration === 0}
            isSpeedrun={isSpeedrun}
            targetQuestions={gameMode?.targetQuestions}
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
