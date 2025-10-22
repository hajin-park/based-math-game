import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Hash
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Gamepad2,
      title: 'Singleplayer',
      description: 'Practice at your own pace with customizable game modes',
      action: () => navigate('/singleplayer'),
      gradient: 'from-primary to-accent',
      iconBg: 'bg-primary',
    },
    {
      icon: Users,
      title: 'Multiplayer',
      description: 'Compete with friends in real-time challenges',
      action: () => navigate('/multiplayer'),
      gradient: 'from-chart-4 to-chart-5',
      iconBg: 'bg-chart-4',
    },
    {
      icon: Trophy,
      title: 'Leaderboard',
      description: 'See top scores and compete for the #1 spot',
      action: () => navigate('/leaderboard'),
      gradient: 'from-warning to-chart-3',
      iconBg: 'bg-warning',
    },
    {
      icon: BarChart3,
      title: 'Your Stats',
      description: 'Track your progress and performance over time',
      action: () => navigate('/stats'),
      gradient: 'from-success to-chart-2',
      iconBg: 'bg-success',
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
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 -z-10" />

        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-in">
            {/* Badge */}
            <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Master Base Conversions
            </Badge>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="gradient-text">Based Math Game</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Master base conversions through interactive challenges. Convert between Binary, Octal, Decimal, and Hexadecimal at lightning speed!
            </p>

            {/* Base Examples */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {bases.map((base) => (
                <div
                  key={base.name}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 backdrop-blur-sm border border-border/50"
                >
                  <Binary className={`w-4 h-4 ${base.color}`} />
                  <span className="text-sm font-medium">{base.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {base.example}
                  </Badge>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/singleplayer')}
                className="text-lg px-8 shadow-glow hover:shadow-glow-lg transition-all"
              >
                Start Playing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/tutorials')}
                className="text-lg px-8"
              >
                Learn How
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover-lift border-2 hover:border-primary/50"
                onClick={feature.action}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <CardHeader className="relative">
                  <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Button
                    variant="ghost"
                    className="w-full group-hover:bg-primary/10 transition-colors"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Highlights Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((highlight) => {
            const Icon = highlight.icon;
            return (
              <Card key={highlight.title} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{highlight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {highlight.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="relative overflow-hidden border-2 border-primary/20">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

          <CardHeader className="text-center relative">
            <CardTitle className="text-3xl md:text-4xl">Ready to Start?</CardTitle>
            <CardDescription className="text-lg">
              Jump right into a quick game or learn the fundamentals
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center relative pb-8">
            <Button
              size="lg"
              onClick={() => navigate('/singleplayer')}
              className="shadow-glow"
            >
              <Gamepad2 className="mr-2 h-5 w-5" />
              Start Playing
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/tutorials')}
            >
              <Hash className="mr-2 h-5 w-5" />
              View Tutorials
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

