# 002: 型定義 & 品種データベース作成

## 概要
アプリ全体で使用する TypeScript 型定義と、20品種分の品種マスターデータ (breeds.json) を作成する。

## 依存先
なし

## ブロック対象
004, 005, 007, 011

## 作業内容

### 1. TypeScript 型定義 (`types/index.ts`)

```typescript
// 品種データ
interface Breed {
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

// ユーザーの品種進捗
interface UserBreedProgress {
  breed_id: string;
  discovered_at: string;       // ISO 8601
  user_photo_url?: string;
  times_reviewed: number;
  correct_answers: number;
  mastery_level: number;       // 0-5
}

// ユーザープロフィール
interface UserProfile {
  level: number;
  xp: number;
  discovered_count: number;
  total_quiz_taken: number;
  total_correct_answers: number;
}

// クイズ関連
type QuizDifficulty = 'easy' | 'medium' | 'hard';
type QuizQuestionType = 'photo_choice' | 'feature_choice' | 'difference_choice';

interface QuizQuestion {
  type: QuizQuestionType;
  question_text: string;
  correct_breed_id: string;
  options: { breed_id: string; label: string }[];
}

interface QuizResult {
  date: string;
  difficulty: QuizDifficulty;
  questions: number;
  correct: number;
  xp_gained: number;
}

// Claude API 識別結果
interface IdentificationResult {
  breed_id: string;
  confidence: number;
  characteristics: string[];
}
```

### 2. 品種マスターデータ (`data/breeds.json`)
20品種すべてのデータを作成:
1. スコティッシュフォールド
2. アメリカンショートヘア
3. ブリティッシュショートヘア
4. メインクーン
5. ラグドール
6. ノルウェージャンフォレストキャット
7. ペルシャ
8. ロシアンブルー
9. シャム/サイアミーズ
10. ベンガル
11. アビシニアン
12. マンチカン
13. スフィンクス
14. ターキッシュアンゴラ
15. エキゾチックショートヘア
16. ソマリ
17. トンキニーズ
18. バーミーズ
19. シンガプーラ
20. 雑種/日本猫

各品種に必要なフィールド:
- id, name_ja, name_en, size, characteristics, temperament
- distinguishing_features, similar_breeds, difficulty, origin
- description, care_notes

## 完了条件
- `types/index.ts` にすべての型が定義されている
- `data/breeds.json` に20品種の完全なデータが含まれている
- 各品種の similar_breeds が正しく相互参照している
- TypeScript のコンパイルエラーがない

## TODO
- [x] types/index.ts 作成 (Breed, UserBreedProgress, UserProfile, Quiz系, IdentificationResult)
- [x] data/breeds.json 作成 (20品種分)
- [x] similar_breeds の相互参照確認
- [x] 型の整合性確認
