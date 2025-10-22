import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OFFICIAL_GAME_MODES, getDifficultyColor, GameMode } from '@/types/gameMode';
import { PlaygroundSettings } from '@features/quiz';
import { QuestionSetting } from '@/contexts/GameContexts';
import { Trophy, Clock, Layers, Play, BarChart3, Wrench, Filter, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameModeSelectProps {
  onSelectMode: (mode: GameMode, trackStats: boolean) => void;
}

type BaseFilter = 'all' | 'binary' | 'octal' | 'hex' | 'mixed';
type DifficultyFilter = 'all' | 'Easy' | 'Medium' | 'Hard';
type TypeFilter = 'all' | 'timed' | 'sprint';

export default function GameModeSelect({ onSelectMode }: GameModeSelectProps) {
  const [selectedTab, setSelectedTab] = useState('official');
  const [trackStats, setTrackStats] = useState(true);
  const [baseFilter, setBaseFilter] = useState<BaseFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

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

  // Filter game modes based on selected filters
  const filteredModes = useMemo(() => {
    return OFFICIAL_GAME_MODES.filter((mode) => {
      // Base filter
      if (baseFilter !== 'all') {
        if (baseFilter === 'binary' && !mode.id.includes('binary')) return false;
        if (baseFilter === 'octal' && !mode.id.includes('octal')) return false;
        if (baseFilter === 'hex' && !mode.id.includes('hex')) return false;
        if (baseFilter === 'mixed' && !mode.id.includes('all')) return false;
      }

      // Difficulty filter
      if (difficultyFilter !== 'all' && mode.difficulty !== difficultyFilter) return false;

      // Type filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'timed' && mode.id.includes('q')) return false;
        if (typeFilter === 'sprint' && !mode.id.includes('q')) return false;
      }

      return true;
    });
  }, [baseFilter, difficultyFilter, typeFilter]);

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

        <TabsContent value="official" className="space-y-6 mt-6">
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
                      <SelectItem value="hex">Hexadecimal Only</SelectItem>
                      <SelectItem value="mixed">Mixed Bases</SelectItem>
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
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
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
                      <SelectItem value="timed">Timed (15s/60s)</SelectItem>
                      <SelectItem value="sprint">Sprint (10q/30q)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Showing {filteredModes.length} of {OFFICIAL_GAME_MODES.length} modes
              </div>
            </CardContent>
          </Card>

          {/* Game Mode Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredModes.map((mode) => (
              <Card
                key={mode.id}
                className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50"
                onClick={() => handleSelectMode(mode)}
              >
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">
                      {mode.name}
                    </CardTitle>
                    <Badge
                      className={cn("shrink-0 text-xs", getDifficultyColor(mode.difficulty))}
                      variant="secondary"
                    >
                      {mode.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{mode.targetQuestions ? `${mode.targetQuestions}q` : `${mode.duration}s`}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" />
                      <span>{mode.questions.length} types</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                  >
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                    Play
                  </Button>
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

