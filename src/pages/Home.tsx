import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { motion } from "framer-motion";
import {
  PaperCard,
  PaperCardHeader,
  PaperCardTitle,
  PaperCardDescription,
  PaperCardContent,
  SectionHeader,
  RuledSeparator,
  StickyNote,
  StickyNoteTitle,
  StickyNoteDescription,
} from "@/components/ui/academic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Trophy,
  BarChart3,
  Gamepad2,
  Zap,
  Target,
  TrendingUp,
  Binary,
  BookOpen,
  Play,
  ArrowRight,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function Home() {
  const navigate = useNavigate();

  // Refs for scroll animations
  const howToPlayRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  // Scroll visibility states
  const howToPlayVisible = useScrollAnimation(howToPlayRef, { threshold: 0.2 });
  const statsVisible = useScrollAnimation(statsRef, { threshold: 0.2 });
  const featuresVisible = useScrollAnimation(featuresRef, { threshold: 0.2 });
  const ctaVisible = useScrollAnimation(ctaRef, { threshold: 0.3 });

  const bases = [
    { name: "Binary", base: "2", example: "1010", color: "text-primary" },
    { name: "Octal", base: "8", example: "12", color: "text-chart-2" },
    { name: "Decimal", base: "10", example: "10", color: "text-chart-3" },
    { name: "Hexadecimal", base: "16", example: "A", color: "text-chart-4" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Prioritize Quick Game Access */}
      <section className="relative overflow-hidden py-8 md:py-12 paper-texture">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-background -z-10" />

        {/* Decorative coffee stain */}
        <div className="coffee-stain coffee-stain-top-right hidden lg:block" />

        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header with Badge */}
            <div className="text-center space-y-3 animate-in">

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-academic">
                <span className="gradient-text">Based Math Game</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed annotation">
                Practice converting between Binary, Octal, Decimal, and Hexadecimal through timed challenges and speed runs
              </p>
            </div>

            {/* Quick Start Game Modes - Primary CTA */}
            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {/* Singleplayer Card */}
              <PaperCard
                variant="interactive"
                padding="none"
                className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50 sketch-border folded-corner-sm"
                onClick={() => navigate("/singleplayer")}
              >
                <PaperCardHeader className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shrink-0">
                      <Gamepad2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <PaperCardTitle className="text-xl mb-1">
                        Singleplayer
                      </PaperCardTitle>
                      <PaperCardDescription className="text-sm">
                        48 official modes • Practice at your pace
                      </PaperCardDescription>
                    </div>
                  </div>
                </PaperCardHeader>
                <PaperCardContent className="p-4 pt-0">
                  <Button className="w-full group-hover:bg-primary/90" size="lg">
                    <Play className="mr-2 h-4 w-4" />
                    Start Solo Game
                  </Button>
                </PaperCardContent>
              </PaperCard>

              {/* Multiplayer Card */}
              <PaperCard
                variant="interactive"
                padding="none"
                className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-chart-1/50 sketch-border folded-corner-sm"
                onClick={() => navigate("/multiplayer")}
              >
                <PaperCardHeader className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-chart-1 flex items-center justify-center shrink-0">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <PaperCardTitle className="text-xl mb-1">
                        Multiplayer
                      </PaperCardTitle>
                      <PaperCardDescription className="text-sm">
                        Real-time • Compete with friends
                      </PaperCardDescription>
                    </div>
                  </div>
                </PaperCardHeader>
                <PaperCardContent className="p-4 pt-0">
                  <Button className="w-full bg-chart-1 hover:bg-chart-1/90 text-white" size="lg">
                    <Users className="mr-2 h-4 w-4" />
                    Create/Join Room
                  </Button>
                </PaperCardContent>
              </PaperCard>
            </div>

            {/* Base Examples - Educational Context */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {bases.map((base, index) => (
                <div
                  key={base.name}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-card border border-border shadow-sm"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Binary className={cn("w-3.5 h-3.5", base.color)} />
                  <span className="text-xs font-medium">{base.name}</span>
                  <Badge variant="outline" className="text-xs font-mono px-1.5 py-0">
                    {base.example}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <RuledSeparator className="container" spacing="lg" />

      {/* How to Play Section */}
      <motion.section
        ref={howToPlayRef}
        initial={{ opacity: 0, y: 50 }}
        animate={howToPlayVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container mx-auto px-4 py-10  ruled-lines-margin relative"
      >
        <SectionHeader
          title="How to Play"
          description="Learn the basics in under a minute"
          icon={BookOpen}
          titleSize="lg"
          spacing="default"
        />

        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <StickyNote variant="info" size="default" className="hover:rotate-0 hover:-translate-y-1 transition-all">
            <StickyNoteTitle>1. Choose a Mode</StickyNoteTitle>
            <StickyNoteDescription>
              Select from 48 official game modes or create your own custom challenge with specific bases and difficulty levels
            </StickyNoteDescription>
          </StickyNote>

          <StickyNote variant="success" size="default" className="hover:rotate-0 hover:-translate-y-1 transition-all">
            <StickyNoteTitle>2. Convert Numbers</StickyNoteTitle>
            <StickyNoteDescription>
              Type your answers to convert between Binary, Octal, Decimal, and Hexadecimal as fast as you can
            </StickyNoteDescription>
          </StickyNote>

          <StickyNote variant="warning" size="default" className="hover:rotate-0 hover:-translate-y-1 transition-all">
            <StickyNoteTitle>3. Beat Your Score</StickyNoteTitle>
            <StickyNoteDescription>
              Track your progress, compete on leaderboards, and improve your conversion speed over time
            </StickyNoteDescription>
          </StickyNote>
        </div>

        <div className="text-center mt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/how-to-play")}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            View Full Tutorial
          </Button>
        </div>
      </motion.section>

      <RuledSeparator className="container" spacing="lg" variant="double" />

      {/* Stats & Leaderboard Preview Section */}
      <motion.section
        ref={statsRef}
        initial={{ opacity: 0, x: -50 }}
        animate={statsVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="container mx-auto px-4 py-10 paper-texture"
      >
        <SectionHeader
          title="Track Your Progress"
          description="Monitor your performance and compete globally"
          icon={TrendingUp}
          titleSize="lg"
          spacing="default"
        />

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {/* Stats Preview */}
          <PaperCard
            variant="folded"
            padding="none"
            className="group cursor-pointer hover:shadow-lg transition-all duration-200 bookmark-ribbon"
            onClick={() => navigate("/stats")}
          >
            <PaperCardHeader className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-chart-2 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <PaperCardTitle className="text-lg">Your Statistics</PaperCardTitle>
                  <PaperCardDescription className="text-xs">
                    Personal performance metrics
                  </PaperCardDescription>
                </div>
              </div>
            </PaperCardHeader>
            <PaperCardContent className="p-4 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-sm bg-muted/30 border paper-texture hover:bg-muted/50 transition-colors">
                  <div className="text-xs text-muted-foreground mb-1">Games Played</div>
                  <div className="text-2xl font-bold font-mono">—</div>
                </div>
                <div className="p-3 rounded-sm bg-muted/30 border paper-texture hover:bg-muted/50 transition-colors">
                  <div className="text-xs text-muted-foreground mb-1">Best Score</div>
                  <div className="text-2xl font-bold font-mono">—</div>
                </div>
              </div>
              <Button variant="ghost" className="w-full justify-between group-hover:bg-accent">
                View Full Stats
                <ArrowRight className="h-4 w-4" />
              </Button>
            </PaperCardContent>
          </PaperCard>

          {/* Leaderboard Preview */}
          <PaperCard
            variant="folded"
            padding="none"
            className="group cursor-pointer hover:shadow-lg transition-all duration-200 bookmark-ribbon-success"
            onClick={() => navigate("/leaderboard")}
          >
            <PaperCardHeader className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-chart-3 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <PaperCardTitle className="text-lg">Leaderboard</PaperCardTitle>
                  <PaperCardDescription className="text-xs">
                    Global rankings & top scores
                  </PaperCardDescription>
                </div>
              </div>
            </PaperCardHeader>
            <PaperCardContent className="p-4 pt-0 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-sm bg-muted/30 border paper-texture hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      1
                    </Badge>
                    <span className="text-sm font-medium">Top Player</span>
                  </div>
                  <span className="text-sm font-mono font-bold">—</span>
                </div>
                <div className="text-xs text-muted-foreground text-center py-1 annotation">
                  Compete for the #1 spot
                </div>
              </div>
              <Button variant="ghost" className="w-full justify-between group-hover:bg-accent">
                View Leaderboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </PaperCardContent>
          </PaperCard>
        </div>
      </motion.section>

      <RuledSeparator className="container" spacing="lg" />

      {/* Features Highlight Section */}
      <motion.section
        ref={featuresRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={featuresVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="container mx-auto px-4 py-10"
      >
        <SectionHeader
          title="Why Practice Here?"
          description="Built for learners and competitors"
          icon={Target}
          titleSize="lg"
          spacing="default"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <PaperCard padding="default" className="text-center torn-edge-top">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-lg mb-1">
                  <span className="highlight-scribble">48 Official Modes</span>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Carefully designed challenges from beginner to expert level
                </p>
              </div>
            </div>
          </PaperCard>

          <PaperCard padding="default" className="text-center torn-edge-top">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-lg mb-1">
                  <span className="highlight-scribble highlight-scribble-green">Instant Feedback</span>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Real-time validation and hints on every answer you submit
                </p>
              </div>
            </div>
          </PaperCard>

          <PaperCard padding="default" className="text-center sm:col-span-2 lg:col-span-1 torn-edge-top">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-lg mb-1">
                  <span className="highlight-scribble highlight-scribble-orange">Timed & Speed Runs</span>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Challenge yourself with time limits or race to answer questions
                </p>
              </div>
            </div>
          </PaperCard>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section
        ref={ctaRef}
        initial={{ opacity: 0, y: 30 }}
        animate={ctaVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
        className="container mx-auto px-4 py-12 pb-12 paper-texture coffee-stain coffee-stain-bottom-left"
      >
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-serif font-bold ink-underline-visible">Ready to Start?</h2>
            <p className="text-base text-muted-foreground annotation">
              Jump into a game or learn the fundamentals first
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              size="lg"
              onClick={() => navigate("/singleplayer")}
              className="text-base px-8"
            >
              <Gamepad2 className="mr-2 h-5 w-5" />
              Start Playing Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/tutorials")}
              className="text-base px-8"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Learn the Basics
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
