import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Users, Clock, Target, Lightbulb, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function Usage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-12 text-center space-y-4 animate-in">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookOpen className="h-10 w-10 text-primary" />
          <h1 className="text-5xl font-bold gradient-text">How to Play</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Learn how to master base conversion with Based Math Game
        </p>
      </div>

      <div className="space-y-6">
        {/* Game Basics */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Game Basics</CardTitle>
            <CardDescription>Understanding base conversion challenges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-relaxed">
              Based Math Game tests your ability to convert numbers between different bases:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardContent className="pt-6 text-center">
                  <Badge className="mb-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Base 2</Badge>
                  <p className="font-bold text-lg">Binary</p>
                  <p className="text-xs text-muted-foreground mt-1">Digits: 0-1</p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardContent className="pt-6 text-center">
                  <Badge className="mb-2 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">Base 8</Badge>
                  <p className="font-bold text-lg">Octal</p>
                  <p className="text-xs text-muted-foreground mt-1">Digits: 0-7</p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardContent className="pt-6 text-center">
                  <Badge className="mb-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Base 10</Badge>
                  <p className="font-bold text-lg">Decimal</p>
                  <p className="text-xs text-muted-foreground mt-1">Digits: 0-9</p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardContent className="pt-6 text-center">
                  <Badge className="mb-2 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Base 16</Badge>
                  <p className="font-bold text-lg">Hexadecimal</p>
                  <p className="text-xs text-muted-foreground mt-1">Digits: 0-F</p>
                </CardContent>
              </Card>
            </div>
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p className="text-sm font-semibold mb-2">Example Question:</p>
              <div className="font-mono text-lg mb-2">
                Convert <span className="text-blue-600 dark:text-blue-400 font-bold">1010</span> from Binary to Decimal
              </div>
              <div className="text-sm text-muted-foreground">
                Answer: <span className="font-mono font-bold">10</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Singleplayer Mode */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Singleplayer Mode
            </CardTitle>
            <CardDescription>Practice at your own pace with flexible game modes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Official Game Modes</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Choose from 6 pre-configured challenges designed to test different skills:
              </p>
              <div className="grid gap-2 text-sm">
                <div className="flex items-start gap-2 bg-muted p-2 rounded">
                  <span className="font-bold text-primary">•</span>
                  <div>
                    <span className="font-semibold">Binary Basics:</span> Binary ↔ Decimal (0-255)
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-muted p-2 rounded">
                  <span className="font-bold text-primary">•</span>
                  <div>
                    <span className="font-semibold">Hex Master:</span> Hexadecimal ↔ Decimal (0-255)
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-muted p-2 rounded">
                  <span className="font-bold text-primary">•</span>
                  <div>
                    <span className="font-semibold">Octal Challenge:</span> Octal ↔ Decimal (0-511)
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  ...and 3 more challenging modes!
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Playground Mode</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Create your own custom quiz with complete control:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span><strong>Choose conversions:</strong> Select any combination of base conversions (e.g., Binary → Hex, Decimal → Octal)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span><strong>Set number ranges:</strong> Define min/max values for each conversion type</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span><strong>Set duration:</strong> Choose quiz length (30s, 60s, 120s, or unlimited)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span><strong>Start quiz:</strong> Questions are randomly selected from your settings</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold mb-2">Pro Tip:</p>
              <p className="text-sm">
                Start with official modes to learn, then use Playground to focus on specific conversions you find challenging!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Multiplayer Mode */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Multiplayer Mode
            </CardTitle>
            <CardDescription>Compete with friends in real-time challenges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Creating a Room</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>Click "Create Room" from the Multiplayer page</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>Select a game mode (official or custom Playground)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>Share the 8-character room code or invite link with friends</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span>Wait for players to join and mark themselves ready</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">5.</span>
                  <span>Start the game when all players are ready</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Joining a Room</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>Click "Join Room" from the Multiplayer page</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>Enter the 8-character room code (case-insensitive)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>Mark yourself as ready when you're prepared to play</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span>Wait for the host to start the game</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm font-semibold mb-2">Real-Time Competition:</p>
              <p className="text-sm">
                All players see the same questions in the same order. Your score updates in real-time on the live leaderboard.
                The player with the most correct answers when time runs out wins!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* During the Quiz */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              During the Quiz
            </CardTitle>
            <CardDescription>Gameplay mechanics and scoring system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">How to Answer</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Type your answer in the input field</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Answers are auto-validated as you type (no submit button needed)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Correct answers automatically load the next question</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Wrong answers let you keep trying with no penalty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Click the <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">✕</kbd> button in the top-left to exit</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Scoring System</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span><strong>Correct answer:</strong> +1 point (auto-validated on keystroke)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                    <span><strong>Wrong answer:</strong> No penalty, just try again</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">⏱</span>
                    <span><strong>Pure speed:</strong> Score as many correct answers as possible before time runs out</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">🏆</span>
                    <span><strong>No partial credit:</strong> Only complete, correct answers count</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-sm">On-Screen Information</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="text-center">
                  <div className="font-mono text-2xl font-bold">00:45</div>
                  <div className="text-muted-foreground">Time Remaining (MM:SS)</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-2xl font-bold text-green-600 dark:text-green-400">12</div>
                  <div className="text-muted-foreground">Current Score</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracking */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Progress Tracking
            </CardTitle>
            <CardDescription>Monitor your improvement over time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Stats Page</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  View your performance analytics:
                </p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Total games played</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Average score per game mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Performance trends over time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Recent game history</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Leaderboards</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Compete globally:
                </p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Separate leaderboards for each game mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Top scores from all players</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Your rank and score highlighted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Real-time updates</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-semibold mb-2">Guest Users:</p>
              <p className="text-sm">
                Playing as a guest? Your stats are tracked during your session, but won't be saved permanently
                or appear on global leaderboards. <Link to="/signup" className="text-primary hover:underline font-semibold">Sign up</Link> to
                save your progress!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              Quick Tips
            </CardTitle>
            <CardDescription>Improve your performance and master base conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span><strong>Start with tutorials:</strong> Learn each base before jumping into quizzes</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span><strong>Practice regularly:</strong> Consistent practice improves speed and accuracy</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span><strong>Use Playground:</strong> Focus on conversions you find difficult</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span><strong>Memorize patterns:</strong> Powers of 2, hex letters (A-F = 10-15)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">5.</span>
                  <span><strong>Build combos:</strong> Accuracy matters more than speed for high scores</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">6.</span>
                  <span><strong>Challenge friends:</strong> Multiplayer mode makes learning fun!</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Get Started */}
        <Card className="border-2 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">Ready to Start?</CardTitle>
            <CardDescription className="text-base">
              Choose your path and start mastering base conversion today!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="mb-6" />
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                to="/tutorials"
                className="group flex items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/10 px-6 py-4 hover:border-primary/50 hover:bg-primary/20 transition-all"
              >
                <div>
                  <p className="font-semibold text-primary">Learn with Tutorials</p>
                  <p className="text-xs text-muted-foreground">Master each base system</p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/singleplayer"
                className="group flex items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/10 px-6 py-4 hover:border-primary/50 hover:bg-primary/20 transition-all"
              >
                <div>
                  <p className="font-semibold text-primary">Start Singleplayer</p>
                  <p className="text-xs text-muted-foreground">Practice at your pace</p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/multiplayer"
                className="group flex items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/10 px-6 py-4 hover:border-primary/50 hover:bg-primary/20 transition-all"
              >
                <div>
                  <p className="font-semibold text-primary">Play Multiplayer</p>
                  <p className="text-xs text-muted-foreground">Compete with friends</p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
