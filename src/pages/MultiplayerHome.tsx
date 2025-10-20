import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MultiplayerHome() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Multiplayer Mode</CardTitle>
          <CardDescription>
            Compete with friends in real-time base conversion challenges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => navigate('/multiplayer/create')}
            className="w-full"
            size="lg"
          >
            Create Room
          </Button>
          <Button
            onClick={() => navigate('/multiplayer/join')}
            className="w-full"
            variant="outline"
            size="lg"
          >
            Join Room
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="w-full"
            variant="ghost"
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

