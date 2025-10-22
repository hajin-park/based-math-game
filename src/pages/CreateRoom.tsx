import { useState, useMemo } from 'react';
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
import { Plus, Trophy, Wrench, Users, Clock, Layers, CheckCircle2, Filter, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type BaseFilter = 'all' | 'binary' | 'octal' | 'hexadecimal' | 'all-bases';
type DifficultyFilter = 'all' | 'Easy' | 'Medium' | 'Hard' | 'Expert';
type TypeFilter = 'all' | 'timed' | 'speedrun';

export default function CreateRoom() {
  const navigate = useNavigate();
  const { createRoom, loading } = useRoom();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedTab, setSelectedTab] = useState('official');
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [baseFilter, setBaseFilter] = useState<BaseFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [expandedModeId, setExpandedModeId] = useState<string | null>(null);

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
    // Validate: multiplayer games cannot have unlimited time
    if (settings.duration === 0) {
      alert('Multiplayer games require a time limit. Please select a duration.');
      return;
    }

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

  // Filter game modes based on selected filters
  const filteredModes = useMemo(() => {
    return OFFICIAL_GAME_MODES.filter((mode) => {
      // Base filter
      if (baseFilter !== 'all') {
        const hasBase = mode.questions.some((q) => {
          const fromBase = q[0].toLowerCase();
          const toBase = q[1].toLowerCase();
          if (baseFilter === 'all-bases') {
            return (fromBase === 'binary' || fromBase === 'octal' || fromBase === 'hexadecimal') &&
                   (toBase === 'binary' || toBase === 'octal' || toBase === 'hexadecimal');
          }
          return fromBase === baseFilter || toBase === baseFilter;
        });
        if (!hasBase) return false;
      }

      // Difficulty filter
      if (difficultyFilter !== 'all' && mode.difficulty !== difficultyFilter) {
        return false;
      }

      // Type filter (timed vs speedrun)
      if (typeFilter !== 'all') {
        const isSpeedRun = mode.targetQuestions !== undefined;
        if (typeFilter === 'speedrun' && !isSpeedRun) return false;
        if (typeFilter === 'timed' && isSpeedRun) return false;
      }

      return true;
    });
  }, [baseFilter, difficultyFilter, typeFilter]);

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

              {/* Filters */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Filter Games</CardTitle>
                  </div>
                  <CardDescription>
                    Narrow down from 48 official modes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {/* Base Type Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Base Type</Label>
                      <Select value={baseFilter} onValueChange={(value) => setBaseFilter(value as BaseFilter)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Bases</SelectItem>
                          <SelectItem value="binary">Binary Only</SelectItem>
                          <SelectItem value="octal">Octal Only</SelectItem>
                          <SelectItem value="hexadecimal">Hexadecimal Only</SelectItem>
                          <SelectItem value="all-bases">All Bases Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Difficulty Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Difficulty</Label>
                      <Select value={difficultyFilter} onValueChange={(value) => setDifficultyFilter(value as DifficultyFilter)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Difficulties</SelectItem>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Game Type</Label>
                      <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TypeFilter)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="timed">Timed Challenges</SelectItem>
                          <SelectItem value="speedrun">Speed Runs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredModes.map((mode) => (
                  <Card
                    key={mode.id}
                    className={`cursor-pointer transition-all duration-200 border-2 ${
                      selectedMode?.id === mode.id
                        ? 'ring-2 ring-primary border-primary shadow-lg'
                        : 'hover:shadow-lg hover:border-primary/50'
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

                      {/* Detailed Settings Collapsible */}
                      <Collapsible
                        open={expandedModeId === mode.id}
                        onOpenChange={(open) => setExpandedModeId(open ? mode.id : null)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between h-8 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>View Details</span>
                            {expandedModeId === mode.id ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2">
                          <div className="space-y-2 text-xs">
                            <div className="p-2 rounded-md bg-muted/50">
                              <p className="font-semibold mb-1">Question Types:</p>
                              <ul className="space-y-0.5 text-muted-foreground">
                                {mode.questions.map((q, idx) => (
                                  <li key={idx}>
                                    • {q[0]} → {q[1]} (Range: {q[2]}-{q[3]})
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {mode.targetQuestions && (
                              <div className="p-2 rounded-md bg-muted/50">
                                <p className="font-semibold">Speed Run Mode</p>
                                <p className="text-muted-foreground">
                                  Complete {mode.targetQuestions} questions as fast as possible
                                </p>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

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

              {filteredModes.length === 0 && (
                <Card className="border-2 border-dashed">
                  <CardContent className="py-12 text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">No modes match your filters</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Try adjusting your filter settings
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBaseFilter('all');
                        setDifficultyFilter('all');
                        setTypeFilter('all');
                      }}
                    >
                      Reset Filters
                    </Button>
                  </CardContent>
                </Card>
              )}

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
                    isMultiplayer={true}
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

