import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTimer } from 'react-timer-hook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoom, Room } from '@/hooks/useRoom';
import { useAuth } from '@/contexts/AuthContext';
import QuizPrompt from '@/features/quiz/quiz-questions/Quiz-Prompt.component';
import QuizStats from '@/features/quiz/quiz-questions/Quiz-Stats.component';

export default function MultiplayerGame() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribeToRoom, updatePlayerScore, finishGame } = useRoom();
  const [room, setRoom] = useState<Room | null>(null);
  const [score, setScore] = useState(0);
  const [randomSetting, setRandomSetting] = useState<any>(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      setRoom(updatedRoom);
      
      // Initialize random setting when room loads
      if (!randomSetting && updatedRoom.gameMode.questions.length > 0) {
        const setting = updatedRoom.gameMode.questions[
          Math.floor(Math.random() * updatedRoom.gameMode.questions.length)
        ];
        setRandomSetting(setting);
      }

      // Navigate to results when game finishes
      if (updatedRoom.status === 'finished') {
        navigate(`/multiplayer/results/${roomId}`);
      }
    });

    return () => unsubscribe();
  }, [roomId, subscribeToRoom, navigate, randomSetting]);

  // Update score in Firebase
  useEffect(() => {
    scoreRef.current = score;
    if (roomId) {
      updatePlayerScore(roomId, score);
    }
  }, [score, roomId, updatePlayerScore]);

  const time = new Date();
  if (room) {
    time.setSeconds(time.getSeconds() + room.gameMode.duration);
  }

  const timer = useTimer({
    expiryTimestamp: time,
    onExpire: async () => {
      if (roomId) {
        await finishGame(roomId);
      }
    },
  });

  const handleCorrectAnswer = () => {
    setScore((prev) => prev + 1);
    if (room) {
      const newSetting = room.gameMode.questions[
        Math.floor(Math.random() * room.gameMode.questions.length)
      ];
      setRandomSetting(newSetting);
    }
  };

  if (!room || !randomSetting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main game area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{room.gameMode.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuizStats timer={timer} score={score} />
              <QuizPrompt
                setting={randomSetting}
                onCorrectAnswer={handleCorrectAnswer}
              />
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Live Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.values(room.players)
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div
                      key={player.uid}
                      className={`flex items-center justify-between p-3 rounded-md ${
                        player.uid === user?.uid
                          ? 'bg-primary/10 border border-primary'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className={player.uid === user?.uid ? 'font-bold' : ''}>
                          {player.displayName}
                        </span>
                      </div>
                      <span className="font-bold text-lg">{player.score}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

