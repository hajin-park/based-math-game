import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { OFFICIAL_GAME_MODES, getDifficultyColor, GameMode } from '@/types/gameMode';
import { PlaygroundSettings } from '@features/quiz';
import { QuestionSetting } from '@/contexts/GameContexts';

interface GameModeSelectProps {
  onSelectMode: (mode: GameMode) => void;
}

export default function GameModeSelect({ onSelectMode }: GameModeSelectProps) {
  const [selectedTab, setSelectedTab] = useState('official');

  const handleSelectMode = (mode: GameMode) => {
    onSelectMode(mode);
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
    onSelectMode(customMode);
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="official">Official Modes</TabsTrigger>
          <TabsTrigger value="custom">Custom Playground</TabsTrigger>
        </TabsList>

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

