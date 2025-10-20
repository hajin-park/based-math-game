import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Trophy, BarChart3, Settings } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Settings,
      title: 'Custom Practice',
      description: 'Create your own quiz with custom settings and difficulty',
      action: () => navigate('/singleplayer'),
      color: 'bg-blue-500',
    },
    {
      icon: Users,
      title: 'Multiplayer',
      description: 'Compete with friends in real-time challenges',
      action: () => navigate('/multiplayer'),
      color: 'bg-purple-500',
    },
    {
      icon: Trophy,
      title: 'Leaderboard',
      description: 'See top scores and compete for the #1 spot',
      action: () => navigate('/leaderboard'),
      color: 'bg-yellow-500',
    },
    {
      icon: BarChart3,
      title: 'Your Stats',
      description: 'Track your progress and performance over time',
      action: () => navigate('/stats'),
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Based Math Game
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Master base conversions through interactive challenges. Convert between Binary, Octal, Decimal, and Hexadecimal at lightning speed!
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.title}
              className="hover:shadow-lg transition-all cursor-pointer group"
              onClick={feature.action}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Get Started →
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Start Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-600/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Ready to Start?</CardTitle>
          <CardDescription>
            Jump right into a quick game or customize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/singleplayer')}>
            Start Playing
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/tutorials')}>
            Learn How
          </Button>
        </CardContent>
      </Card>

      {/* Info Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎯 Official Game Modes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              6 carefully designed game modes from Binary Basics to Ultimate Challenge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">⚡ Real-time Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Instant feedback on every answer - no submit button needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📊 Track Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Detailed statistics and game history to monitor your improvement
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

