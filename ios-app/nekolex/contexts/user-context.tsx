import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { UserProfile, UserBreedProgress, QuizResult } from '@/types';
import {
  getUserProfile,
  saveUserProfile,
  getDiscoveredBreeds,
  saveDiscoveredBreed,
  saveQuizResult as saveQuizResultToStorage,
  initializeStorage,
} from '@/services/storage';
import { calculateLevel, XP_REWARDS } from '@/utils/xp-calculator';
import { updateMasteryLevel } from '@/utils/spaced-repetition';

interface UserContextValue {
  profile: UserProfile;
  discoveredBreeds: Record<string, UserBreedProgress>;
  loading: boolean;
  pendingLevelUp: number | null;
  discoverBreed: (breedId: string, photoUrl?: string) => Promise<void>;
  completeQuiz: (result: QuizResult) => Promise<void>;
  updateBreedReview: (breedId: string, correct: boolean) => Promise<void>;
  clearPendingLevelUp: () => void;
  refreshData: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({
    level: 1,
    xp: 0,
    discovered_count: 0,
    total_quiz_taken: 0,
    total_correct_answers: 0,
  });
  const [discoveredBreeds, setDiscoveredBreeds] = useState<Record<string, UserBreedProgress>>({});
  const [loading, setLoading] = useState(true);
  const [pendingLevelUp, setPendingLevelUp] = useState<number | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await initializeStorage();
      const [loadedProfile, loadedBreeds] = await Promise.all([
        getUserProfile(),
        getDiscoveredBreeds(),
      ]);
      setProfile(loadedProfile);
      setDiscoveredBreeds(loadedBreeds);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const clearPendingLevelUp = useCallback(() => setPendingLevelUp(null), []);

  const discoverBreed = useCallback(async (breedId: string, photoUrl?: string) => {
    const progress: UserBreedProgress = {
      breed_id: breedId,
      discovered_at: new Date().toISOString(),
      user_photo_url: photoUrl,
      times_reviewed: 0,
      correct_answers: 0,
      mastery_level: 0,
    };

    await saveDiscoveredBreed(breedId, progress);

    let newCount = 0;
    setDiscoveredBreeds((prev) => {
      if (prev[breedId]) return prev; // Already discovered
      const updated = { ...prev, [breedId]: progress };
      newCount = Object.keys(updated).length;
      return updated;
    });

    setProfile((prev) => {
      const updatedProfile = {
        ...prev,
        discovered_count: newCount || prev.discovered_count + 1,
      };
      const newXp = updatedProfile.xp + XP_REWARDS.DISCOVER_BREED;
      const newLevel = calculateLevel(newXp);
      const final = { ...updatedProfile, xp: newXp, level: newLevel };
      saveUserProfile(final);
      if (newLevel > prev.level) {
        setTimeout(() => setPendingLevelUp(newLevel), 0);
      }
      return final;
    });
  }, []);

  const completeQuiz = useCallback(async (result: QuizResult) => {
    await saveQuizResultToStorage(result);

    setProfile((prev) => {
      const updated: UserProfile = {
        ...prev,
        total_quiz_taken: prev.total_quiz_taken + 1,
        total_correct_answers: prev.total_correct_answers + result.correct,
        xp: prev.xp + result.xp_gained,
      };
      updated.level = calculateLevel(updated.xp);
      saveUserProfile(updated);
      if (updated.level > prev.level) {
        setTimeout(() => setPendingLevelUp(updated.level), 0);
      }
      return updated;
    });
  }, []);

  const updateBreedReview = useCallback(async (breedId: string, correct: boolean) => {
    setDiscoveredBreeds((prev) => {
      const breed = prev[breedId];
      if (!breed) return prev;

      const updated = updateMasteryLevel(correct, breed);
      saveDiscoveredBreed(breedId, updated);
      return { ...prev, [breedId]: updated };
    });
  }, []);

  return (
    <UserContext.Provider
      value={{
        profile,
        discoveredBreeds,
        loading,
        pendingLevelUp,
        discoverBreed,
        completeQuiz,
        updateBreedReview,
        clearPendingLevelUp,
        refreshData,
      }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
