import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRoom } from '@/hooks/useRoom';
import { OFFICIAL_GAME_MODES, GameMode, getDifficultyColor } from '@/types/gameMode';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaygroundSettings } from '@features/quiz';
import { QuestionSetting } from '@/contexts/GameContexts';

export default function CreateRoom() {
  const navigate = useNavigate();
  const { createRoom, loading } = useRoom();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedTab, setSelectedTab] = useState('official');

  const handleCreateRoom = async () => {
    if (!selectedMode) return;

    try {
      const roomId = await createRoom(selectedMode);
      navigate(`/multiplayer/lobby/${roomId}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Failed to create room. Please try again.');
    }
  };

  const handleCustomPlayground = async (settings: { questions: QuestionSetting[]; duration: number }) => {
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

    try {
      const roomId = await createRoom(customMode);
      navigate(`/multiplayer/lobby/${roomId}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Failed to create room. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Multiplayer Room</CardTitle>
          <CardDescription>Select a game mode to play with friends</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="official">Official Modes</TabsTrigger>
              <TabsTrigger value="custom">Custom Playground</TabsTrigger>
            </TabsList>

            <TabsContent value="official" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {OFFICIAL_GAME_MODES.map((mode) => (
                  <Card
                    key={mode.id}
                    className={`cursor-pointer transition-all ${
                      selectedMode?.id === mode.id
                        ? 'ring-2 ring-primary'
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedMode(mode)}
                  >
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
                      <p className="text-sm text-muted-foreground">
                        Duration: {mode.duration}s
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2 justify-end">
                <Button onClick={() => navigate('/multiplayer')} variant="outline">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRoom}
                  disabled={!selectedMode || loading}
                >
                  {loading ? 'Creating...' : 'Create Room'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="custom">
              <Card>
                <CardContent className="pt-6">
                  <PlaygroundSettings
                    onStartQuiz={handleCustomPlayground}
                    buttonText="Create Room with Custom Settings"
                    showHeader={true}
                  />
                </CardContent>
              </Card>
              <div className="flex gap-2 justify-end mt-4">
                <Button onClick={() => navigate('/multiplayer')} variant="outline">
                  Cancel
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

