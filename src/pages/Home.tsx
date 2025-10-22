import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  Trophy,
  BarChart3,
  Gamepad2,
  Zap,
  Target,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Binary,
  Hash,
  BookOpen,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Gamepad2,
      title: 'Singleplayer',
      description: 'Practice at your own pace with 48 official game modes',
      action: () => navigate('/singleplayer'),
      iconBg: 'bg-primary',
    },
    {
      icon: Users,
      title: 'Multiplayer',
      description: 'Compete with friends in real-time challenges',
      action: () => navigate('/multiplayer'),
      iconBg: 'bg-chart-1',
    },
    {
      icon: Trophy,
      title: 'Leaderboard',
      description: 'See top scores and compete for the #1 spot',
      action: () => navigate('/leaderboard'),
      iconBg: 'bg-chart-3',
    },
    {
      icon: BarChart3,
      title: 'Your Stats',
      description: 'Track your progress and performance over time',
      action: () => navigate('/stats'),
      iconBg: 'bg-chart-2',
    },
  ];

  const highlights = [
    {
      icon: Target,
      title: '48 Official Modes',
      description: 'Carefully designed challenges from beginner to expert',
    },
    {
      icon: Zap,
      title: 'Instant Feedback',
      description: 'Real-time validation on every answer',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Detailed statistics and game history',
    },
  ];

  const bases = [
    { name: 'Binary', base: '2', example: '1010', color: 'text-primary' },
    { name: 'Octal', base: '8', example: '12', color: 'text-chart-2' },
    { name: 'Decimal', base: '10', example: '10', color: 'text-chart-3' },
    { name: 'Hexadecimal', base: '16', example: 'A', color: 'text-chart-4' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background -z-10" />

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="animate-in">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Master Base Conversions
              </Badge>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-in-slow">
              <span className="gradient-text">Based Math Game</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Master base conversions through interactive challenges. Convert between Binary, Octal, Decimal, and Hexadecimal at lightning speed.
            </p>

            {/* Base Examples */}
            <div className="flex flex-wrap justify-center gap-3 pt-6">
              {bases.map((base, index) => (
                <div
                  key={base.name}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border shadow-sm"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Binary className={cn("w-4 h-4", base.color)} />
                  <span className="text-sm font-medium">{base.name}</span>
                  <Badge variant="outline" className="text-xs font-mono">
                    {base.example}
                  </Badge>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                size="lg"
                onClick={() => navigate('/singleplayer')}
                className="text-base px-8 h-12"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Playing
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/tutorials')}
                className="text-base px-8 h-12"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Learn How
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Separator className="container" />

      {/* Feature Cards - Clean, functional design */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold">Get Started</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose your path to mastering base conversions
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group cursor-pointer transition-all duration-200 hover:shadow-lg"
                onClick={feature.action}
              >
                <CardHeader className="space-y-4">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    feature.iconBg
                  )}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="w-full justify-between group-hover:bg-accent"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator className="container" />

      {/* Highlights Section - Why Choose This */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold">Why Practice Here?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built for learners and competitors alike
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {highlights.map((highlight) => {
            const Icon = highlight.icon;
            return (
              <div key={highlight.title} className="text-center space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{highlight.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <Separator className="container" />

      {/* CTA Section - Clean and direct */}
      <section className="container mx-auto px-4 py-20 pb-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Ready to Start?</h2>
            <p className="text-lg text-muted-foreground">
              Jump into a game or learn the fundamentals first
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate('/singleplayer')}
              className="text-base px-8 h-12"
            >
              <Gamepad2 className="mr-2 h-5 w-5" />
              Start Playing
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/how-to-play')}
              className="text-base px-8 h-12"
            >
              <Hash className="mr-2 h-5 w-5" />
              How to Play
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

