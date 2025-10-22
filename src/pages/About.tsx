import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Info, Sparkles, Zap, Users, TrendingUp, Trophy, UserPlus, Code, Heart, ExternalLink } from 'lucide-react';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-12 text-center space-y-4 animate-in">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-10 w-10 text-primary" />
          <h1 className="text-5xl font-bold gradient-text">About Based Math Game</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Learn base conversion through interactive practice and competitive gameplay
        </p>
      </div>

      <div className="space-y-8">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-base leading-relaxed">
            <p>
              Based Math Game is designed to help students, programmers, and anyone interested in computer science
              master the fundamental skill of converting between different number bases (Binary, Octal, Decimal, and Hexadecimal).
            </p>
            <Separator />
            <p>
              Through timed quizzes and interactive tutorials, we make learning base conversion engaging and effective.
              Whether you're preparing for exams, improving your programming skills, or just curious about how computers
              represent numbers, we're here to help.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">Interactive Tutorials</p>
                      <p className="text-sm text-muted-foreground">Learn each number base with clear explanations and examples</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">Timed Quizzes</p>
                      <p className="text-sm text-muted-foreground">Practice with official game modes or create custom challenges</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">Multiplayer Mode</p>
                      <p className="text-sm text-muted-foreground">Compete with friends in real-time conversion challenges</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">Progress Tracking</p>
                      <p className="text-sm text-muted-foreground">Monitor your improvement with detailed statistics and game history</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">Global Leaderboards</p>
                      <p className="text-sm text-muted-foreground">See how you rank against players worldwide</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">Guest Mode</p>
                      <p className="text-sm text-muted-foreground">Try the game without creating an account</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Code className="h-6 w-6 text-primary" />
              Technology
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-relaxed">
              Built with modern web technologies including React, TypeScript, and Firebase, Based Math Game
              provides a fast, responsive, and reliable learning experience across all devices.
            </p>
            <Separator />
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-sm">React 19</Badge>
              <Badge variant="secondary" className="text-sm">TypeScript</Badge>
              <Badge variant="secondary" className="text-sm">Firebase</Badge>
              <Badge variant="secondary" className="text-sm">Tailwind CSS</Badge>
              <Badge variant="secondary" className="text-sm">shadcn/ui</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              This project is open source and available on GitHub under the GPL-3.0 license.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              Inspiration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-relaxed">
              This project was inspired by{' '}
              <a
                href="https://arithmetic.zetamac.com"
                className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                zetamac
                <ExternalLink className="h-3 w-3" />
              </a>
              , a popular arithmetic practice tool. We adapted the concept to focus specifically on base conversion,
              a crucial skill for computer science students and professionals.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

