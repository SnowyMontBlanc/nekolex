import type { QuizDifficulty, QuizQuestion } from '@/types';

interface QuizSessionData {
  difficulty: QuizDifficulty;
  score: number;
  total: number;
  questions: QuizQuestion[];
  answers: (string | null)[];
}

let currentSession: QuizSessionData | null = null;

export function setQuizSession(data: QuizSessionData): void {
  currentSession = data;
}

export function getQuizSession(): QuizSessionData | null {
  return currentSession;
}

export function clearQuizSession(): void {
  currentSession = null;
}
