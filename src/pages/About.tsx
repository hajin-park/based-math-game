import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function About() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">About Based Math Game</h1>
        <p className="text-muted-foreground">
          Learn base conversion through interactive practice
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Based Math Game is designed to help students, programmers, and anyone interested in computer science 
              master the fundamental skill of converting between different number bases (Binary, Octal, Decimal, and Hexadecimal).
            </p>
            <p>
              Through timed quizzes and interactive tutorials, we make learning base conversion engaging and effective. 
              Whether you're preparing for exams, improving your programming skills, or just curious about how computers 
              represent numbers, we're here to help.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Interactive Tutorials:</strong> Learn each number base with clear explanations and examples</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Timed Quizzes:</strong> Practice with official game modes or create custom challenges</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Multiplayer Mode:</strong> Compete with friends in real-time conversion challenges</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Progress Tracking:</strong> Monitor your improvement with detailed statistics and game history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Global Leaderboards:</strong> See how you rank against players worldwide</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Guest Mode:</strong> Try the game without creating an account</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Built with modern web technologies including React, TypeScript, and Firebase, Based Math Game 
              provides a fast, responsive, and reliable learning experience across all devices.
            </p>
            <p className="text-sm text-muted-foreground">
              This project is open source and available on GitHub under the GPL-3.0 license.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inspiration</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              This project was inspired by{' '}
              <a 
                href="https://arithmetic.zetamac.com" 
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                zetamac
              </a>
              , a popular arithmetic practice tool. We adapted the concept to focus specifically on base conversion, 
              a crucial skill for computer science students and professionals.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

