import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  PaperCard,
  PaperCardContent,
  PaperCardHeader,
  PaperCardTitle,
  NotebookInput,
  StickyNote,
  StickyNoteDescription,
} from "@/components/ui/academic";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoom } from "@/hooks/useRoom";
import {
  OFFICIAL_GAME_MODES,
  GameMode,
  getDifficultyColor,
} from "@/types/gameMode";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaygroundSettings } from "@features/quiz";
import { QuestionSetting } from "@/contexts/GameContexts";
import {
  Trophy,
  Wrench,
  Users,
  Clock,
  Layers,
  Target,
  ChevronDown,
  ChevronUp,
  Search,
  Binary,
  Hash,
  Hexagon,
  Sparkles,
  Info,
  X,
  Play,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type CategoryFilter = "explore" | "binary" | "octal" | "hexadecimal" | "mixed";
type DifficultyFilter = "all" | "Easy" | "Medium" | "Hard";
type TypeFilter = "all" | "timed" | "speedrun";

export default function CreateRoom() {
  const navigate = useNavigate();
  const { createRoom, loading } = useRoom();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedTab, setSelectedTab] = useState("official");
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [expandedModeId, setExpandedModeId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(true); // Open by default, collapsible on mobile

  const handleCreateRoom = async (mode?: GameMode) => {
    const modeToUse = mode || selectedMode;
    if (!modeToUse) return;

    try {
      const roomId = await createRoom(modeToUse, maxPlayers);
      navigate(`/multiplayer/lobby/${roomId}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Failed to create room. Please try again.");
    }
  };

  const handleCustomPlayground = async (settings: {
    questions: QuestionSetting[];
    duration: number;
    targetQuestions?: number;
  }) => {
    // Validate: multiplayer games cannot have unlimited time (for timed mode)
    if (settings.duration === 0 && !settings.targetQuestions) {
      alert(
        "Multiplayer games require a time limit. Please select a duration.",
      );
      return;
    }

    // Create a custom game mode from the playground settings
    const customMode: GameMode = {
      id: "custom-playground",
      name: "Custom Playground",
      description: "Your custom quiz settings",
      isOfficial: false,
      questions: settings.questions,
      duration: settings.duration,
      targetQuestions: settings.targetQuestions,
      difficulty: "Custom",
    };

    try {
      const roomId = await createRoom(customMode, maxPlayers);
      navigate(`/multiplayer/lobby/${roomId}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Failed to create room. Please try again.");
    }
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
          // Count unique non-decimal bases in the questions
          const bases = new Set<string>();
          mode.questions.forEach((q) => {
            const fromBase = q[0].toLowerCase();
            const toBase = q[1].toLowerCase();
            if (fromBase !== "decimal") bases.add(fromBase);
            if (toBase !== "decimal") bases.add(toBase);
          });
          // Must have more than one non-decimal base type
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
      if (difficultyFilter !== "all" && mode.difficulty !== difficultyFilter) {
        return false;
      }

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
    <div className="safe-vh-full paper-texture flex flex-col">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/10 via-background to-background -z-10" />

      <div className="container mx-auto px-fluid py-fluid flex-1 flex flex-col min-h-0">
        {/* Exit Button - Top Left */}
        <div className="mb-3">
          <Button
            onClick={() => navigate("/multiplayer")}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Exit
          </Button>
        </div>

        {/* Compact Header with Academic Styling */}
        <div className="text-center space-y-1 mb-4 animate-in">
          <h1 className="text-2xl md:text-3xl font-serif font-bold">
            <span className="highlight-scribble">Create Room</span>
          </h1>
          <p className="text-xs text-muted-foreground annotation">
            48 official modes • Custom playground
          </p>
        </div>

        <div className="w-full space-y-2">
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            {/* Tabs aligned with sidebar width + Room Size Selector */}
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

              {/* Room Size Selector + Notice - Inline Design */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 w-full lg:w-auto">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="max-players-inline"
                    className="text-sm font-medium flex items-center gap-1.5"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Room Size
                  </Label>
                  <Select
                    value={maxPlayers.toString()}
                    onValueChange={(value) => setMaxPlayers(parseInt(value))}
                  >
                    <SelectTrigger
                      id="max-players-inline"
                      className="h-8 w-[110px] text-xs"
                    >
                      <SelectValue />
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
              </div>
            </div>

            <TabsContent value="official" className="space-y-2 mt-0">
              {/* Stats Notice */}
              <StickyNote variant="info" size="sm" className="hover:rotate-0">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <StickyNoteDescription className="text-xs">
                    Multiplayer games won't count toward statistics or
                    leaderboards
                  </StickyNoteDescription>
                </div>
              </StickyNote>

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
                          <Badge
                            variant="secondary"
                            className="text-xs h-5 px-2"
                          >
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
                                className="w-full justify-start h-8 text-xs"
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
                                className="w-full justify-start h-8 text-xs"
                                onClick={() => setCategoryFilter("binary")}
                              >
                                <Binary className="h-3.5 w-3.5 mr-1.5" />
                                Binary
                              </Button>
                              <Button
                                variant={
                                  categoryFilter === "octal"
                                    ? "secondary"
                                    : "ghost"
                                }
                                className="w-full justify-start h-8 text-xs"
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
                                className="w-full justify-start h-8 text-xs"
                                onClick={() => setCategoryFilter("hexadecimal")}
                              >
                                <Hexagon className="h-3.5 w-3.5 mr-1.5" />
                                Hexadecimal
                              </Button>
                              <Button
                                variant={
                                  categoryFilter === "mixed"
                                    ? "secondary"
                                    : "ghost"
                                }
                                className="w-full justify-start h-8 text-xs"
                                onClick={() => setCategoryFilter("mixed")}
                              >
                                <Layers className="h-3.5 w-3.5 mr-1.5" />
                                Mixed Bases
                              </Button>
                            </div>
                          </div>

                          {/* Additional Filters */}
                          <div className="space-y-2 pt-1 border-t">
                            <div className="space-y-1.5">
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

                            <div className="space-y-1.5">
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

                          {/* Reset Filters Button */}
                          {(categoryFilter !== "explore" ||
                            difficultyFilter !== "all" ||
                            typeFilter !== "all" ||
                            searchQuery) && (
                            <div className="pt-1 border-t">
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
                <div className="flex-1 min-w-0 min-h-0 flex flex-col">
                  <div className="border-2 border-muted rounded-lg bg-muted/10 p-2 flex-1 min-h-0 flex flex-col">
                    <ScrollArea className="flex-1 min-h-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pr-2 auto-rows-max">
                        {filteredModes.map((mode) => (
                          <PaperCard
                            key={mode.id}
                            variant="interactive"
                            padding="sm"
                            className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 border-2 folded-corner-sm"
                            onClick={() => setSelectedMode(mode)}
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
                                open={expandedModeId === mode.id}
                                onOpenChange={(open) =>
                                  setExpandedModeId(open ? mode.id : null)
                                }
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
                                      {expandedModeId === mode.id ? (
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
                                          Complete {mode.targetQuestions}{" "}
                                          questions ASAP
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>

                              {/* Create Room Button */}
                              <Button
                                size="sm"
                                className="w-full h-8 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateRoom(mode);
                                }}
                                disabled={loading}
                              >
                                <Play className="mr-1.5 h-3 w-3" />
                                {loading ? "Creating..." : "Create Room"}
                              </Button>
                            </PaperCardContent>
                          </PaperCard>
                        ))}
                        {filteredModes.length === 0 && (
                          <div className="col-span-full">
                            <PaperCard
                              variant="folded-sm"
                              padding="none"
                              className="border-2 border-dashed"
                            >
                              <PaperCardContent className="p-8 text-center">
                                <Target className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                                <p className="text-base font-medium mb-1">
                                  No modes match your filters
                                </p>
                                <p className="text-xs text-muted-foreground mb-3">
                                  Try adjusting your filter settings
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
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
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-2 mt-0">
              {/* Stats Notice */}
              <StickyNote variant="info" size="sm" className="hover:rotate-0">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <StickyNoteDescription className="text-xs">
                    Multiplayer games won't count toward statistics or
                    leaderboards
                  </StickyNoteDescription>
                </div>
              </StickyNote>

              <PaperCard variant="folded-sm" padding="sm" className="border-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Wrench className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold font-serif">
                      Custom Settings
                    </h3>
                  </div>
                  <PlaygroundSettings
                    onStartQuiz={handleCustomPlayground}
                    buttonText="Create Room"
                    showHeader={false}
                    isMultiplayer={true}
                  />
                </div>
              </PaperCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
