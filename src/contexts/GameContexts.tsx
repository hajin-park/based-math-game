import { createContext } from 'react';

// Type for individual question setting: [fromBase, toBase, rangeLower, rangeUpper]
export type QuestionSetting = [string, string, number, number];

export interface QuizSettings {
  questions: QuestionSetting[];
  duration: number;
  gameModeId?: string;
  trackStats?: boolean;
  isMultiplayer?: boolean;
}

export interface QuizResults {
  score: number;
  duration?: number;
  gameModeId?: string;
}

export interface QuizContextType {
  settings: QuizSettings;
  setSettings: (settings: QuizSettings) => void;
}

export interface ResultContextType {
  results: QuizResults;
  setResults: (results: QuizResults) => void;
}

export const QuizContext = createContext<QuizContextType | null>(null);
export const ResultContext = createContext<ResultContextType | null>(null);

