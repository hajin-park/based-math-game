import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GameModeSelect from '@/features/quiz/quiz-settings/Game-Mode-Select.component';
import { QuizContext } from '@/contexts/GameContexts';
import { GameMode } from '@/types/gameMode';

export default function SingleplayerMode() {
  const navigate = useNavigate();
  const quizContext = useContext(QuizContext);

  if (!quizContext) {
    throw new Error('SingleplayerMode must be used within QuizContext provider');
  }

  const { setSettings } = quizContext;

  const handleSelectMode = (mode: GameMode) => {
    setSettings({
      questions: mode.questions,
      duration: mode.duration,
      gameModeId: mode.id,
      trackStats: true,
    });
    navigate('/quiz');
  };

  return (
    <div className="container mx-auto p-4">
      <GameModeSelect onSelectMode={handleSelectMode} />
    </div>
  );
}

