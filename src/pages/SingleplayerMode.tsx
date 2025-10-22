import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import GameModeSelect from '@/features/quiz/quiz-settings/Game-Mode-Select.component';
import { QuizContext } from '@/contexts/GameContexts';
import { GameMode } from '@/types/gameMode';
import { Gamepad2 } from 'lucide-react';

export default function SingleplayerMode() {
  const navigate = useNavigate();
  const quizContext = useContext(QuizContext);

  if (!quizContext) {
    throw new Error('SingleplayerMode must be used within QuizContext provider');
  }

  const { setSettings } = quizContext;

  const handleSelectMode = (mode: GameMode, trackStats: boolean) => {
    setSettings({
      questions: mode.questions,
      duration: mode.duration,
      gameModeId: mode.id,
      trackStats,
    });
    navigate('/quiz');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 animate-in">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gamepad2 className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold gradient-text">Singleplayer</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose from official game modes or create your own custom challenge
        </p>
      </div>

      <GameModeSelect onSelectMode={handleSelectMode} />
    </div>
  );
}

