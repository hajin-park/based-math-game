import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { OFFICIAL_GAME_MODES, getDifficultyColor, GameMode } from '@/types/gameMode';
import { PlaygroundSettings } from '@features/quiz';
import { QuestionSetting } from '@/contexts/GameContexts';
import { Trophy, Clock, Layers, Play, BarChart3, Wrench, Target, ChevronDown, ChevronUp, Search, Binary, Hash, Hexagon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GameModeSelectProps {
  onSelectMode: (mode: GameMode, trackStats: boolean) => void;
}

type CategoryFilter = 'explore' | 'binary' | 'octal' | 'hexadecimal' | 'mixed';
type DifficultyFilter = 'all' | 'Easy' | 'Medium' | 'Hard';
type TypeFilter = 'all' | 'timed' | 'speedrun';

export default function GameModeSelect({ onSelectMode }: GameModeSelectProps) {
  const [selectedTab, setSelectedTab] = useState('official');
  const [trackStats, setTrackStats] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [expandedModeId, setExpandedModeId] = useState<string | null>(null);

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
    // Custom playground games are never tracked
    onSelectMode(customMode, false);
  };

  // Filter game modes based on selected filters
  const filteredModes = useMemo(() => {
    return OFFICIAL_GAME_MODES.filter((mode) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = mode.name.toLowerCase().includes(query);
        const descMatch = mode.description.toLowerCase().includes(query);
        if (!nameMatch && !descMatch) return false;
      }

      // Category filter
      if (categoryFilter !== 'explore') {
        if (categoryFilter === 'mixed') {
          // Mixed bases: show "All Bases" games (games with multiple base types excluding decimal)
          const bases = new Set<string>();
          mode.questions.forEach((q) => {
            const fromBase = q[0].toLowerCase();
            const toBase = q[1].toLowerCase();
            if (fromBase !== 'decimal') bases.add(fromBase);
            if (toBase !== 'decimal') bases.add(toBase);
          });
          if (bases.size <= 1) return false;
        } else {
          // Single base filter
          const hasBase = mode.questions.some((q) => {
            const fromBase = q[0].toLowerCase();
            const toBase = q[1].toLowerCase();
            return fromBase === categoryFilter || toBase === categoryFilter;
          });
          if (!hasBase) return false;
        }
      }

      // Difficulty filter
      if (difficultyFilter !== 'all' && mode.difficulty !== difficultyFilter) return false;

      // Type filter (timed vs speedrun)
      if (typeFilter !== 'all') {
        const isSpeedRun = mode.targetQuestions !== undefined;
        if (typeFilter === 'speedrun' && !isSpeedRun) return false;
        if (typeFilter === 'timed' && isSpeedRun) return false;
      }

      return true;
    });
  }, [categoryFilter, searchQuery, difficultyFilter, typeFilter]);

  return (
    <div className="w-full space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-auto p-1">
          <TabsTrigger value="official" className="flex items-center gap-2 py-3">
            <Trophy className="h-4 w-4" />
            Official Modes
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2 py-3">
            <Wrench className="h-4 w-4" />
            Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="official" className="space-y-0">
          <div className="flex gap-6">
            {/* Sidebar */}
            <Card className="w-64 flex-shrink-0 border-2 shadow-lg h-fit sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Browse</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {filteredModes.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search modes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Categories */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Categories
                  </Label>
                  <div className="space-y-1">
                    <Button
                      variant={categoryFilter === 'explore' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setCategoryFilter('explore')}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Explore All
                    </Button>
                    <Button
                      variant={categoryFilter === 'binary' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setCategoryFilter('binary')}
                    >
                      <Binary className="h-4 w-4 mr-2" />
                      Binary
                    </Button>
                    <Button
                      variant={categoryFilter === 'octal' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setCategoryFilter('octal')}
                    >
                      <Hash className="h-4 w-4 mr-2" />
                      Octal
                    </Button>
                    <Button
                      variant={categoryFilter === 'hexadecimal' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setCategoryFilter('hexadecimal')}
                    >
                      <Hexagon className="h-4 w-4 mr-2" />
                      Hexadecimal
                    </Button>
                    <Button
                      variant={categoryFilter === 'mixed' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setCategoryFilter('mixed')}
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      Mixed Bases
                    </Button>
                  </div>
                </div>

                {/* Additional Filters */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Difficulty
                    </Label>
                    <Select value={difficultyFilter} onValueChange={(value) => setDifficultyFilter(value as DifficultyFilter)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Type
                    </Label>
                    <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TypeFilter)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="timed">Timed</SelectItem>
                        <SelectItem value="speedrun">Speed Run</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Track Stats Toggle */}
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Track Stats
                  </Label>
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                    <span className="text-xs">{trackStats ? 'Enabled' : 'Disabled'}</span>
                    <Switch
                      id="track-stats"
                      checked={trackStats}
                      onCheckedChange={setTrackStats}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>

                {/* Reset Filters Button */}
                {(categoryFilter !== 'explore' || difficultyFilter !== 'all' || typeFilter !== 'all' || searchQuery) && (
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setCategoryFilter('explore');
                        setDifficultyFilter('all');
                        setTypeFilter('all');
                        setSearchQuery('');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="flex-1 space-y-4">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pr-4">
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
                            setCategoryFilter('explore');
                            setDifficultyFilter('all');
                            setTypeFilter('all');
                            setSearchQuery('');
                          }}
                        >
                          Reset Filters
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="mt-6 space-y-4">
          {/* Info Notice */}
          <Card className="border-2 border-muted-foreground/20 bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Custom games are not tracked</p>
                  <p className="text-xs text-muted-foreground">
                    Playground games won't count toward your statistics or leaderboard rankings.
                    Play official game modes to track your progress.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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

