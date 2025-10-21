import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoom, Room } from '@/hooks/useRoom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Trophy } from 'lucide-react';

export default function MultiplayerResults() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscribeToRoom, resetRoom } = useRoom();
  const [room, setRoom] = useState<Room | null>(null);
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

      // If room status changed back to waiting, navigate to lobby
      if (updatedRoom.status === 'waiting') {
        navigate(`/multiplayer/lobby/${roomId}`);
      }
    });

    return () => unsubscribe();
  }, [roomId, subscribeToRoom, navigate, toast]);

  const handleReturnToLobby = async () => {
    if (!roomId) return;
    try {
      await resetRoom(roomId);
      // Navigation will happen automatically via the useEffect when status changes to 'waiting'
    } catch (error) {
      console.error('Failed to reset room:', error);
      alert('Failed to return to lobby. Please try again.');
    }
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const sortedPlayers = Object.values(room.players).sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isHost = user?.uid === room.hostUid;

  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Game Complete!</CardTitle>
          <p className="text-muted-foreground">{room.gameMode.name}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Winner */}
          <div className="text-center p-6 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
            <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-600" />
            <h2 className="text-2xl font-bold">{winner.displayName}</h2>
            <p className="text-muted-foreground">Winner</p>
            <p className="text-4xl font-bold mt-2">{winner.score}</p>
          </div>

          {/* All players */}
          <div>
            <h3 className="font-semibold mb-3">Final Scores</h3>
            <div className="space-y-2">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.uid}
                  className="flex items-center justify-between p-4 rounded-md bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-2xl text-muted-foreground w-8">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{player.displayName}</p>
                      {index === 0 && (
                        <Badge className="bg-yellow-600">Winner</Badge>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-2xl">{player.score}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          {isHost && (
            <Button onClick={handleReturnToLobby} className="w-full" size="lg">
              Return to Lobby (Play Again)
            </Button>
          )}
          {!isHost && (
            <p className="text-sm text-muted-foreground text-center">
              Waiting for host to return to lobby...
            </p>
          )}
          <div className="flex gap-2 justify-center w-full">
            <Button onClick={() => navigate('/multiplayer')} variant="outline">
              Leave Room
            </Button>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

