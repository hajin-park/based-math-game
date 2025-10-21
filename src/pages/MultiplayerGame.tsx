import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoom, Room } from '@/hooks/useRoom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import QuizPrompt from '@/features/quiz/quiz-questions/Quiz-Prompt.component';
import QuizStats from '@/features/quiz/quiz-questions/Quiz-Stats.component';

export default function MultiplayerGame() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscribeToRoom, updatePlayerScore, finishGame } = useRoom();

  // Handle timer expiration
  const handleTimerExpire = async () => {
    if (roomId) {
      await finishGame(roomId);
    }
  };
  const [room, setRoom] = useState<Room | null>(null);
  const [score, setScore] = useState(0);
  const [randomSetting, setRandomSetting] = useState<[string, string, number, number] | null>(null);
  const scoreRef = useRef(0);
  const questionsRef = useRef<[string, string, number, number][]>([]);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      // Handle room deletion (host disconnected)
      if (!updatedRoom) {
        // Prevent multiple navigations
        if (hasNavigatedRef.current) return;
        hasNavigatedRef.current = true;

        // Navigate first, then show toast
        navigate('/multiplayer', { replace: true });

        // Show toast after navigation
        setTimeout(() => {
          toast({
            title: 'Host Disconnected',
            description: 'The host has left the game.',
            variant: 'destructive',
          });
        }, 100);
        return;
      }

      setRoom(updatedRoom);

      // Shuffle questions based on startedAt to get different questions each game
      // Use startedAt as seed so all players get same shuffled order
      if (updatedRoom.startedAt) {
        const seed = updatedRoom.startedAt;
        const questions = [...updatedRoom.gameMode.questions];

        // Seeded shuffle using Fisher-Yates with LCG random
        const seededRandom = (s: number) => {
          const a = 1664525;
          const c = 1013904223;
          const m = Math.pow(2, 32);
          return ((a * s + c) % m) / m;
        };

        let currentSeed = seed;
        for (let i = questions.length - 1; i > 0; i--) {
          currentSeed = Math.floor(seededRandom(currentSeed) * Math.pow(2, 32));
          const j = Math.floor(seededRandom(currentSeed) * (i + 1));
          [questions[i], questions[j]] = [questions[j], questions[i]];
        }

        questionsRef.current = questions;
      } else {
        // Game hasn't started yet, use original order
        questionsRef.current = updatedRoom.gameMode.questions;
      }

      // Navigate to lobby if game was reset (host left mid-game)
      if (updatedRoom.status === 'waiting') {
        navigate(`/multiplayer/lobby/${roomId}`, { replace: true });
        toast({
          title: 'Host Left',
          description: 'The host left the game. A new host has been assigned.',
        });
        return;
      }

      // Navigate to results when game finishes
      if (updatedRoom.status === 'finished') {
        navigate(`/multiplayer/results/${roomId}`);
      }
    });

    return () => unsubscribe();
  }, [roomId, subscribeToRoom, navigate, toast]);

  // Initialize question based on current score - deterministic for all players
  useEffect(() => {
    if (questionsRef.current.length > 0) {
      // Use score as index to ensure all players get same questions in same order
      // Score 0 = question 0, score 1 = question 1, etc.
      const questionIndex = score % questionsRef.current.length;
      const setting = questionsRef.current[questionIndex];
      setRandomSetting(setting);
    }
  }, [score]); // Runs on mount (score=0) and whenever score changes

  // Update score in Firebase
  useEffect(() => {
    scoreRef.current = score;
    if (roomId) {
      updatePlayerScore(roomId, score);
    }
  }, [score, roomId, updatePlayerScore]);

  // Calculate expiry timestamp based on room startedAt and duration
  // This is calculated once when the game starts and doesn't change
  const expiryTimestamp = useMemo(() => {
    if (room?.startedAt && room?.gameMode.duration) {
      const elapsed = Math.floor((Date.now() - room.startedAt) / 1000);
      const remaining = Math.max(0, room.gameMode.duration - elapsed);
      const expiry = new Date();
      expiry.setSeconds(expiry.getSeconds() + remaining);

      console.log('Calculating expiry timestamp:', {
        startedAt: room.startedAt,
        elapsed,
        remaining,
        expiry: expiry.toISOString()
      });

      return expiry;
    }

    // Default expiry (60 seconds)
    const time = new Date();
    time.setSeconds(time.getSeconds() + 60);
    return time;
  }, [room?.startedAt, room?.gameMode.duration]);

  // Generate deterministic seed for multiplayer questions
  // Combine room ID hash with score to ensure all players get same questions
  const questionSeed = useMemo(() => {
    if (!roomId) return undefined;
    // Simple hash function for room ID
    let hash = 0;
    for (let i = 0; i < roomId.length; i++) {
      hash = ((hash << 5) - hash) + roomId.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Combine with score to get unique seed for each question
    return hash + score * 1000;
  }, [roomId, score]);

  if (!room || !randomSetting || !room.startedAt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main game area */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <QuizStats
              expiryTimestamp={expiryTimestamp}
              setRunning={handleTimerExpire}
              score={score}
            />
            <CardContent className="p-0">
              <QuizPrompt
                score={score}
                setScore={setScore}
                setting={randomSetting}
                seed={questionSeed}
              />
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                Live Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {Object.values(room.players)
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => {
                    const isCurrentUser = player.uid === user?.uid;
                    const isLeader = index === 0 && player.score > 0;

                    return (
                      <div
                        key={player.uid}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                          isCurrentUser
                            ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/20'
                            : 'bg-muted/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-bold text-lg ${
                            isLeader ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'
                          }`}>
                            {index === 0 && player.score > 0 ? '👑' : `#${index + 1}`}
                          </span>
                          <span className={`${isCurrentUser ? 'font-bold' : ''} truncate max-w-[120px]`}>
                            {player.displayName}
                            {isCurrentUser && ' (You)'}
                          </span>
                        </div>
                        <span className="font-bold text-xl tabular-nums">{player.score}</span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

