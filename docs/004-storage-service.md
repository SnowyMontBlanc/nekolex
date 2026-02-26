# 004: ストレージサービス実装

## 概要
AsyncStorage をラップしたストレージサービスを実装し、アプリデータの永続化を管理する。

## 依存先
002 (型定義)

## ブロック対象
005

## 作業内容

### 1. ストレージサービス (`services/storage.ts`)

#### ストレージキー定義
- `user-profile`: ユーザープロフィール (UserProfile)
- `breeds-discovered`: 発見済み品種 (Record<string, UserBreedProgress>)
- `quiz-history`: クイズ履歴 (QuizResult[])
- `settings`: アプリ設定

#### 提供する関数
```typescript
// ユーザープロフィール
getUserProfile(): Promise<UserProfile>
saveUserProfile(profile: UserProfile): Promise<void>

// 発見済み品種
getDiscoveredBreeds(): Promise<Record<string, UserBreedProgress>>
saveDiscoveredBreed(breedId: string, progress: UserBreedProgress): Promise<void>
isBreedDiscovered(breedId: string): Promise<boolean>

// クイズ履歴
getQuizHistory(): Promise<QuizResult[]>
saveQuizResult(result: QuizResult): Promise<void>

// 設定
getSettings(): Promise<AppSettings>
saveSettings(settings: AppSettings): Promise<void>

// 初期化 & リセット
initializeStorage(): Promise<void>
resetAllData(): Promise<void>
```

### 2. デフォルト値の定義
- 初回起動時のデフォルトプロフィール (Lv.1, XP 0)
- デフォルト設定 (difficulty: easy, sound: true, haptic: true)

### 3. エラーハンドリング
- AsyncStorage 読み書き失敗時の処理
- JSON parse エラーの処理
- デフォルト値へのフォールバック

## 完了条件
- すべてのストレージ関数が型安全に実装されている
- デフォルト値が正しく設定される
- JSON.stringify/parse が正しく行われる
- エラー時にフォールバック動作する
- TypeScript コンパイルエラーがない

## TODO
- [x] services/storage.ts 作成
- [x] ストレージキー定数の定義
- [x] ユーザープロフィール CRUD 関数
- [x] 発見済み品種 CRUD 関数
- [x] クイズ履歴 CRUD 関数
- [x] 設定 CRUD 関数
- [x] デフォルト値の定義
- [x] エラーハンドリング & フォールバック
