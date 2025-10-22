import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { OFFICIAL_GAME_MODES, getDifficultyColor, GameMode } from '@/types/gameMode';
import { PlaygroundSettings } from '@features/quiz';
import { QuestionSetting } from '@/contexts/GameContexts';
import { Trophy, Clock, Layers, Play, BarChart3, Wrench } from 'lucide-react';

interface GameModeSelectProps {
  onSelectMode: (mode: GameMode, trackStats: boolean) => void;
}

export default function GameModeSelect({ onSelectMode }: GameModeSelectProps) {
  const [selectedTab, setSelectedTab] = useState('official');
  const [trackStats, setTrackStats] = useState(true);

  const handleSelectMode = (mode: GameMode) => {
    onSelectMode(mode, trackStats);
  };

  const handleCustomPlayground = (settings: { questions: QuestionSetting[]; duration: number }) => {
    // Create a custom game mode from the playground settings
    const customMode: GameMode = {
      id: 'custom-playground',
      name: 'Custom Playground',
      description: 'Your custom quiz settings',
      isOfficial: false,
      questions: settings.questions,
      duration: settings.duration,
      difficulty: 'Custom',
    };
    onSelectMode(customMode, trackStats);
  };

  return (
    <div className="w-full space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12">
          <TabsTrigger value="official" className="text-base">
            <Trophy className="mr-2 h-4 w-4" />
            Official Modes
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-base">
            <Wrench className="mr-2 h-4 w-4" />
            Custom
          </TabsTrigger>
        </TabsList>

        {/* Track Stats Toggle */}
        <Card className="mt-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <Label htmlFor="track-stats" className="text-base font-semibold cursor-pointer">
                    Track Statistics
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {trackStats
                    ? "This game will count toward your stats and leaderboard rankings"
                    : "This game will not be saved to your stats or leaderboard"}
                </p>
              </div>
              <Switch
                id="track-stats"
                checked={trackStats}
                onCheckedChange={setTrackStats}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>

        <TabsContent value="official" className="space-y-4 mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {OFFICIAL_GAME_MODES.map((mode) => (
              <Card
                key={mode.id}
                className="group hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover-lift border-2"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {mode.name}
                    </CardTitle>
                    <Badge
                      className={`${getDifficultyColor(mode.difficulty)} shrink-0`}
                      variant="secondary"
                    >
                      {mode.difficulty}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">
                    {mode.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{mode.duration}s</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{mode.questions.length} types</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSelectMode(mode)}
                    className="w-full shadow-sm hover:shadow-md transition-all"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Play Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Custom Playground
              </CardTitle>
              <CardDescription>
                Create your own quiz with custom settings and difficulty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlaygroundSettings
                onStartQuiz={handleCustomPlayground}
                buttonText="Start Custom Quiz"
                showHeader={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

