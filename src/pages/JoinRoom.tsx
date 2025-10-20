import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRoom } from '@/hooks/useRoom';

export default function JoinRoom() {
  const navigate = useNavigate();
  const { joinRoom, loading } = useRoom();
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    try {
      setError('');
      await joinRoom(roomId.trim());
      navigate(`/multiplayer/lobby/${roomId.trim()}`);
    } catch (error: unknown) {
      console.error('Failed to join room:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join room. Please check the room ID and try again.';
      setError(errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Multiplayer Room</CardTitle>
          <CardDescription>Enter the room ID to join a game</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomId">Room ID</Label>
            <Input
              id="roomId"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
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

