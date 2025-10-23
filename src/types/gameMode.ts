import { QuestionSetting } from "@/contexts/GameContexts";

export interface GameMode {
  id: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert" | "Custom";
  duration: number; // in seconds
  questions: QuestionSetting[];
  isOfficial?: boolean;
  icon?: string;
  color?: string;
  targetQuestions?: number; // For speed run modes: game ends after this many correct answers
}

export const OFFICIAL_GAME_MODES: GameMode[] = [
  // ===== TIMED MODES - 15 SECONDS =====
  // Binary - 15s
  {
    id: "binary-easy-15s",
    name: "Binary Easy (15s)",
    description: "Binary ↔ Decimal (0-15) in 15 seconds",
    difficulty: "Easy",
    duration: 15,
    questions: [
      ["Binary", "Decimal", 0, 15],
      ["Decimal", "Binary", 0, 15],
    ],
    isOfficial: true,
    color: "bg-blue-500",
  },
  {
    id: "binary-medium-15s",
    name: "Binary Medium (15s)",
    description: "Binary ↔ Decimal (0-255) in 15 seconds",
    difficulty: "Medium",
    duration: 15,
    questions: [
      ["Binary", "Decimal", 0, 255],
      ["Decimal", "Binary", 0, 255],
    ],
    isOfficial: true,
    color: "bg-blue-600",
  },
  {
    id: "binary-hard-15s",
    name: "Binary Hard (15s)",
    description: "Binary ↔ Decimal (0-4095) in 15 seconds",
    difficulty: "Hard",
    duration: 15,
    questions: [
      ["Binary", "Decimal", 0, 4095],
      ["Decimal", "Binary", 0, 4095],
    ],
    isOfficial: true,
    color: "bg-blue-700",
  },
  // Octal - 15s
  {
    id: "octal-easy-15s",
    name: "Octal Easy (15s)",
    description: "Octal ↔ Decimal (0-15) in 15 seconds",
    difficulty: "Easy",
    duration: 15,
    questions: [
      ["Octal", "Decimal", 0, 15],
      ["Decimal", "Octal", 0, 15],
    ],
    isOfficial: true,
    color: "bg-green-500",
  },
  {
    id: "octal-medium-15s",
    name: "Octal Medium (15s)",
    description: "Octal ↔ Decimal (0-255) in 15 seconds",
    difficulty: "Medium",
    duration: 15,
    questions: [
      ["Octal", "Decimal", 0, 255],
      ["Decimal", "Octal", 0, 255],
    ],
    isOfficial: true,
    color: "bg-green-600",
  },
  {
    id: "octal-hard-15s",
    name: "Octal Hard (15s)",
    description: "Octal ↔ Decimal (0-4095) in 15 seconds",
    difficulty: "Hard",
    duration: 15,
    questions: [
      ["Octal", "Decimal", 0, 4095],
      ["Decimal", "Octal", 0, 4095],
    ],
    isOfficial: true,
    color: "bg-green-700",
  },
  // Hexadecimal - 15s
  {
    id: "hex-easy-15s",
    name: "Hex Easy (15s)",
    description: "Hexadecimal ↔ Decimal (0-15) in 15 seconds",
    difficulty: "Easy",
    duration: 15,
    questions: [
      ["Hexadecimal", "Decimal", 0, 15],
      ["Decimal", "Hexadecimal", 0, 15],
    ],
    isOfficial: true,
    color: "bg-purple-500",
  },
  {
    id: "hex-medium-15s",
    name: "Hex Medium (15s)",
    description: "Hexadecimal ↔ Decimal (0-255) in 15 seconds",
    difficulty: "Medium",
    duration: 15,
    questions: [
      ["Hexadecimal", "Decimal", 0, 255],
      ["Decimal", "Hexadecimal", 0, 255],
    ],
    isOfficial: true,
    color: "bg-purple-600",
  },
  {
    id: "hex-hard-15s",
    name: "Hex Hard (15s)",
    description: "Hexadecimal ↔ Decimal (0-4095) in 15 seconds",
    difficulty: "Hard",
    duration: 15,
    questions: [
      ["Hexadecimal", "Decimal", 0, 4095],
      ["Decimal", "Hexadecimal", 0, 4095],
    ],
    isOfficial: true,
    color: "bg-purple-700",
  },
  // All Bases - 15s
  {
    id: "all-easy-15s",
    name: "All Bases Easy (15s)",
    description: "All bases ↔ Decimal (0-15) in 15 seconds",
    difficulty: "Easy",
    duration: 15,
    questions: [
      ["Binary", "Decimal", 0, 15],
      ["Decimal", "Binary", 0, 15],
      ["Octal", "Decimal", 0, 15],
      ["Decimal", "Octal", 0, 15],
      ["Hexadecimal", "Decimal", 0, 15],
      ["Decimal", "Hexadecimal", 0, 15],
    ],
    isOfficial: true,
    color: "bg-orange-500",
  },
  {
    id: "all-medium-15s",
    name: "All Bases Medium (15s)",
    description: "All bases ↔ Decimal (0-255) in 15 seconds",
    difficulty: "Medium",
    duration: 15,
    questions: [
      ["Binary", "Decimal", 0, 255],
      ["Decimal", "Binary", 0, 255],
      ["Octal", "Decimal", 0, 255],
      ["Decimal", "Octal", 0, 255],
      ["Hexadecimal", "Decimal", 0, 255],
      ["Decimal", "Hexadecimal", 0, 255],
    ],
    isOfficial: true,
    color: "bg-orange-600",
  },
  {
    id: "all-hard-15s",
    name: "All Bases Hard (15s)",
    description: "All bases ↔ Decimal (0-4095) in 15 seconds",
    difficulty: "Hard",
    duration: 15,
    questions: [
      ["Binary", "Decimal", 0, 4095],
      ["Decimal", "Binary", 0, 4095],
      ["Octal", "Decimal", 0, 4095],
      ["Decimal", "Octal", 0, 4095],
      ["Hexadecimal", "Decimal", 0, 4095],
      ["Decimal", "Hexadecimal", 0, 4095],
    ],
    isOfficial: true,
    color: "bg-orange-700",
  },

  // ===== TIMED MODES - 60 SECONDS =====
  // Binary - 60s
  {
    id: "binary-easy-60s",
    name: "Binary Easy (60s)",
    description: "Binary ↔ Decimal (0-15) in 60 seconds",
    difficulty: "Easy",
    duration: 60,
    questions: [
      ["Binary", "Decimal", 0, 15],
      ["Decimal", "Binary", 0, 15],
    ],
    isOfficial: true,
    color: "bg-blue-500",
  },
  {
    id: "binary-medium-60s",
    name: "Binary Medium (60s)",
    description: "Binary ↔ Decimal (0-255) in 60 seconds",
    difficulty: "Medium",
    duration: 60,
    questions: [
      ["Binary", "Decimal", 0, 255],
      ["Decimal", "Binary", 0, 255],
    ],
    isOfficial: true,
    color: "bg-blue-600",
  },
  {
    id: "binary-hard-60s",
    name: "Binary Hard (60s)",
    description: "Binary ↔ Decimal (0-4095) in 60 seconds",
    difficulty: "Hard",
    duration: 60,
    questions: [
      ["Binary", "Decimal", 0, 4095],
      ["Decimal", "Binary", 0, 4095],
    ],
    isOfficial: true,
    color: "bg-blue-700",
  },
  // Octal - 60s
  {
    id: "octal-easy-60s",
    name: "Octal Easy (60s)",
    description: "Octal ↔ Decimal (0-15) in 60 seconds",
    difficulty: "Easy",
    duration: 60,
    questions: [
      ["Octal", "Decimal", 0, 15],
      ["Decimal", "Octal", 0, 15],
    ],
    isOfficial: true,
    color: "bg-green-500",
  },
  {
    id: "octal-medium-60s",
    name: "Octal Medium (60s)",
    description: "Octal ↔ Decimal (0-255) in 60 seconds",
    difficulty: "Medium",
    duration: 60,
    questions: [
      ["Octal", "Decimal", 0, 255],
      ["Decimal", "Octal", 0, 255],
    ],
    isOfficial: true,
    color: "bg-green-600",
  },
  {
    id: "octal-hard-60s",
    name: "Octal Hard (60s)",
    description: "Octal ↔ Decimal (0-4095) in 60 seconds",
    difficulty: "Hard",
    duration: 60,
    questions: [
      ["Octal", "Decimal", 0, 4095],
      ["Decimal", "Octal", 0, 4095],
    ],
    isOfficial: true,
    color: "bg-green-700",
  },
  // Hexadecimal - 60s
  {
    id: "hex-easy-60s",
    name: "Hex Easy (60s)",
    description: "Hexadecimal ↔ Decimal (0-15) in 60 seconds",
    difficulty: "Easy",
    duration: 60,
    questions: [
      ["Hexadecimal", "Decimal", 0, 15],
      ["Decimal", "Hexadecimal", 0, 15],
    ],
    isOfficial: true,
    color: "bg-purple-500",
  },
  {
    id: "hex-medium-60s",
    name: "Hex Medium (60s)",
    description: "Hexadecimal ↔ Decimal (0-255) in 60 seconds",
    difficulty: "Medium",
    duration: 60,
    questions: [
      ["Hexadecimal", "Decimal", 0, 255],
      ["Decimal", "Hexadecimal", 0, 255],
    ],
    isOfficial: true,
    color: "bg-purple-600",
  },
  {
    id: "hex-hard-60s",
    name: "Hex Hard (60s)",
    description: "Hexadecimal ↔ Decimal (0-4095) in 60 seconds",
    difficulty: "Hard",
    duration: 60,
    questions: [
      ["Hexadecimal", "Decimal", 0, 4095],
      ["Decimal", "Hexadecimal", 0, 4095],
    ],
    isOfficial: true,
    color: "bg-purple-700",
  },
  // All Bases - 60s
  {
    id: "all-easy-60s",
    name: "All Bases Easy (60s)",
    description: "All bases ↔ Decimal (0-15) in 60 seconds",
    difficulty: "Easy",
    duration: 60,
    questions: [
      ["Binary", "Decimal", 0, 15],
      ["Decimal", "Binary", 0, 15],
      ["Octal", "Decimal", 0, 15],
      ["Decimal", "Octal", 0, 15],
      ["Hexadecimal", "Decimal", 0, 15],
      ["Decimal", "Hexadecimal", 0, 15],
    ],
    isOfficial: true,
    color: "bg-orange-500",
  },
  {
    id: "all-medium-60s",
    name: "All Bases Medium (60s)",
    description: "All bases ↔ Decimal (0-255) in 60 seconds",
    difficulty: "Medium",
    duration: 60,
    questions: [
      ["Binary", "Decimal", 0, 255],
      ["Decimal", "Binary", 0, 255],
      ["Octal", "Decimal", 0, 255],
      ["Decimal", "Octal", 0, 255],
      ["Hexadecimal", "Decimal", 0, 255],
      ["Decimal", "Hexadecimal", 0, 255],
    ],
    isOfficial: true,
    color: "bg-orange-600",
  },
  {
    id: "all-hard-60s",
    name: "All Bases Hard (60s)",
    description: "All bases ↔ Decimal (0-4095) in 60 seconds",
    difficulty: "Hard",
    duration: 60,
    questions: [
      ["Binary", "Decimal", 0, 4095],
      ["Decimal", "Binary", 0, 4095],
      ["Octal", "Decimal", 0, 4095],
      ["Decimal", "Octal", 0, 4095],
      ["Hexadecimal", "Decimal", 0, 4095],
      ["Decimal", "Hexadecimal", 0, 4095],
    ],
    isOfficial: true,
    color: "bg-orange-700",
  },

  // ===== SPEED RUN MODES - 10 QUESTIONS =====
  // Binary - 10q
  {
    id: "binary-easy-10q",
    name: "Binary Easy Sprint (10q)",
    description: "Binary ↔ Decimal (0-15) - First to 10 questions",
    difficulty: "Easy",
    duration: 3600, // 1 hour max, but game ends at target
    targetQuestions: 10,
    questions: [
      ["Binary", "Decimal", 0, 15],
      ["Decimal", "Binary", 0, 15],
    ],
    isOfficial: true,
    color: "bg-blue-500",
  },
  {
    id: "binary-medium-10q",
    name: "Binary Medium Sprint (10q)",
    description: "Binary ↔ Decimal (0-255) - First to 10 questions",
    difficulty: "Medium",
    duration: 3600,
    targetQuestions: 10,
    questions: [
      ["Binary", "Decimal", 0, 255],
      ["Decimal", "Binary", 0, 255],
    ],
    isOfficial: true,
    color: "bg-blue-600",
  },
  {
    id: "binary-hard-10q",
    name: "Binary Hard Sprint (10q)",
    description: "Binary ↔ Decimal (0-4095) - First to 10 questions",
    difficulty: "Hard",
    duration: 3600,
    targetQuestions: 10,
    questions: [
      ["Binary", "Decimal", 0, 4095],
      ["Decimal", "Binary", 0, 4095],
    ],
    isOfficial: true,
    color: "bg-blue-700",
  },
  // Octal - 10q
  {
    id: "octal-easy-10q",
    name: "Octal Easy Sprint (10q)",
    description: "Octal ↔ Decimal (0-15) - First to 10 questions",
    difficulty: "Easy",
    duration: 3600,
    targetQuestions: 10,
    questions: [
      ["Octal", "Decimal", 0, 15],
      ["Decimal", "Octal", 0, 15],
    ],
    isOfficial: true,
    color: "bg-green-500",
  },
  {
    id: "octal-medium-10q",
    name: "Octal Medium Sprint (10q)",
    description: "Octal ↔ Decimal (0-255) - First to 10 questions",
    difficulty: "Medium",
    duration: 3600,
    targetQuestions: 10,
    questions: [
      ["Octal", "Decimal", 0, 255],
      ["Decimal", "Octal", 0, 255],
    ],
    isOfficial: true,
    color: "bg-green-600",
  },
  {
    id: "octal-hard-10q",
    name: "Octal Hard Sprint (10q)",
    description: "Octal ↔ Decimal (0-4095) - First to 10 questions",
    difficulty: "Hard",
    duration: 3600,
    targetQuestions: 10,
    questions: [
      ["Octal", "Decimal", 0, 4095],
      ["Decimal", "Octal", 0, 4095],
    ],
    isOfficial: true,
    color: "bg-green-700",
  },
  // Hexadecimal - 10q
  {
    id: "hex-easy-10q",
    name: "Hex Easy Sprint (10q)",
    description: "Hexadecimal ↔ Decimal (0-15) - First to 10 questions",
    difficulty: "Easy",
    duration: 3600,
    targetQuestions: 10,
    questions: [
      ["Hexadecimal", "Decimal", 0, 15],
      ["Decimal", "Hexadecimal", 0, 15],
    ],
    isOfficial: true,
    color: "bg-purple-500",
  },
  {
    id: "hex-medium-10q",
    name: "Hex Medium Sprint (10q)",
    description: "Hexadecimal ↔ Decimal (0-255) - First to 10 questions",
    difficulty: "Medium",
    duration: 3600,
    targetQuestions: 10,
    questions: [
      ["Hexadecimal", "Decimal", 0, 255],
      ["Decimal", "Hexadecimal", 0, 255],
    ],
    isOfficial: true,
    color: "bg-purple-600",
  },
  {
    id: "hex-hard-10q",
    name: "Hex Hard Sprint (10q)",
    description: "Hexadecimal ↔ Decimal (0-4095) - First to 10 questions",
    difficulty: "Hard",
    duration: 3600,
    targetQuestions: 10,
    questions: [
      ["Hexadecimal", "Decimal", 0, 4095],
      ["Decimal", "Hexadecimal", 0, 4095],
    ],
    isOfficial: true,
    color: "bg-purple-700",
  },
  // All Bases - 10q
  {
    id: "all-easy-10q",
    name: "All Bases Easy Sprint (10q)",
    description: "All bases ↔ Decimal (0-15) - First to 10 questions",
    difficulty: "Easy",
    duration: 3600,
    targetQuestions: 10,
    questions: [
      ["Binary", "Decimal", 0, 15],
      ["Decimal", "Binary", 0, 15],
      ["Octal", "Decimal", 0, 15],
      ["Decimal", "Octal", 0, 15],
      ["Hexadecimal", "Decimal", 0, 15],
      ["Decimal", "Hexadecimal", 0, 15],
    ],
    isOfficial: true,
    color: "bg-orange-500",
  },
  {
    id: "all-medium-10q",
    name: "All Bases Medium Sprint (10q)",
    description: "All bases ↔ Decimal (0-255) - First to 10 questions",
    difficulty: "Medium",
    duration: 3600,
    targetQuestions: 10,
    questions: [
      ["Binary", "Decimal", 0, 255],
      ["Decimal", "Binary", 0, 255],
      ["Octal", "Decimal", 0, 255],
      ["Decimal", "Octal", 0, 255],
      ["Hexadecimal", "Decimal", 0, 255],
      ["Decimal", "Hexadecimal", 0, 255],
    ],
    isOfficial: true,
    color: "bg-orange-600",
  },
  {
    id: "all-hard-10q",
    name: "All Bases Hard Sprint (10q)",
    description: "All bases ↔ Decimal (0-4095) - First to 10 questions",
    difficulty: "Hard",
    duration: 3600,
    targetQuestions: 10,
    questions: [
      ["Binary", "Decimal", 0, 4095],
      ["Decimal", "Binary", 0, 4095],
      ["Octal", "Decimal", 0, 4095],
      ["Decimal", "Octal", 0, 4095],
      ["Hexadecimal", "Decimal", 0, 4095],
      ["Decimal", "Hexadecimal", 0, 4095],
    ],
    isOfficial: true,
    color: "bg-orange-700",
  },

  // ===== SPEED RUN MODES - 30 QUESTIONS =====
  // Binary - 30q
  {
    id: "binary-easy-30q",
    name: "Binary Easy Marathon (30q)",
    description: "Binary ↔ Decimal (0-15) - First to 30 questions",
    difficulty: "Easy",
    duration: 3600,
    targetQuestions: 30,
    questions: [
      ["Binary", "Decimal", 0, 15],
      ["Decimal", "Binary", 0, 15],
    ],
    isOfficial: true,
    color: "bg-blue-500",
  },
  {
    id: "binary-medium-30q",
    name: "Binary Medium Marathon (30q)",
    description: "Binary ↔ Decimal (0-255) - First to 30 questions",
    difficulty: "Medium",
    duration: 3600,
    targetQuestions: 30,
    questions: [
      ["Binary", "Decimal", 0, 255],
      ["Decimal", "Binary", 0, 255],
    ],
    isOfficial: true,
    color: "bg-blue-600",
  },
  {
    id: "binary-hard-30q",
    name: "Binary Hard Marathon (30q)",
    description: "Binary ↔ Decimal (0-4095) - First to 30 questions",
    difficulty: "Hard",
    duration: 3600,
    targetQuestions: 30,
    questions: [
      ["Binary", "Decimal", 0, 4095],
      ["Decimal", "Binary", 0, 4095],
    ],
    isOfficial: true,
    color: "bg-blue-700",
  },
  // Octal - 30q
  {
    id: "octal-easy-30q",
    name: "Octal Easy Marathon (30q)",
    description: "Octal ↔ Decimal (0-15) - First to 30 questions",
    difficulty: "Easy",
    duration: 3600,
    targetQuestions: 30,
    questions: [
      ["Octal", "Decimal", 0, 15],
      ["Decimal", "Octal", 0, 15],
    ],
    isOfficial: true,
    color: "bg-green-500",
  },
  {
    id: "octal-medium-30q",
    name: "Octal Medium Marathon (30q)",
    description: "Octal ↔ Decimal (0-255) - First to 30 questions",
    difficulty: "Medium",
    duration: 3600,
    targetQuestions: 30,
    questions: [
      ["Octal", "Decimal", 0, 255],
      ["Decimal", "Octal", 0, 255],
    ],
    isOfficial: true,
    color: "bg-green-600",
  },
  {
    id: "octal-hard-30q",
    name: "Octal Hard Marathon (30q)",
    description: "Octal ↔ Decimal (0-4095) - First to 30 questions",
    difficulty: "Hard",
    duration: 3600,
    targetQuestions: 30,
    questions: [
      ["Octal", "Decimal", 0, 4095],
      ["Decimal", "Octal", 0, 4095],
    ],
    isOfficial: true,
    color: "bg-green-700",
  },
  // Hexadecimal - 30q
  {
    id: "hex-easy-30q",
    name: "Hex Easy Marathon (30q)",
    description: "Hexadecimal ↔ Decimal (0-15) - First to 30 questions",
    difficulty: "Easy",
    duration: 3600,
    targetQuestions: 30,
    questions: [
      ["Hexadecimal", "Decimal", 0, 15],
      ["Decimal", "Hexadecimal", 0, 15],
    ],
    isOfficial: true,
    color: "bg-purple-500",
  },
  {
    id: "hex-medium-30q",
    name: "Hex Medium Marathon (30q)",
    description: "Hexadecimal ↔ Decimal (0-255) - First to 30 questions",
    difficulty: "Medium",
    duration: 3600,
    targetQuestions: 30,
    questions: [
      ["Hexadecimal", "Decimal", 0, 255],
      ["Decimal", "Hexadecimal", 0, 255],
    ],
    isOfficial: true,
    color: "bg-purple-600",
  },
  {
    id: "hex-hard-30q",
    name: "Hex Hard Marathon (30q)",
    description: "Hexadecimal ↔ Decimal (0-4095) - First to 30 questions",
    difficulty: "Hard",
    duration: 3600,
    targetQuestions: 30,
    questions: [
      ["Hexadecimal", "Decimal", 0, 4095],
      ["Decimal", "Hexadecimal", 0, 4095],
    ],
    isOfficial: true,
    color: "bg-purple-700",
  },
  // All Bases - 30q
  {
    id: "all-easy-30q",
    name: "All Bases Easy Marathon (30q)",
    description: "All bases ↔ Decimal (0-15) - First to 30 questions",
    difficulty: "Easy",
    duration: 3600,
    targetQuestions: 30,
    questions: [
      ["Binary", "Decimal", 0, 15],
      ["Decimal", "Binary", 0, 15],
      ["Octal", "Decimal", 0, 15],
      ["Decimal", "Octal", 0, 15],
      ["Hexadecimal", "Decimal", 0, 15],
      ["Decimal", "Hexadecimal", 0, 15],
    ],
    isOfficial: true,
    color: "bg-orange-500",
  },
  {
    id: "all-medium-30q",
    name: "All Bases Medium Marathon (30q)",
    description: "All bases ↔ Decimal (0-255) - First to 30 questions",
    difficulty: "Medium",
    duration: 3600,
    targetQuestions: 30,
    questions: [
      ["Binary", "Decimal", 0, 255],
      ["Decimal", "Binary", 0, 255],
      ["Octal", "Decimal", 0, 255],
      ["Decimal", "Octal", 0, 255],
      ["Hexadecimal", "Decimal", 0, 255],
      ["Decimal", "Hexadecimal", 0, 255],
    ],
    isOfficial: true,
    color: "bg-orange-600",
  },
  {
    id: "all-hard-30q",
    name: "All Bases Hard Marathon (30q)",
    description: "All bases ↔ Decimal (0-4095) - First to 30 questions",
    difficulty: "Hard",
    duration: 3600,
    targetQuestions: 30,
    questions: [
      ["Binary", "Decimal", 0, 4095],
      ["Decimal", "Binary", 0, 4095],
      ["Octal", "Decimal", 0, 4095],
      ["Decimal", "Octal", 0, 4095],
      ["Hexadecimal", "Decimal", 0, 4095],
      ["Decimal", "Hexadecimal", 0, 4095],
    ],
    isOfficial: true,
    color: "bg-orange-700",
  },
];

export function getGameModeById(id: string): GameMode | undefined {
  return OFFICIAL_GAME_MODES.find((mode) => mode.id === id);
}

export function getDifficultyColor(difficulty: GameMode["difficulty"]): string {
  switch (difficulty) {
    case "Easy":
      return "text-green-600";
    case "Medium":
      return "text-yellow-600";
    case "Hard":
      return "text-orange-600";
    case "Expert":
      return "text-red-600";
    case "Custom":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
}

/**
 * Check if a game mode is a speedrun mode (has targetQuestions)
 */
export function isSpeedrunMode(gameMode: GameMode | undefined | null): boolean {
  return (
    gameMode?.targetQuestions !== undefined && gameMode.targetQuestions > 0
  );
}
