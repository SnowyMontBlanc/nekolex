import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, UserBreedProgress, QuizResult, AppSettings } from '@/types';

// Storage keys
const KEYS = {
  USER_PROFILE: 'user-profile',
  BREEDS_DISCOVERED: 'breeds-discovered',
  QUIZ_HISTORY: 'quiz-history',
  SETTINGS: 'settings',
} as const;

// Default values
const DEFAULT_PROFILE: UserProfile = {
  level: 1,
  xp: 0,
  discovered_count: 0,
  total_quiz_taken: 0,
  total_correct_answers: 0,
};

const DEFAULT_SETTINGS: AppSettings = {
  difficulty: 'easy',
  sound_enabled: true,
  haptic_enabled: true,
};

// --- User Profile ---

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const json = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    if (json) {
      return JSON.parse(json) as UserProfile;
    }
    return { ...DEFAULT_PROFILE };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save user profile:', error);
  }
}

// --- Discovered Breeds ---

export async function getDiscoveredBreeds(): Promise<Record<string, UserBreedProgress>> {
  try {
    const json = await AsyncStorage.getItem(KEYS.BREEDS_DISCOVERED);
    if (json) {
      return JSON.parse(json) as Record<string, UserBreedProgress>;
    }
    return {};
  } catch {
    return {};
  }
}

export async function saveDiscoveredBreed(
  breedId: string,
  progress: UserBreedProgress,
): Promise<void> {
  try {
    const discovered = await getDiscoveredBreeds();
    discovered[breedId] = progress;
    await AsyncStorage.setItem(KEYS.BREEDS_DISCOVERED, JSON.stringify(discovered));
  } catch (error) {
    console.error('Failed to save discovered breed:', error);
  }
}

export async function isBreedDiscovered(breedId: string): Promise<boolean> {
  const discovered = await getDiscoveredBreeds();
  return breedId in discovered;
}

// --- Quiz History ---

export async function getQuizHistory(): Promise<QuizResult[]> {
  try {
    const json = await AsyncStorage.getItem(KEYS.QUIZ_HISTORY);
    if (json) {
      return JSON.parse(json) as QuizResult[];
    }
    return [];
  } catch {
    return [];
  }
}

const MAX_QUIZ_HISTORY = 200;

export async function saveQuizResult(result: QuizResult): Promise<void> {
  try {
    let history = await getQuizHistory();
    history.push(result);
    if (history.length > MAX_QUIZ_HISTORY) {
      history = history.slice(-MAX_QUIZ_HISTORY);
    }
    await AsyncStorage.setItem(KEYS.QUIZ_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save quiz result:', error);
  }
}

// --- Settings ---

export async function getSettings(): Promise<AppSettings> {
  try {
    const json = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (json) {
      return JSON.parse(json) as AppSettings;
    }
    return { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

// --- Initialization & Reset ---

export async function initializeStorage(): Promise<void> {
  const profile = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  if (!profile) {
    await saveUserProfile({ ...DEFAULT_PROFILE });
  }
  const settings = await AsyncStorage.getItem(KEYS.SETTINGS);
  if (!settings) {
    await saveSettings({ ...DEFAULT_SETTINGS });
  }
}

export async function resetAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.USER_PROFILE,
      KEYS.BREEDS_DISCOVERED,
      KEYS.QUIZ_HISTORY,
      KEYS.SETTINGS,
    ]);
  } catch (error) {
    console.error('Failed to reset data:', error);
  }
}
