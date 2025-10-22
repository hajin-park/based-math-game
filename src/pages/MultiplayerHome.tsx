import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, LogIn, Home, Zap } from 'lucide-react';

export default function MultiplayerHome() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-2xl space-y-6 animate-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">Multiplayer Mode</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Compete with friends in real-time base conversion challenges
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Choose Your Action
            </CardTitle>
            <CardDescription className="text-base">
              Create a new room or join an existing one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create Room */}
            <Card className="group hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover-lift border-2 cursor-pointer"
                  onClick={() => navigate('/multiplayer/create')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      Create Room
                    </CardTitle>
                    <CardDescription className="text-base">
                      Start a new game and invite friends
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Join Room */}
            <Card className="group hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover-lift border-2 cursor-pointer"
                  onClick={() => navigate('/multiplayer/join')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <LogIn className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      Join Room
                    </CardTitle>
                    <CardDescription className="text-base">
                      Enter a room code to join a game
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Back to Home */}
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="lg"
              className="w-full"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

