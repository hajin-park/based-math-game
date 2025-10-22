import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRoom } from '@/hooks/useRoom';

export default function JoinRoom() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { joinRoom, loading } = useRoom();
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  // Pre-fill room ID from URL parameter if present
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setRoomId(codeFromUrl);
    }
  }, [searchParams]);

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError('Please enter a room code');
      return;
    }

    try {
      setError('');
      // Convert to uppercase for case-insensitive matching
      const normalizedRoomId = roomId.trim().toUpperCase();
      await joinRoom(normalizedRoomId);
      navigate(`/multiplayer/lobby/${normalizedRoomId}`);
    } catch (error: unknown) {
      console.error('Failed to join room:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join room. Please check the room code and try again.';
      setError(errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Multiplayer Room</CardTitle>
          <CardDescription>Enter the 8-character room code to join a game</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomId">Room Code</Label>
            <Input
              id="roomId"
              placeholder="Enter 8-character code"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              maxLength={8}
              className="uppercase font-mono tracking-wider"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={() => navigate('/multiplayer')} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleJoinRoom}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

