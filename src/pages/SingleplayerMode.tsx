import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import GameModeSelect from "@/features/quiz/quiz-settings/Game-Mode-Select.component";
import { QuizContext, QuestionSetting } from "@/contexts/GameContexts";
import { GameMode } from "@/types/gameMode";
import { Gamepad2 } from "lucide-react";

export default function SingleplayerMode() {
  const navigate = useNavigate();
  const location = useLocation();
  const quizContext = useContext(QuizContext);

  // Get custom settings from navigation state (if coming from Play Again on custom game)
  const customSettings = location.state?.customSettings as
    | {
        questions: QuestionSetting[];
        duration: number;
        targetQuestions?: number;
      }
    | undefined;

  if (!quizContext) {
    throw new Error(
      "SingleplayerMode must be used within QuizContext provider",
    );
  }

  const { setSettings } = quizContext;

  const handleSelectMode = (mode: GameMode, trackStats: boolean) => {
    setSettings({
      questions: mode.questions,
      duration: mode.duration,
      gameModeId: mode.id,
      trackStats,
      targetQuestions: mode.targetQuestions,
    });
    navigate("/quiz");
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] paper-texture">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/10 via-background to-background -z-10" />

      <div className="container mx-auto px-4 py-4">
        {/* Compact Header with Academic Styling */}
        <div className="text-center space-y-1 mb-4 animate-in">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-1">
            <Gamepad2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold">
            <span className="highlight-scribble">Singleplayer</span>
          </h1>
          <p className="text-xs text-muted-foreground annotation">
            48 official modes • Custom playground
          </p>
        </div>

        <GameModeSelect
          onSelectMode={handleSelectMode}
          initialCustomSettings={customSettings}
        />
      </div>
    </div>
  );
}
