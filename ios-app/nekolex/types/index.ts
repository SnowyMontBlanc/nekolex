// Breed master data
export interface Breed {
  id: string;
  name_ja: string;
  name_en: string;
  size: 'small' | 'medium' | 'large';
  characteristics: string[];
  temperament: string[];
  distinguishing_features: string[];
  similar_breeds: string[];
  difficulty: 1 | 2 | 3;
  origin: string;
  description: string;
  care_notes: string;
}

// User's breed progress
export interface UserBreedProgress {
  breed_id: string;
  discovered_at: string; // ISO 8601
  last_reviewed_at?: string; // ISO 8601
  user_photo_url?: string;
  times_reviewed: number;
  correct_answers: number;
  mastery_level: number; // 0-5
}

// User profile
export interface UserProfile {
  level: number;
  xp: number;
  discovered_count: number;
  total_quiz_taken: number;
  total_correct_answers: number;
}

// Quiz types
export type QuizDifficulty = 'easy' | 'medium' | 'hard';
export type QuizQuestionType = 'feature_choice' | 'difference_choice';

export interface QuizQuestion {
  type: QuizQuestionType;
  question_text: string;
  correct_breed_id: string;
  options: { breed_id: string; label: string }[];
}

export interface QuizResult {
  date: string;
  difficulty: QuizDifficulty;
  questions: number;
  correct: number;
  xp_gained: number;
}

// Claude API identification result
export interface IdentificationResult {
  breed_id: string;
  confidence: number;
  characteristics: string[];
}

// App settings
export interface AppSettings {
  difficulty: QuizDifficulty;
  sound_enabled: boolean;
  haptic_enabled: boolean;
}
