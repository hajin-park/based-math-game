import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export default function Usage() {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">How to Play</h1>
        <p className="text-muted-foreground">
          Learn how to master base conversion with Based Math Game
        </p>
      </div>

      <div className="space-y-6">
        {/* Game Basics */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Game Basics</CardTitle>
            <CardDescription>Understanding base conversion challenges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Based Math Game tests your ability to convert numbers between different bases:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                <div className="font-bold text-blue-600 dark:text-blue-400">Binary</div>
                <div className="text-xs text-muted-foreground">Base 2</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
                <div className="font-bold text-orange-600 dark:text-orange-400">Octal</div>
                <div className="text-xs text-muted-foreground">Base 8</div>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800 text-center">
                <div className="font-bold text-green-600 dark:text-green-400">Decimal</div>
                <div className="text-xs text-muted-foreground">Base 10</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800 text-center">
                <div className="font-bold text-purple-600 dark:text-purple-400">Hexadecimal</div>
                <div className="text-xs text-muted-foreground">Base 16</div>
              </div>
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
        <Card>
          <CardHeader>
            <CardTitle>🎮 Singleplayer Mode</CardTitle>
            <CardDescription>Practice at your own pace</CardDescription>
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
              <p className="text-sm font-semibold mb-2">💡 Pro Tip:</p>
              <p className="text-sm">
                Start with official modes to learn, then use Playground to focus on specific conversions you find challenging!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Multiplayer Mode */}
        <Card>
          <CardHeader>
            <CardTitle>👥 Multiplayer Mode</CardTitle>
            <CardDescription>Compete with friends in real-time</CardDescription>
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
                  <span>Select a game mode (official or custom)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>Share the room code with friends</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span>Wait for players to join, then start the game</span>
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
                  <span>Enter the room code shared by the host</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>Mark yourself as ready</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span>Wait for the host to start the game</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm font-semibold mb-2">🏆 Scoring:</p>
              <p className="text-sm">
                All players answer the same questions simultaneously. Fastest correct answers earn the most points.
                Results are shown in real-time on the leaderboard!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* During the Quiz */}
        <Card>
          <CardHeader>
            <CardTitle>⚡ During the Quiz</CardTitle>
            <CardDescription>Gameplay mechanics and scoring</CardDescription>
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
                    <span>Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Enter</kbd> to submit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Correct answers automatically load the next question</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Wrong answers clear the input for retry</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Scoring System</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span><strong>Correct answer:</strong> +1 point</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">🔥</span>
                    <span><strong>Combo bonus:</strong> Consecutive correct answers increase your combo multiplier</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                    <span><strong>Wrong answer:</strong> Breaks combo, no points</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">⏱</span>
                    <span><strong>Time bonus:</strong> Faster answers in multiplayer earn more points</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-sm">On-Screen Information</h3>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="text-center">
                  <div className="font-mono text-2xl font-bold">⏱ 45</div>
                  <div className="text-muted-foreground">Time Remaining</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-2xl font-bold text-green-600 dark:text-green-400">12</div>
                  <div className="text-muted-foreground">Current Score</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-2xl font-bold text-orange-600 dark:text-orange-400">×3</div>
                  <div className="text-muted-foreground">Combo Multiplier</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Progress Tracking</CardTitle>
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
              <p className="text-sm font-semibold mb-2">⚠️ Guest Users:</p>
              <p className="text-sm">
                Playing as a guest? Your stats are tracked during your session, but won't be saved permanently
                or appear on global leaderboards. <Link to="/signup" className="text-primary hover:underline font-semibold">Sign up</Link> to
                save your progress!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Quick Tips</CardTitle>
            <CardDescription>Improve your performance</CardDescription>
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
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2">
          <CardHeader>
            <CardTitle>🚀 Ready to Start?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Choose your path and start mastering base conversion today!
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/tutorials"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Learn with Tutorials
              </Link>
              <Link
                to="/singleplayer"
                className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Start Singleplayer
              </Link>
              <Link
                to="/multiplayer"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Play Multiplayer
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
