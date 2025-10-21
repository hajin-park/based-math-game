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
    <div className="container mx-auto p-4">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="official">Official Modes</TabsTrigger>
          <TabsTrigger value="custom">Custom Playground</TabsTrigger>
        </TabsList>

        {/* Track Stats Toggle */}
        <Card className="mt-4 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="track-stats" className="text-base font-medium">
                  Track Statistics
                </Label>
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
              />
            </div>
          </CardContent>
        </Card>

        <TabsContent value="official" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {OFFICIAL_GAME_MODES.map((mode) => (
              <Card key={mode.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{mode.name}</CardTitle>
                    <Badge className={getDifficultyColor(mode.difficulty)}>
                      {mode.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{mode.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Duration: {mode.duration}s
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Questions: {mode.questions.length} types
                    </p>
                    <Button
                      onClick={() => handleSelectMode(mode)}
                      className="w-full mt-2"
                    >
                      Play Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardContent className="pt-6">
              <PlaygroundSettings
                onStartQuiz={handleCustomPlayground}
                buttonText="Start Custom Quiz"
                showHeader={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

