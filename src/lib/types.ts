
import type { LucideIcon } from 'lucide-react';

export interface MarketItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: 'food' | 'tool' | 'trinket';
}

export type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  word: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | LucideIcon;
  unlocked: boolean;
  date: string;
  check: (state: any) => boolean;
}

export interface NewWord {
  word: string;
  definition: string;
  example: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageHint: string;
}

export interface User {
  name: string;
  email: string;
  password?: string; // Password should not be stored in context for long
  wordCoins: number;
  masteredWords: [string, number][]; // Stored as array for JSON compatibility
  inventory: MarketItem[];
  quizQuestions: QuizQuestion[];
  unlockedBadgeIds: string[]; // Stored as array for JSON compatibility
  storiesGenerated: number;
}
