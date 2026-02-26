import breedsData from '@/data/breeds.json';
import type { Breed, QuizDifficulty, QuizQuestion, QuizQuestionType } from '@/types';

const allBreeds = breedsData.breeds as Breed[];
const breedMap = new Map(allBreeds.map((b) => [b.id, b]));

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomSample<T>(array: T[], count: number): T[] {
  return shuffle([...array]).slice(0, count);
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateOptions(
  correctBreed: Breed,
  difficulty: QuizDifficulty,
  discoveredBreeds: Breed[],
): Breed[] {
  const others = discoveredBreeds.filter((b) => b.id !== correctBreed.id);

  let pool: Breed[];

  switch (difficulty) {
    case 'easy':
      // Pick breeds with different size or difficulty
      pool = others.filter(
        (b) => b.size !== correctBreed.size || b.difficulty !== correctBreed.difficulty,
      );
      if (pool.length < 3) pool = others;
      break;

    case 'medium':
      // Mix in breeds with same size
      pool = others.filter((b) => b.size === correctBreed.size);
      if (pool.length < 3) pool = others;
      break;

    case 'hard':
      // Prioritize similar_breeds
      const similarIds = new Set(correctBreed.similar_breeds);
      const similar = others.filter((b) => similarIds.has(b.id));
      const rest = others.filter((b) => !similarIds.has(b.id));
      pool = [...similar, ...rest];
      break;

    default:
      pool = others;
  }

  const selected = randomSample(pool, 3);
  return shuffle([correctBreed, ...selected]);
}

function generateFeatureChoice(correctBreed: Breed, options: Breed[]): QuizQuestion {
  const features = [
    ...randomSample(correctBreed.characteristics, Math.min(2, correctBreed.characteristics.length)),
    ...randomSample(correctBreed.temperament, Math.min(1, correctBreed.temperament.length)),
  ];

  return {
    type: 'feature_choice',
    question_text: `以下の特徴を持つ品種は？\n${features.map((f) => `・${f}`).join('\n')}`,
    correct_breed_id: correctBreed.id,
    options: options.map((b) => ({ breed_id: b.id, label: b.name_ja })),
  };
}

function generateDifferenceChoice(correctBreed: Breed, options: Breed[]): QuizQuestion {
  const similarId = correctBreed.similar_breeds[0];
  const similarBreed = breedMap.get(similarId);

  if (!similarBreed) {
    // Fallback to feature choice
    return generateFeatureChoice(correctBreed, options);
  }

  // Pick a distinguishing feature of the correct breed
  const feature = randomChoice(correctBreed.distinguishing_features);

  return {
    type: 'difference_choice',
    question_text: `${correctBreed.name_ja}と${similarBreed.name_ja}の\n最も大きな違いは？`,
    correct_breed_id: correctBreed.id,
    options: shuffle([
      { breed_id: correctBreed.id, label: feature },
      ...randomSample(
        similarBreed.distinguishing_features.map((f) => ({
          breed_id: similarBreed.id,
          label: f,
        })),
        Math.min(3, similarBreed.distinguishing_features.length),
      ),
    ].slice(0, 4)),
  };
}

function getQuestionTypes(difficulty: QuizDifficulty): QuizQuestionType[] {
  switch (difficulty) {
    case 'easy':
      return ['feature_choice'];
    case 'medium':
      return ['feature_choice'];
    case 'hard':
      return ['feature_choice', 'difference_choice'];
  }
}

export function generateQuiz(
  difficulty: QuizDifficulty,
  discoveredBreedIds: string[],
  count: number = 5,
  priorityBreedIds: string[] = [],
): QuizQuestion[] {
  if (discoveredBreedIds.length < 4) {
    throw new Error('最低4品種発見する必要があります');
  }

  const discoveredBreeds = discoveredBreedIds
    .map((id) => breedMap.get(id))
    .filter((b): b is Breed => b !== undefined);

  const questionTypes = getQuestionTypes(difficulty);
  const actualCount = Math.min(count, discoveredBreeds.length);

  // Prioritize breeds needing review
  const priorityBreeds = priorityBreedIds
    .map((id) => breedMap.get(id))
    .filter((b): b is Breed => b !== undefined && discoveredBreedIds.includes(b.id));
  const prioritySelection = priorityBreeds.slice(0, actualCount);
  const remaining = actualCount - prioritySelection.length;
  const nonPriorityBreeds = discoveredBreeds.filter(
    (b) => !priorityBreedIds.includes(b.id),
  );
  const extraBreeds = randomSample(nonPriorityBreeds, remaining);
  const selectedBreeds = shuffle([...prioritySelection, ...extraBreeds]);
  const questions: QuizQuestion[] = [];

  for (const breed of selectedBreeds) {
    const type = randomChoice(questionTypes);
    const options = generateOptions(breed, difficulty, discoveredBreeds);

    switch (type) {
      case 'feature_choice':
        questions.push(generateFeatureChoice(breed, options));
        break;
      case 'difference_choice':
        if (breed.similar_breeds.length > 0) {
          questions.push(generateDifferenceChoice(breed, options));
        } else {
          questions.push(generateFeatureChoice(breed, options));
        }
        break;
    }
  }

  return questions;
}
