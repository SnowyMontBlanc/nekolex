import type { UserBreedProgress } from '@/types';

// Review intervals in days for each mastery level
const REVIEW_INTERVALS: Record<number, number> = {
  0: 1,   // Undiscovered → review after 1 day
  1: 3,   // Level 1 → review after 3 days
  2: 7,   // Level 2 → review after 7 days
  3: 14,  // Level 3 → review after 14 days
  4: 30,  // Level 4 → review after 30 days
  5: 60,  // Mastered → periodic review after 60 days
};

/**
 * Calculate the next review date based on mastery level and last review.
 * If the breed has never been reviewed, uses discovered_at as the base date.
 */
export function getNextReviewDate(masteryLevel: number, lastDate: string): Date {
  const intervalDays = REVIEW_INTERVALS[masteryLevel] ?? 1;
  const base = new Date(lastDate);
  base.setDate(base.getDate() + intervalDays);
  return base;
}

/**
 * Get breed IDs that need review based on current date.
 */
export function getBreedsNeedingReview(
  discoveredBreeds: Record<string, UserBreedProgress>,
): string[] {
  const now = new Date();
  const needsReview: { breedId: string; nextReview: Date }[] = [];

  for (const [breedId, progress] of Object.entries(discoveredBreeds)) {
    const baseDate = progress.last_reviewed_at ?? progress.discovered_at;
    const nextReview = getNextReviewDate(progress.mastery_level, baseDate);
    if (nextReview <= now) {
      needsReview.push({ breedId, nextReview });
    }
  }

  // Sort by urgency (oldest overdue first)
  needsReview.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());

  return needsReview.map((r) => r.breedId);
}

/**
 * Update mastery level based on quiz answer correctness.
 */
export function updateMasteryLevel(
  correct: boolean,
  currentProgress: UserBreedProgress,
): UserBreedProgress {
  return {
    ...currentProgress,
    times_reviewed: currentProgress.times_reviewed + 1,
    correct_answers: correct
      ? currentProgress.correct_answers + 1
      : currentProgress.correct_answers,
    mastery_level: correct
      ? Math.min(currentProgress.mastery_level + 1, 5)
      : 0, // Reset to 0 on incorrect (per spec)
    last_reviewed_at: new Date().toISOString(),
  };
}

/**
 * Get the number of breeds needing review.
 */
export function getReviewCount(
  discoveredBreeds: Record<string, UserBreedProgress>,
): number {
  return getBreedsNeedingReview(discoveredBreeds).length;
}
