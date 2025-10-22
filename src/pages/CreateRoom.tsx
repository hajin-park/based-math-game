import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRoom } from '@/hooks/useRoom';
import { OFFICIAL_GAME_MODES, GameMode, getDifficultyColor } from '@/types/gameMode';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaygroundSettings } from '@features/quiz';
import { QuestionSetting } from '@/contexts/GameContexts';
import { Plus, Trophy, Wrench, Users, Clock, Layers, CheckCircle2 } from 'lucide-react';

export default function CreateRoom() {
  const navigate = useNavigate();
  const { createRoom, loading } = useRoom();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedTab, setSelectedTab] = useState('official');
  const [maxPlayers, setMaxPlayers] = useState<number>(4);

  const handleCreateRoom = async () => {
    if (!selectedMode) return;

    try {
      const roomId = await createRoom(selectedMode, maxPlayers);
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
      const roomId = await createRoom(customMode, maxPlayers);
      navigate(`/multiplayer/lobby/${roomId}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Failed to create room. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 animate-in">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Plus className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold gradient-text">Create Room</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select a game mode and invite your friends to compete
        </p>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Room Configuration</CardTitle>
          <CardDescription className="text-base">
            Choose your game mode and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

            <TabsContent value="official" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {OFFICIAL_GAME_MODES.map((mode) => (
                  <Card
                    key={mode.id}
                    className={`cursor-pointer transition-all duration-300 hover-lift border-2 ${
                      selectedMode?.id === mode.id
                        ? 'ring-2 ring-primary border-primary shadow-lg'
                        : 'hover:shadow-xl hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedMode(mode)}
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-xl">
                          {mode.name}
                        </CardTitle>
                        <Badge
                          className={getDifficultyColor(mode.difficulty)}
                          variant="secondary"
                        >
                          {mode.difficulty}
                        </Badge>
                      </div>
                      <CardDescription className="text-base">
                        {mode.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
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
                      {selectedMode?.id === mode.id && (
                        <div className="flex items-center gap-2 text-sm text-primary font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          Selected
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Player Limit Selector */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <Label htmlFor="maxPlayers" className="text-base font-semibold">
                        Maximum Players
                      </Label>
                    </div>
                    <Select
                      value={maxPlayers.toString()}
                      onValueChange={(value) => setMaxPlayers(parseInt(value))}
                    >
                      <SelectTrigger id="maxPlayers" className="w-full">
                        <SelectValue placeholder="Select max players" />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Players
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 justify-end">
                <Button onClick={() => navigate('/multiplayer')} variant="outline" size="lg">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRoom}
                  disabled={!selectedMode || loading}
                  size="lg"
                  className="shadow-sm"
                >
                  {loading ? (
                    <>
                      <span className="animate-pulse">Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-5 w-5" />
                      Create Room
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6 mt-6">
              {/* Player Limit Selector */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <Label htmlFor="maxPlayersCustom" className="text-base font-semibold">
                        Maximum Players
                      </Label>
                    </div>
                    <Select
                      value={maxPlayers.toString()}
                      onValueChange={(value) => setMaxPlayers(parseInt(value))}
                    >
                      <SelectTrigger id="maxPlayersCustom" className="w-full">
                        <SelectValue placeholder="Select max players" />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Players
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    Custom Settings
                  </CardTitle>
                  <CardDescription>
                    Configure your own quiz parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PlaygroundSettings
                    onStartQuiz={handleCustomPlayground}
                    buttonText="Create Room with Custom Settings"
                    showHeader={false}
                  />
                </CardContent>
              </Card>

              <div className="flex gap-3 justify-end">
                <Button onClick={() => navigate('/multiplayer')} variant="outline" size="lg">
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

