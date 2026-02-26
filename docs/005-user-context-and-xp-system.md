# 005: ユーザーContext & XPシステム

## 概要
アプリ全体でユーザー状態 (レベル、XP、発見品種) を管理する React Context と、XP 計算・レベルアップロジックを実装する。

## 依存先
002 (型定義), 004 (ストレージサービス)

## ブロック対象
008, 009, 012, 014, 015

## 作業内容

### 1. XP計算ユーティリティ (`utils/xp-calculator.ts`)

#### XP付与ルール
- 品種を発見: +10 XP
- クイズ正解: +5 XP
- パーフェクト達成: +20 XP (ボーナス)

#### レベルアップ条件
```
Lv1 → Lv2: 100 XP
Lv2 → Lv3: 250 XP
Lv3 → Lv4: 500 XP
Lv4 → Lv5: 800 XP
...
```

#### 提供する関数
```typescript
calculateLevel(totalXp: number): number
xpForNextLevel(currentLevel: number): number
xpProgress(totalXp: number): { current: number; required: number; percentage: number }
```

### 2. ユーザーContext (`contexts/user-context.tsx`)

#### 管理する状態
- UserProfile (level, xp, discovered_count, etc.)
- discoveredBreeds (Record<string, UserBreedProgress>)
- loading 状態

#### 提供する操作
```typescript
// 品種発見
discoverBreed(breedId: string, photoUrl?: string): Promise<void>
  // → ストレージに保存 + XP付与 + レベル更新

// クイズ完了
completeQuiz(result: QuizResult): Promise<void>
  // → 履歴保存 + XP付与 + 正解率更新

// 復習更新
updateBreedReview(breedId: string, correct: boolean): Promise<void>
  // → mastery_level / correct_answers 更新

// データ読み込み
refreshData(): Promise<void>
```

### 3. Context Provider の配置
- `app/_layout.tsx` でアプリ全体を `UserProvider` でラップ

## 完了条件
- XP計算が仕様通り動作する
- レベルアップが正しく計算される
- Context 経由でユーザー状態にアクセスできる
- 品種発見・クイズ完了時にストレージと状態が同期される
- アプリ起動時にストレージからデータが復元される

## TODO
- [x] utils/xp-calculator.ts 作成 (XP計算、レベル判定)
- [x] contexts/user-context.tsx 作成
- [x] UserContext の状態定義 (profile, discoveredBreeds, loading)
- [x] discoverBreed 関数実装
- [x] completeQuiz 関数実装
- [x] updateBreedReview 関数実装
- [x] アプリ起動時のデータ復元処理
- [x] app/_layout.tsx に UserProvider 配置
