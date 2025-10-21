import { QuestionSetting } from '@/contexts/GameContexts';

export interface GameMode {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Custom';
  duration: number; // in seconds
  questions: QuestionSetting[];
  isOfficial?: boolean;
  icon?: string;
  color?: string;
}

export const OFFICIAL_GAME_MODES: GameMode[] = [
  {
    id: 'binary-basics',
    name: 'Binary Basics',
    description: 'Master binary to decimal conversions with small numbers',
    difficulty: 'Easy',
    duration: 60,
    questions: [
      ['Binary', 'Decimal', 0, 15],
      ['Decimal', 'Binary', 0, 15],
    ],
    isOfficial: true,
    color: 'bg-blue-500',
  },
  {
    id: 'hex-hero',
    name: 'Hex Hero',
    description: 'Convert hexadecimal to decimal and back',
    difficulty: 'Medium',
    duration: 90,
    questions: [
      ['Hexadecimal', 'Decimal', 0, 255],
      ['Decimal', 'Hexadecimal', 0, 255],
    ],
    isOfficial: true,
    color: 'bg-purple-500',
  },
  {
    id: 'octal-odyssey',
    name: 'Octal Odyssey',
    description: 'Navigate the world of octal numbers',
    difficulty: 'Medium',
    duration: 90,
    questions: [
      ['Octal', 'Decimal', 0, 127],
      ['Decimal', 'Octal', 0, 127],
    ],
    isOfficial: true,
    color: 'bg-green-500',
  },
  {
    id: 'mixed-master',
    name: 'Mixed Master',
    description: 'Convert between all bases with medium-sized numbers',
    difficulty: 'Hard',
    duration: 120,
    questions: [
      ['Binary', 'Decimal', 0, 255],
      ['Decimal', 'Binary', 0, 255],
      ['Hexadecimal', 'Binary', 0, 255],
      ['Binary', 'Hexadecimal', 0, 255],
      ['Octal', 'Decimal', 0, 255],
      ['Decimal', 'Octal', 0, 255],
    ],
    isOfficial: true,
    color: 'bg-orange-500',
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Quick conversions with a 30-second time limit',
    difficulty: 'Hard',
    duration: 30,
    questions: [
      ['Binary', 'Decimal', 0, 31],
      ['Decimal', 'Binary', 0, 31],
      ['Hexadecimal', 'Decimal', 0, 31],
      ['Decimal', 'Hexadecimal', 0, 31],
    ],
    isOfficial: true,
    color: 'bg-red-500',
  },
  {
    id: 'ultimate-challenge',
    name: 'Ultimate Challenge',
    description: 'All bases, large numbers, 3-minute marathon',
    difficulty: 'Expert',
    duration: 180,
    questions: [
      ['Binary', 'Decimal', 0, 65535],
      ['Decimal', 'Binary', 0, 65535],
      ['Hexadecimal', 'Decimal', 0, 65535],
      ['Decimal', 'Hexadecimal', 0, 65535],
      ['Octal', 'Decimal', 0, 65535],
      ['Decimal', 'Octal', 0, 65535],
      ['Binary', 'Hexadecimal', 0, 65535],
      ['Hexadecimal', 'Binary', 0, 65535],
    ],
    isOfficial: true,
    color: 'bg-indigo-500',
  },
];

export function getGameModeById(id: string): GameMode | undefined {
  return OFFICIAL_GAME_MODES.find((mode) => mode.id === id);
}

export function getDifficultyColor(difficulty: GameMode['difficulty']): string {
  switch (difficulty) {
    case 'Easy':
      return 'text-green-600';
    case 'Medium':
      return 'text-yellow-600';
    case 'Hard':
      return 'text-orange-600';
    case 'Expert':
      return 'text-red-600';
    case 'Custom':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
}

