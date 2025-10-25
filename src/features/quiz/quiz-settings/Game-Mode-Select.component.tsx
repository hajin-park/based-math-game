import { useState, useMemo } from "react";
import {
  PaperCard,
  PaperCardContent,
  PaperCardDescription,
  PaperCardHeader,
  PaperCardTitle,
  NotebookInput,
} from "@/components/ui/academic";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OFFICIAL_GAME_MODES,
  getDifficultyColor,
  GameMode,
} from "@/types/gameMode";
import { PlaygroundSettings } from "@features/quiz";
import { QuestionSetting } from "@/contexts/GameContexts";
import {
  Trophy,
  Clock,
  Layers,
  Play,
  Wrench,
  Target,
  ChevronDown,
  ChevronUp,
  Search,
  Binary,
  Hash,
  Hexagon,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GameModeSelectProps {
  onSelectMode: (mode: GameMode, trackStats: boolean) => void;
  initialCustomSettings?: {
    questions: QuestionSetting[];
    duration: number;
    targetQuestions?: number;
  };
}

type CategoryFilter = "explore" | "binary" | "octal" | "hexadecimal" | "mixed";
type DifficultyFilter = "all" | "Easy" | "Medium" | "Hard";
type TypeFilter = "all" | "timed" | "speedrun";

export default function GameModeSelect({
  onSelectMode,
  initialCustomSettings,
}: GameModeSelectProps) {
  // If initialCustomSettings is provided, start on custom tab
  const [selectedTab, setSelectedTab] = useState(
    initialCustomSettings ? "custom" : "official",
  );
  const [trackStats, setTrackStats] = useState(true);
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [expandedModeIds, setExpandedModeIds] = useState<Set<string>>(
    new Set(),
  );
  const [filtersOpen, setFiltersOpen] = useState(true); // Open by default, collapsible on mobile // Collapsed by default on mobile

  const handleSelectMode = (mode: GameMode) => {
    onSelectMode(mode, trackStats);
  };

  const handleCustomPlayground = (settings: {
    questions: QuestionSetting[];
    duration: number;
    targetQuestions?: number;
  }) => {
    // Create a custom game mode from the playground settings
    const customMode: GameMode = {
      id: "custom-playground",
      name: "Custom Playground",
      description: "Your custom quiz settings",
      isOfficial: false,
      questions: settings.questions,
      duration: settings.duration,
      difficulty: "Custom",
      targetQuestions: settings.targetQuestions,
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
      if (categoryFilter !== "explore") {
        if (categoryFilter === "mixed") {
          // Mixed bases: show "All Bases" games (games with multiple base types excluding decimal)
          const bases = new Set<string>();
          mode.questions.forEach((q) => {
            const fromBase = q[0].toLowerCase();
            const toBase = q[1].toLowerCase();
            if (fromBase !== "decimal") bases.add(fromBase);
            if (toBase !== "decimal") bases.add(toBase);
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
      if (difficultyFilter !== "all" && mode.difficulty !== difficultyFilter)
        return false;

      // Type filter (timed vs speedrun)
      if (typeFilter !== "all") {
        const isSpeedRun = mode.targetQuestions !== undefined;
        if (typeFilter === "speedrun" && !isSpeedRun) return false;
        if (typeFilter === "timed" && isSpeedRun) return false;
      }

      return true;
    });
  }, [categoryFilter, searchQuery, difficultyFilter, typeFilter]);

  return (
    <div className="w-full space-y-2">
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        {/* Tabs aligned with sidebar width + Track Stats Toggle */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 mb-2">
          <div className="flex items-center gap-2 w-full lg:w-60">
            <TabsList className="grid grid-cols-2 h-auto p-1 flex-1">
              <TabsTrigger
                value="official"
                className="flex items-center gap-1.5 py-1.5 text-sm"
              >
                <Trophy className="h-3.5 w-3.5" />
                Official
              </TabsTrigger>
              <TabsTrigger
                value="custom"
                className="flex items-center gap-1.5 py-1.5 text-sm"
              >
                <Wrench className="h-3.5 w-3.5" />
                Custom
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Track Stats Toggle with Notice */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="track-stats-inline"
                className={cn(
                  "text-sm font-medium cursor-pointer",
                  selectedTab === "custom" ? "text-muted-foreground" : "",
                )}
              >
                Track Stats
              </Label>
              <Switch
                id="track-stats-inline"
                checked={trackStats}
                onCheckedChange={setTrackStats}
                disabled={selectedTab === "custom"}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            {selectedTab === "custom" && (
              <p className="text-xs text-muted-foreground italic">
                Custom games won't count toward statistics or leaderboards
              </p>
            )}
          </div>
        </div>

        <TabsContent value="official" className="space-y-0 mt-0">
          <div className="flex flex-col lg:flex-row gap-2">
            {/* Sidebar - Minimal Padding */}
            <PaperCard
              variant="folded-sm"
              padding="sm"
              className="w-full lg:w-60 flex-shrink-0 border-2 lg:sticky lg:top-4 flex flex-col lg:max-h-[calc(100vh-6rem)]"
            >
              <Collapsible
                open={filtersOpen}
                onOpenChange={setFiltersOpen}
                className="flex flex-col flex-1 min-h-0"
              >
                <PaperCardHeader className="p-2 pb-1 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <PaperCardTitle className="text-sm font-serif">
                      Browse
                    </PaperCardTitle>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-xs h-5 px-2">
                        {filteredModes.length}
                      </Badge>
                      {/* Mobile toggle button */}
                      <CollapsibleTrigger asChild className="lg:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          {filtersOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </PaperCardHeader>
                <CollapsibleContent className="flex-1 min-h-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <PaperCardContent className="space-y-2 p-2">
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <NotebookInput
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 h-8 text-sm"
                          variant="underline"
                        />
                      </div>

                      {/* Categories - Minimal */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Categories
                        </Label>
                        <div className="space-y-0.5">
                          <Button
                            variant={
                              categoryFilter === "explore"
                                ? "secondary"
                                : "ghost"
                            }
                            className="w-full justify-start h-7 text-xs px-2"
                            onClick={() => setCategoryFilter("explore")}
                          >
                            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                            Explore All
                          </Button>
                          <Button
                            variant={
                              categoryFilter === "binary"
                                ? "secondary"
                                : "ghost"
                            }
                            className="w-full justify-start h-7 text-xs px-2"
                            onClick={() => setCategoryFilter("binary")}
                          >
                            <Binary className="h-3.5 w-3.5 mr-1.5" />
                            Binary
                          </Button>
                          <Button
                            variant={
                              categoryFilter === "octal" ? "secondary" : "ghost"
                            }
                            className="w-full justify-start h-7 text-xs px-2"
                            onClick={() => setCategoryFilter("octal")}
                          >
                            <Hash className="h-3.5 w-3.5 mr-1.5" />
                            Octal
                          </Button>
                          <Button
                            variant={
                              categoryFilter === "hexadecimal"
                                ? "secondary"
                                : "ghost"
                            }
                            className="w-full justify-start h-7 text-xs px-2"
                            onClick={() => setCategoryFilter("hexadecimal")}
                          >
                            <Hexagon className="h-3.5 w-3.5 mr-1.5" />
                            Hexadecimal
                          </Button>
                          <Button
                            variant={
                              categoryFilter === "mixed" ? "secondary" : "ghost"
                            }
                            className="w-full justify-start h-7 text-xs px-2"
                            onClick={() => setCategoryFilter("mixed")}
                          >
                            <Layers className="h-3.5 w-3.5 mr-1.5" />
                            Mixed Bases
                          </Button>
                        </div>
                      </div>

                      {/* Additional Filters - Minimal */}
                      <div className="space-y-2 pt-2 border-t">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Difficulty
                          </Label>
                          <Select
                            value={difficultyFilter}
                            onValueChange={(value) =>
                              setDifficultyFilter(value as DifficultyFilter)
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
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

                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Type
                          </Label>
                          <Select
                            value={typeFilter}
                            onValueChange={(value) =>
                              setTypeFilter(value as TypeFilter)
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="timed">Timed</SelectItem>
                              <SelectItem value="speedrun">
                                Speed Run
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Reset Filters Button - Minimal */}
                      {(categoryFilter !== "explore" ||
                        difficultyFilter !== "all" ||
                        typeFilter !== "all" ||
                        searchQuery) && (
                        <div className="pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-7 text-xs"
                            onClick={() => {
                              setCategoryFilter("explore");
                              setDifficultyFilter("all");
                              setTypeFilter("all");
                              setSearchQuery("");
                            }}
                          >
                            Clear Filters
                          </Button>
                        </div>
                      )}
                    </PaperCardContent>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            </PaperCard>

            {/* Main Content - Grid Layout with Defined Scroll Area */}
            <div className="flex-1 min-w-0">
              <div className="border-2 border-muted rounded-lg bg-muted/10 p-2">
                <ScrollArea className="h-[calc(100vh-240px)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pr-2 auto-rows-max">
                    {filteredModes.map((mode) => (
                      <PaperCard
                        key={mode.id}
                        variant="interactive"
                        padding="sm"
                        className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 border-2 folded-corner-sm"
                        onClick={() => handleSelectMode(mode)}
                      >
                        <PaperCardHeader className="p-2 pb-1">
                          <div className="flex items-start justify-between gap-2">
                            <PaperCardTitle className="text-sm leading-tight font-serif">
                              {mode.name}
                            </PaperCardTitle>
                            <Badge
                              className={cn(
                                "shrink-0 text-xs h-5 px-2",
                                getDifficultyColor(mode.difficulty),
                              )}
                              variant="secondary"
                            >
                              {mode.difficulty}
                            </Badge>
                          </div>
                        </PaperCardHeader>
                        <PaperCardContent className="space-y-2 p-2 pt-0">
                          {/* Detailed Settings Collapsible - Inline with info */}
                          <Collapsible
                            open={expandedModeIds.has(mode.id)}
                            onOpenChange={(open) => {
                              const newSet = new Set(expandedModeIds);
                              if (open) {
                                newSet.add(mode.id);
                              } else {
                                newSet.delete(mode.id);
                              }
                              setExpandedModeIds(newSet);
                            }}
                          >
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {mode.targetQuestions
                                      ? `${mode.targetQuestions}q`
                                      : `${mode.duration}s`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  <Layers className="h-3 w-3" />
                                  <span>{mode.questions.length} types</span>
                                </div>
                              </div>
                              <CollapsibleTrigger asChild>
                                <button
                                  className="flex items-center gap-0.5 hover:text-foreground transition-colors text-xs"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {expandedModeIds.has(mode.id) ? (
                                    <ChevronUp className="h-3 w-3" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3" />
                                  )}
                                  <span>(View details)</span>
                                </button>
                              </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent className="pt-1.5">
                              <div className="space-y-1.5 text-xs">
                                <div className="p-1.5 rounded-md bg-muted/50">
                                  <p className="font-semibold mb-0.5">
                                    Question Types:
                                  </p>
                                  <ul className="space-y-0.5 text-muted-foreground">
                                    {mode.questions.map((q, idx) => (
                                      <li key={idx}>
                                        • {q[0]} → {q[1]} ({q[2]}-{q[3]})
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                {mode.targetQuestions && (
                                  <div className="p-1.5 rounded-md bg-muted/50">
                                    <p className="font-semibold">
                                      Speed Run Mode
                                    </p>
                                    <p className="text-muted-foreground">
                                      Complete {mode.targetQuestions} questions
                                      ASAP
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>

                          <Button size="sm" className="w-full h-8 text-xs">
                            <Play className="mr-1.5 h-3 w-3" />
                            Play
                          </Button>
                        </PaperCardContent>
                      </PaperCard>
                    ))}

                    {filteredModes.length === 0 && (
                      <PaperCard
                        variant="folded-sm"
                        padding="sm"
                        className="border-2 border-dashed col-span-full"
                      >
                        <PaperCardContent className="py-8 text-center p-6">
                          <Target className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-base font-medium mb-1 font-serif">
                            No modes match your filters
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            Try adjusting your filter settings
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              setCategoryFilter("explore");
                              setDifficultyFilter("all");
                              setTypeFilter("all");
                              setSearchQuery("");
                            }}
                          >
                            Reset Filters
                          </Button>
                        </PaperCardContent>
                      </PaperCard>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="mt-0 space-y-2">
          <PaperCard variant="folded-sm" padding="sm" className="border-2">
            <PaperCardHeader className="p-2 pb-1">
              <PaperCardTitle className="flex items-center gap-1.5 text-sm font-serif">
                <Wrench className="h-3.5 w-3.5 text-primary" />
                Custom Playground
              </PaperCardTitle>
              <PaperCardDescription className="text-xs">
                Create your own quiz with custom settings
              </PaperCardDescription>
            </PaperCardHeader>
            <PaperCardContent className="p-2">
              <PlaygroundSettings
                onStartQuiz={handleCustomPlayground}
                buttonText="Start Custom Quiz"
                showHeader={false}
                initialSettings={initialCustomSettings}
              />
            </PaperCardContent>
          </PaperCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
