# 011: クイズ生成ロジック

## 概要
難易度別のクイズ問題を生成するロジックを実装する。品種データと発見済み品種をもとに、適切な選択肢を生成する。

## 依存先
002 (型定義 & 品種データ)

## ブロック対象
012

## 作業内容

### 1. クイズ生成ユーティリティ (`utils/quiz-generator.ts`)

#### メイン関数
```typescript
generateQuiz(
  difficulty: QuizDifficulty,
  discoveredBreeds: string[],
  count?: number  // デフォルト 5
): QuizQuestion[]
```

#### 問題タイプ別生成

**1. 写真から品種を選ぶ (photo_choice)**
- 正解品種の画像を表示
- 4つの品種名から選択
- 難易度に応じた選択肢生成

**2. 特徴から品種を選ぶ (feature_choice)**
- 品種の特徴 (characteristics + temperament) を表示
- 4つの品種名から選択

**3. 2品種の違いを選ぶ (difference_choice) - 上級のみ**
- similar_breeds ペアを選択
- 最も大きな違いを選ぶ

#### 難易度別の選択肢生成ロジック
```typescript
// 初級 (easy)
// - 正解とサイズや特徴が全く異なる品種を選択肢に
// - 問題タイプ: photo_choice のみ

// 中級 (medium)
// - 同じサイズの品種を混ぜる
// - 問題タイプ: photo_choice + feature_choice

// 上級 (hard)
// - similar_breeds を優先的に選択肢に
// - 問題タイプ: 全タイプ (difference_choice 含む)
```

#### ヘルパー関数
```typescript
// 選択肢生成
generateOptions(correctBreed: Breed, difficulty: QuizDifficulty, allBreeds: Breed[]): Breed[]

// ランダム選択
randomChoice<T>(array: T[]): T
randomSample<T>(array: T[], count: number): T[]

// シャッフル
shuffle<T>(array: T[]): T[]
```

### 2. 最低条件チェック
- 発見済み品種が4未満の場合はエラー
- 問題数が発見済み品種数を超えないようにする

### 3. 重複防止
- 同じ品種が連続して出題されないようにする
- 選択肢に同じ品種が含まれないようにする

## 完了条件
- 3つの難易度でクイズが生成できる
- 選択肢が難易度に応じて適切に選ばれる
- 重複する問題や選択肢がない
- 発見済み品種が4未満の場合にエラーが返る
- TypeScript コンパイルエラーがない

## TODO
- [x] utils/quiz-generator.ts 作成
- [x] generateQuiz メイン関数
- [x] photo_choice 問題の生成
- [x] feature_choice 問題の生成
- [x] difference_choice 問題の生成 (上級)
- [x] 難易度別の選択肢生成ロジック
- [x] ヘルパー関数 (randomChoice, randomSample, shuffle)
- [x] 最低条件チェック (4品種未満エラー)
- [x] 重複防止ロジック
