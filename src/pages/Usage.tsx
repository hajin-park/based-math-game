import {
  PaperCard,
  PaperCardContent,
  PaperCardDescription,
  PaperCardHeader,
  PaperCardTitle,
  RuledSeparator,
  SectionHeader,
} from "@/components/ui/academic";
import {
  StickyNote,
  StickyNoteTitle,
  StickyNoteDescription,
} from "@/components/ui/sticky-note";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Clock,
  Target,
  Lightbulb,
  ArrowRight,
  Gamepad2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Usage() {
  return (
    <div className="container mx-auto px-2 py-4 max-w-5xl">
      <SectionHeader
        icon={BookOpen}
        title="How to Play"
        description="Learn how to master base conversion with Based Math Game"
        className="mb-6"
      />

      <div className="space-y-3">
        {/* Game Basics */}
        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">Game Basics</PaperCardTitle>
            <PaperCardDescription className="text-sm">
              Understanding base conversion challenges
            </PaperCardDescription>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <p className="text-sm leading-relaxed">
              Based Math Game tests your ability to convert numbers between
              different bases:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <PaperCard variant="default" padding="sm">
                <PaperCardContent className="pt-2 text-center">
                  <Badge className="mb-1 bg-base-binary/10 text-base-binary border border-base-binary/30 text-xs">
                    Base 2
                  </Badge>
                  <p className="font-bold text-sm">Binary</p>
                  <p className="text-xs text-muted-foreground">Digits: 0-1</p>
                </PaperCardContent>
              </PaperCard>
              <PaperCard variant="default" padding="sm">
                <PaperCardContent className="pt-2 text-center">
                  <Badge className="mb-1 bg-base-octal/10 text-base-octal border border-base-octal/30 text-xs">
                    Base 8
                  </Badge>
                  <p className="font-bold text-sm">Octal</p>
                  <p className="text-xs text-muted-foreground">Digits: 0-7</p>
                </PaperCardContent>
              </PaperCard>
              <PaperCard variant="default" padding="sm">
                <PaperCardContent className="pt-2 text-center">
                  <Badge className="mb-1 bg-base-decimal/10 text-base-decimal border border-base-decimal/30 text-xs">
                    Base 10
                  </Badge>
                  <p className="font-bold text-sm">Decimal</p>
                  <p className="text-xs text-muted-foreground">Digits: 0-9</p>
                </PaperCardContent>
              </PaperCard>
              <PaperCard variant="default" padding="sm">
                <PaperCardContent className="pt-2 text-center">
                  <Badge className="mb-1 bg-base-hex/10 text-base-hex border border-base-hex/30 text-xs">
                    Base 16
                  </Badge>
                  <p className="font-bold text-sm">Hexadecimal</p>
                  <p className="text-xs text-muted-foreground">Digits: 0-F</p>
                </PaperCardContent>
              </PaperCard>
            </div>
            <div className="bg-muted p-2 rounded mt-2">
              <p className="text-sm font-semibold mb-1">Example Question:</p>
              <div className="font-mono text-sm mb-1">
                Convert <span className="text-base-binary font-bold">1010</span>{" "}
                from Binary to Decimal
              </div>
              <div className="text-sm text-muted-foreground">
                Answer: <span className="font-mono font-bold">10</span>
              </div>
            </div>
          </PaperCardContent>
        </PaperCard>

        {/* Singleplayer Mode */}
        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="flex items-center gap-2 text-base">
              <Gamepad2 className="h-4 w-4 text-primary" />
              Singleplayer Mode
            </PaperCardTitle>
            <PaperCardDescription className="text-sm">
              Practice at your own pace with flexible game modes
            </PaperCardDescription>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <div>
              <h3 className="font-semibold mb-1 text-base">
                Official Game Modes
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                Choose from 48 official game modes across different difficulty
                levels and formats:
              </p>
              <div className="grid gap-2 text-xs">
                <div className="space-y-1">
                  <h4 className="font-semibold text-primary text-xs">
                    Timed Challenges (24 modes)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Race against the clock to answer as many questions as
                    possible within the time limit. Available in Easy, Medium,
                    Hard, and Expert difficulties across all base conversions.
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-success text-xs">
                    Speed Runs (24 modes)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Complete a target number of questions as fast as possible.
                    Available in Easy, Medium, Hard, and Expert difficulties
                    across all base conversions.
                  </p>
                </div>
                <div className="bg-muted p-2 rounded space-y-1">
                  <p className="text-xs font-semibold">
                    Supported Conversions:
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <div>• Binary ↔ Decimal</div>
                    <div>• Octal ↔ Decimal</div>
                    <div>• Hexadecimal ↔ Decimal</div>
                    <div>• Binary ↔ Hexadecimal</div>
                    <div>• Octal ↔ Hexadecimal</div>
                    <div>• Binary ↔ Octal</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-1 text-base">Playground Mode</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Create your own custom quiz with complete control:
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">1.</span>
                  <span className="text-xs">
                    <strong>Choose conversions:</strong> Select any combination
                    of base conversions (e.g., Binary → Hex, Decimal → Octal)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">2.</span>
                  <span className="text-xs">
                    <strong>Set number ranges:</strong> Define min/max values
                    for each conversion type
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">3.</span>
                  <span className="text-xs">
                    <strong>Set duration:</strong> Choose quiz length (30s, 60s,
                    120s, or unlimited)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">4.</span>
                  <span className="text-xs">
                    <strong>Start quiz:</strong> Questions are randomly selected
                    from your settings
                  </span>
                </div>
              </div>
            </div>

            <StickyNote variant="info" size="sm">
              <StickyNoteTitle>Pro Tip</StickyNoteTitle>
              <StickyNoteDescription>
                <p className="text-xs">
                  Start with official modes to learn, then use Playground to
                  focus on specific conversions you find challenging!
                </p>
              </StickyNoteDescription>
            </StickyNote>
          </PaperCardContent>
        </PaperCard>

        {/* Multiplayer Mode */}
        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              Multiplayer Mode
            </PaperCardTitle>
            <PaperCardDescription className="text-sm">
              Compete with friends in real-time challenges
            </PaperCardDescription>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <div>
              <h3 className="font-semibold mb-1 text-base">Creating a Room</h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">1.</span>
                  <span className="text-xs">
                    Click "Create Room" from the Multiplayer page
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">2.</span>
                  <span className="text-xs">
                    Select a game mode (official or custom Playground)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">3.</span>
                  <span className="text-xs">
                    Share the 8-character room code or invite link with friends
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">4.</span>
                  <span className="text-xs">
                    Wait for players to join and mark themselves ready
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">5.</span>
                  <span className="text-xs">
                    Start the game when all players are ready
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-1 text-base">Joining a Room</h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">1.</span>
                  <span className="text-xs">
                    Click "Join Room" from the Multiplayer page
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">2.</span>
                  <span className="text-xs">
                    Enter the 8-character room code (case-insensitive)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">3.</span>
                  <span className="text-xs">
                    Mark yourself as ready when you're prepared to play
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">4.</span>
                  <span className="text-xs">
                    Wait for the host to start the game
                  </span>
                </div>
              </div>
            </div>

            <StickyNote variant="warning" size="sm">
              <StickyNoteTitle>Real-Time Competition</StickyNoteTitle>
              <StickyNoteDescription>
                <p className="text-xs">
                  All players see the same questions in the same order. Your
                  score updates in real-time on the live leaderboard. The player
                  with the most correct answers when time runs out wins!
                </p>
              </StickyNoteDescription>
            </StickyNote>
          </PaperCardContent>
        </PaperCard>

        {/* During the Quiz */}
        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              During the Quiz
            </PaperCardTitle>
            <PaperCardDescription className="text-sm">
              Gameplay mechanics and scoring system
            </PaperCardDescription>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <h3 className="font-semibold mb-1 text-base">How to Answer</h3>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold text-xs">•</span>
                    <span className="text-xs">
                      Type your answer in the input field
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold text-xs">•</span>
                    <span className="text-xs">
                      Answers are auto-validated as you type (no submit button
                      needed)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold text-xs">•</span>
                    <span className="text-xs">
                      Correct answers automatically load the next question
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold text-xs">•</span>
                    <span className="text-xs">
                      Wrong answers let you keep trying with no penalty
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold text-xs">•</span>
                    <span className="text-xs">
                      Click the{" "}
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                        ✕
                      </kbd>{" "}
                      button in the top-left to exit
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-1 text-base">Scoring System</h3>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-success font-bold text-xs">✓</span>
                    <span className="text-xs">
                      <strong>Correct answer:</strong> +1 point (auto-validated
                      on keystroke)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive font-bold text-xs">
                      ✗
                    </span>
                    <span className="text-xs">
                      <strong>Wrong answer:</strong> No penalty, just try again
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-info font-bold text-xs">⏱</span>
                    <span className="text-xs">
                      <strong>Pure speed:</strong> Score as many correct answers
                      as possible before time runs out
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-trophy font-bold text-xs">🏆</span>
                    <span className="text-xs">
                      <strong>No partial credit:</strong> Only complete, correct
                      answers count
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-muted p-2 rounded">
              <h3 className="font-semibold mb-1 text-base">
                On-Screen Information
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-mono text-lg font-bold">00:45</div>
                  <div className="text-xs text-muted-foreground">
                    Time Remaining (MM:SS)
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-lg font-bold text-success">
                    12
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Current Score
                  </div>
                </div>
              </div>
            </div>
          </PaperCardContent>
        </PaperCard>

        {/* Progress Tracking */}
        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" />
              Progress Tracking
            </PaperCardTitle>
            <PaperCardDescription className="text-sm">
              Monitor your improvement over time
            </PaperCardDescription>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <h3 className="font-semibold mb-1 text-base">Stats Page</h3>
                <p className="text-xs text-muted-foreground mb-1">
                  View your performance analytics:
                </p>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold text-xs">•</span>
                    <span className="text-xs">Total games played</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold text-xs">•</span>
                    <span className="text-xs">Average score per game mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold text-xs">•</span>
                    <span className="text-xs">
                      Performance trends over time
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold text-xs">•</span>
                    <span className="text-xs">Recent game history</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-1 text-base">Leaderboards</h3>
                <p className="text-xs text-muted-foreground mb-1">
                  Compete globally:
                </p>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold text-xs">•</span>
                    <span className="text-xs">
                      Separate leaderboards for each game mode
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold text-xs">•</span>
                    <span className="text-xs">Top scores from all players</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold text-xs">•</span>
                    <span className="text-xs">
                      Your rank and score highlighted
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold text-xs">•</span>
                    <span className="text-xs">Real-time updates</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-warning/10 p-2 rounded border border-warning/30">
              <p className="text-xs font-semibold mb-1">Guest Users:</p>
              <p className="text-xs">
                Playing as a guest? Your stats are tracked during your session,
                but won't be saved permanently or appear on global leaderboards.{" "}
                <Link
                  to="/signup"
                  className="text-primary hover:underline font-semibold"
                >
                  Sign up
                </Link>{" "}
                to save your progress!
              </p>
            </div>
          </PaperCardContent>
        </PaperCard>

        {/* Quick Tips */}
        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-primary" />
              Quick Tips
            </PaperCardTitle>
            <PaperCardDescription className="text-sm">
              Improve your performance and master base conversion
            </PaperCardDescription>
          </PaperCardHeader>
          <PaperCardContent>
            <div className="grid md:grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">1.</span>
                  <span className="text-xs">
                    <strong>Start with tutorials:</strong> Learn each base
                    before jumping into quizzes
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">2.</span>
                  <span className="text-xs">
                    <strong>Practice regularly:</strong> Consistent practice
                    improves speed and accuracy
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">3.</span>
                  <span className="text-xs">
                    <strong>Use Playground:</strong> Focus on conversions you
                    find difficult
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">4.</span>
                  <span className="text-xs">
                    <strong>Memorize patterns:</strong> Powers of 2, hex letters
                    (A-F = 10-15)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">5.</span>
                  <span className="text-xs">
                    <strong>Take your time:</strong> Your accuracy is tracked in
                    every game!
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold text-xs">6.</span>
                  <span className="text-xs">
                    <strong>Challenge friends:</strong> Multiplayer mode makes
                    learning fun!
                  </span>
                </div>
              </div>
            </div>
          </PaperCardContent>
        </PaperCard>

        {/* Get Started */}
        <PaperCard
          variant="folded-lg"
          padding="lg"
          className="bg-gradient-to-r from-primary/5 to-accent/5"
        >
          <PaperCardHeader>
            <PaperCardTitle className="text-lg gradient-text">
              Ready to Start?
            </PaperCardTitle>
            <PaperCardDescription className="text-sm">
              Choose your path and start mastering base conversion today!
            </PaperCardDescription>
          </PaperCardHeader>
          <PaperCardContent>
            <RuledSeparator
              className="container"
              spacing="lg"
              variant="double"
            />
            <div className="grid md:grid-cols-3 gap-2">
              <Link
                to="/tutorials"
                className="group flex items-center justify-between rounded border-2 border-primary/20 bg-primary/10 px-3 py-2 hover:border-primary/50 hover:bg-primary/20 transition-all"
              >
                <div>
                  <p className="font-semibold text-primary text-xs">
                    Learn with Tutorials
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Master each base system
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/singleplayer"
                className="group flex items-center justify-between rounded border-2 border-primary/20 bg-primary/10 px-3 py-2 hover:border-primary/50 hover:bg-primary/20 transition-all"
              >
                <div>
                  <p className="font-semibold text-primary text-xs">
                    Start Singleplayer
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Practice at your pace
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/multiplayer"
                className="group flex items-center justify-between rounded border-2 border-primary/20 bg-primary/10 px-3 py-2 hover:border-primary/50 hover:bg-primary/20 transition-all"
              >
                <div>
                  <p className="font-semibold text-primary text-xs">
                    Play Multiplayer
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Compete with friends
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </PaperCardContent>
        </PaperCard>
      </div>
    </div>
  );
}
