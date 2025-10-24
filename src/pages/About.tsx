import {
  PaperCard,
  PaperCardContent,
  PaperCardHeader,
  PaperCardTitle,
  SectionHeader,
} from "@/components/ui/academic";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Info,
  Zap,
  Users,
  TrendingUp,
  Trophy,
  UserPlus,
  Code,
  Heart,
  ExternalLink,
} from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto px-2 py-4 max-w-5xl">
      <SectionHeader
        icon={Info}
        title="About Based Math Game"
        description="Learn base conversion through interactive practice and competitive gameplay"
        className="mb-6"
      />

      <div className="space-y-3">
        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4 text-primary" />
              Our Mission
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2 text-sm leading-relaxed">
            <p>
              Based Math Game is designed to help students, programmers, and
              anyone interested in computer science master the fundamental skill
              of converting between different number bases (Binary, Octal,
              Decimal, and Hexadecimal).
            </p>
            <Separator />
            <p>
              Through timed quizzes and interactive tutorials, we make learning
              base conversion engaging and effective. Whether you're preparing
              for exams, improving your programming skills, or just curious
              about how computers represent numbers, we're here to help.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-primary" />
              Features
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="flex items-start gap-2 p-2 rounded border bg-card">
                <div className="p-1.5 rounded bg-primary/10">
                  <Code className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Interactive Tutorials</p>
                  <p className="text-sm text-muted-foreground">
                    Learn each number base with clear explanations and examples
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded border bg-card">
                <div className="p-1.5 rounded bg-primary/10">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Timed Quizzes</p>
                  <p className="text-sm text-muted-foreground">
                    Practice with official game modes or create custom
                    challenges
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded border bg-card">
                <div className="p-1.5 rounded bg-primary/10">
                  <Users className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Multiplayer Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Compete with friends in real-time conversion challenges
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded border bg-card">
                <div className="p-1.5 rounded bg-primary/10">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Progress Tracking</p>
                  <p className="text-sm text-muted-foreground">
                    Monitor your improvement with detailed statistics and game
                    history
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded border bg-card">
                <div className="p-1.5 rounded bg-primary/10">
                  <Trophy className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Global Leaderboards</p>
                  <p className="text-sm text-muted-foreground">
                    See how you rank against players worldwide
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded border bg-card">
                <div className="p-1.5 rounded bg-primary/10">
                  <UserPlus className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Guest Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Try the game without creating an account
                  </p>
                </div>
              </div>
            </div>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="flex items-center gap-2 text-base">
              <Code className="h-4 w-4 text-primary" />
              Technology
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <p className="text-sm leading-relaxed">
              Built with modern web technologies including React, TypeScript,
              and Firebase, Based Math Game provides a fast, responsive, and
              reliable learning experience across all devices.
            </p>
            <Separator />
            <div className="flex items-center gap-1 flex-wrap">
              <Badge variant="secondary" className="text-xs h-4">
                React 19
              </Badge>
              <Badge variant="secondary" className="text-xs h-4">
                TypeScript
              </Badge>
              <Badge variant="secondary" className="text-xs h-4">
                Firebase
              </Badge>
              <Badge variant="secondary" className="text-xs h-4">
                Tailwind CSS
              </Badge>
              <Badge variant="secondary" className="text-xs h-4">
                shadcn/ui
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              This project is open source and available on GitHub under the
              GPL-3.0 license.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4 text-primary" />
              Inspiration
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <p className="text-sm leading-relaxed">
              This project was inspired by{" "}
              <a
                href="https://arithmetic.zetamac.com"
                className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                zetamac
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
              , a popular arithmetic practice tool. We adapted the concept to
              focus specifically on base conversion, a crucial skill for
              computer science students and professionals.
            </p>
          </PaperCardContent>
        </PaperCard>
      </div>
    </div>
  );
}
