
# NekoLex - 猫品種学習アプリ 要件定義書

## 📋 プロジェクト概要

**アプリ名**: NekoLex (ネコレックス)  
**英語表記**: NekoLex - Cat Breed Master  
**コンセプト**: ポケモン図鑑風の猫品種学習アプリ  
**目標**: 1-2週間でMVP完成、1日1-2時間の開発  
**ターゲットプラットフォーム**: iOS & Android (Expo使用)  
**収益化**: 完全無料提供 (ポートフォリオ目的)  
**対象動物**: 猫のみ (MVP)

---

## 🎯 アプリの目的

ユーザーが街で見かけた猫や、友人・家族の猫を撮影することで品種を学習し、ゲーム感覚で猫の品種知識を自然に身につけられるアプリ。

**解決する課題**:
- 猫の品種を調べても「後で思い出せない」
- 似た品種の違いが分からない
- 学習が続かない

**提供する価値**:
- 実際に見た猫で学習できる
- ゲーム要素で楽しく継続できる
- スペースド・リピティションで記憶定着

---

## 📱 MVP機能一覧

### 1. 写真識別機能

**機能**:
- カメラで撮影 OR ギャラリーから画像選択
- Claude APIによる品種自動識別
- 識別結果表示 (品種名 + 信頼度)
- 図鑑への自動登録
- 発見時のアニメーション演出

**画面フロー**:
```
ホーム画面
  ↓
[📸 写真を撮る] または [🖼️ ギャラリー]
  ↓
識別処理中 (ローディング)
  ↓
結果表示
├─ 品種名
├─ 信頼度 (%)
├─ ✨ 新発見！+10 XP (初回のみ)
└─ [図鑑に追加] ボタン
  ↓
品種詳細画面へ遷移
```

**技術仕様**:
- expo-image-picker: カメラ撮影 (launchCameraAsync) & ギャラリー選択 (launchImageLibraryAsync)
- expo-image-manipulator: 送信前の画像リサイズ
- Claude API (tool_use): 構造化された識別結果の取得
- Base64エンコーディングで画像送信

---

### 2. 図鑑システム

**機能**:
- 発見済み品種の一覧表示 (カード形式)
- 未発見品種はシルエット表示
- 発見進捗率の表示 (XX/20品種)
- タップで品種詳細表示
- 発見日時の記録

**データ構造**:
```typescript
interface Breed {
  id: string;                    // 品種ID (例: "scottish_fold")
  name_ja: string;               // 日本語名
  name_en: string;               // 英語名
  size: 'small' | 'medium' | 'large';
  characteristics: string[];     // 特徴リスト
  temperament: string[];         // 性格
  distinguishing_features: string[]; // 見分けポイント
  similar_breeds: string[];      // 似ている品種のID
  difficulty: 1 | 2 | 3;         // 見分けやすさ (1=簡単)
  origin: string;                // 原産国
  description: string;           // 品種の説明
  care_notes: string;            // 飼育上の注意点
}

interface UserBreedProgress {
  breed_id: string;
  discovered_at: Date;           // 発見日時
  user_photo_url?: string;       // ユーザーが撮影した写真
  times_reviewed: number;        // 復習回数
  correct_answers: number;       // 正解数
  mastery_level: number;         // 習熟度 (0-5)
}
```

**画面構成**:
```
┌─────────────────────────────┐
│  🐱 図鑑 12/20              │
│  ████████░░░░░░ 24%        │
│                             │
│  【発見済み】               │
│  ┌─────┬─────┬─────┐       │
│  │ 🐱  │ 🐱  │ 🐱  │       │
│  │ ス  │ ア  │ メ  │       │
│  │ コ  │ メ  │ イ  │       │
│  └─────┴─────┴─────┘       │
│                             │
│  【未発見】                 │
│  ┌─────┬─────┬─────┐       │
│  │ ？  │ ？  │ ？  │       │
│  │     │     │     │       │
│  └─────┴─────┴─────┘       │
└─────────────────────────────┘
```

**ストレージ** (AsyncStorage):
- `breeds-discovered`: 発見済み品種データ (JSON文字列)
- 画像はexpo-file-systemでdocumentDirectoryに保存し、パスのみ保持

---

### 3. 復習クイズ機能

**機能**:
- 難易度選択 (初級/中級/上級)
- 3-5問の短いクイズセッション
- 発見済み品種からランダム出題
- 正解/不正解のフィードバック
- スコア表示とXP獲得
- 週に2-3回の推奨頻度 (通知なし)

**クイズタイプ**:

1. **写真から品種を選ぶ (4択)**
```
[猫の写真]

この品種は？
○ メインクーン
○ ノルウェージャンフォレストキャット
○ ラグドール
○ サイベリアン
```

2. **特徴から品種を選ぶ**
```
以下の特徴を持つ品種は？
・折れ耳
・丸い顔
・穏やかな性格

○ スコティッシュフォールド
○ アメリカンショートヘア
○ ブリティッシュショートヘア
○ ペルシャ
```

3. **2品種の違いを選ぶ (難易度: 上級)**
```
メインクーンとノルウェージャンの
最も大きな違いは？

○ 耳の先の房毛の有無
○ 体の大きさ
○ 毛の長さ
○ 性格
```

**難易度設定**:
- **初級**: 全く異なる品種から出題
- **中級**: やや似た品種を混ぜる
- **上級**: 非常に似た品種同士の比較

**復習アルゴリズム**:
```
間隔反復学習 (Spaced Repetition)
初回発見 → 1日後 → 3日後 → 1週間後 → 2週間後

正解 → 次の復習間隔が長くなる
不正解 → 間隔をリセット
```

**画面構成**:
```
┌─────────────────────────────┐
│  難易度を選択               │
│  ○ 初級 (おすすめ)         │
│  ○ 中級                    │
│  ○ 上級                    │
│  [開始]                     │
└─────────────────────────────┘
      ↓
┌─────────────────────────────┐
│  復習クイズ 1/5             │
│  ⭐⭐⭐ 残りライフ         │
│                             │
│  [猫の写真]                 │
│                             │
│  この品種は？               │
│  ○ オプション1             │
│  ○ オプション2             │
│  ○ オプション3             │
│  ○ オプション4             │
└─────────────────────────────┘
      ↓
┌─────────────────────────────┐
│  結果                       │
│  ████░░ 4/5問正解          │
│  +20 XP 獲得！             │
│                             │
│  [もう一度] [ホームへ]     │
└─────────────────────────────┘
```

---

### 4. プロフィール・進捗管理

**機能**:
- レベル・XPシステム
- 発見品種数の表示
- 正解率の統計
- 学習日数のトラッキング

**XPシステム**:
```
品種を発見: +10 XP
クイズ正解: +5 XP
パーフェクト達成: +20 XP

レベルアップ条件:
Lv1 → Lv2: 100 XP
Lv2 → Lv3: 250 XP
Lv3 → Lv4: 500 XP
...
```

**バッジシステム (将来実装)**:
```
🏆 初心者: 5品種発見
🏆 愛好家: 10品種発見
🏆 エキスパート: 15品種発見
🏆 マスター: 全20品種発見 + 全品種正解率80%以上
🏆 完璧主義: クイズパーフェクト10回達成
```

---

## 🗂️ 品種データベース仕様

### 必須品種リスト (MVP: 20品種)

```
1. スコティッシュフォールド (Scottish Fold)
2. アメリカンショートヘア (American Shorthair)
3. ブリティッシュショートヘア (British Shorthair)
4. メインクーン (Maine Coon)
5. ラグドール (Ragdoll)
6. ノルウェージャンフォレストキャット (Norwegian Forest Cat)
7. ペルシャ (Persian)
8. ロシアンブルー (Russian Blue)
9. シャム/サイアミーズ (Siamese)
10. ベンガル (Bengal)
11. アビシニアン (Abyssinian)
12. マンチカン (Munchkin)
13. スフィンクス (Sphynx)
14. ターキッシュアンゴラ (Turkish Angora)
15. エキゾチックショートヘア (Exotic Shorthair)
16. ソマリ (Somali)
17. トンキニーズ (Tonkinese)
18. バーミーズ (Burmese)
19. シンガプーラ (Singapura)
20. 雑種/日本猫 (Mixed Breed / Japanese Cat)
```

### データフォーマット (breeds.json)

```json
{
  "breeds": [
    {
      "id": "scottish_fold",
      "name_ja": "スコティッシュフォールド",
      "name_en": "Scottish Fold",
      "size": "medium",
      "characteristics": [
        "折れ耳",
        "丸い顔",
        "短毛または長毛",
        "中型",
        "がっしりした体型"
      ],
      "temperament": [
        "穏やか",
        "人懐っこい",
        "おとなしい",
        "甘えん坊",
        "適応力が高い"
      ],
      "distinguishing_features": [
        "特徴的な折れた耳（最大の識別ポイント）",
        "丸い頭と大きな目",
        "丸みを帯びた体型"
      ],
      "similar_breeds": ["british_shorthair"],
      "difficulty": 1,
      "origin": "スコットランド",
      "description": "折れ耳が特徴的な中型猫。穏やかで人懐っこい性格で、家族と過ごすことを好む。",
      "care_notes": "耳の掃除が重要。遺伝性の骨疾患に注意が必要。"
    }
  ]
}
```

---

## 🏗️ 技術スタック

### フロントエンド
```
- React Native 0.81 (Expo SDK 54)
- TypeScript (strict mode)
- Expo Router v6 (file-based routing, typed routes)
- React Navigation v7 (Expo Router内部で使用)
- expo-image-picker (カメラ撮影 & ギャラリー選択)
- expo-file-system (Base64変換・画像保存)
- expo-image-manipulator (画像リサイズ)
- react-native-reanimated v4 (アニメーション)
- React 19 (React Compiler有効)
```

### AI & API
```
- Gemini API (Google AI) ※無料枠
  - Model: gemini-2.5-flash
  - 用途: 品種識別
  - 構造化出力にはresponseSchema (response_mime_type: "application/json") を使用
  - 無料枠: input/outputトークン無料（データはGoogleの製品改善に使用される）
```

### ストレージ
```
- @react-native-async-storage/async-storage
  - ローカルストレージのみ
  - キーバリュー形式 (文字列のみ、JSON.stringify/parseで変換)
  - 画像はexpo-file-systemでローカルファイルシステムに保存し、パスを保存
```

### 状態管理
```
- React Context API (シンプルなため)
- または zustand (必要に応じて)
```

---

## 📂 プロジェクト構造

Expo Router (file-based routing) を使用。画面はapp/ディレクトリ配下にファイルを置くことでルートが自動生成される。

```
ios-app/nekolex/              # Expoプロジェクトルート
├── app.json                  # Expo設定
├── package.json
├── tsconfig.json
├── assets/
│   ├── images/               # アプリアイコン・スプラッシュ
│   └── breeds/               # 品種デフォルト画像
│       ├── scottish_fold.jpg
│       └── ...
├── app/                      # Expo Router: 画面定義 (file-based routing)
│   ├── _layout.tsx           # ルートレイアウト (Stack)
│   ├── modal.tsx             # モーダル画面
│   ├── (tabs)/               # タブナビゲーション
│   │   ├── _layout.tsx       # タブレイアウト
│   │   ├── index.tsx         # ホーム画面
│   │   ├── pokedex.tsx       # 図鑑一覧
│   │   ├── quiz.tsx          # 復習クイズ
│   │   └── profile.tsx       # プロフィール
│   ├── camera.tsx            # カメラ/識別画面
│   ├── breed/[id].tsx        # 品種詳細 (動的ルート)
│   └── quiz-result.tsx       # クイズ結果
├── components/               # 共通コンポーネント (kebab-case)
│   ├── breed-card.tsx
│   ├── progress-bar.tsx
│   ├── quiz-question.tsx
│   └── ui/                   # 汎用UIコンポーネント
├── services/
│   ├── gemini-api.ts         # Gemini API連携（品種識別）
│   ├── storage.ts            # ストレージ管理
│   └── image-processor.ts    # 画像処理
├── data/
│   └── breeds.json           # 品種マスターデータ
├── types/
│   └── index.ts              # TypeScript型定義
├── utils/
│   ├── quiz-generator.ts     # クイズ生成ロジック
│   └── xp-calculator.ts      # XP計算
├── constants/
│   └── theme.ts              # カラー・フォント定義 (既存)
├── contexts/
│   └── user-context.tsx      # ユーザー状態管理
└── hooks/                    # カスタムフック (既存)
```

---

## 🎨 UI/UX 設計

### デザインコンセプト
**ポケモン図鑑風のゲームライクなUI**

### カラーパレット
```typescript
const colors = {
  primary: '#FF6B6B',      // コーラルレッド (メイン)
  secondary: '#4ECDC4',    // ターコイズ (アクセント)
  accent: '#FFE66D',       // イエロー (強調)
  background: '#F7F7F7',   // ライトグレー (背景)
  surface: '#FFFFFF',      // ホワイト (カード背景)
  text: '#2C3E50',         // ダークグレー (テキスト)
  textLight: '#95A5A6',    // グレー (サブテキスト)
  success: '#2ECC71',      // グリーン (正解)
  error: '#E74C3C',        // レッド (不正解)
  warning: '#F39C12',      // オレンジ (注意)
};
```

### タイポグラフィ
```typescript
const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textLight
  },
  button: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.surface
  }
};
```

### 主要画面のワイヤーフレーム

#### ホーム画面
```
┌─────────────────────────────┐
│  NekoLex        [プロフィール] │
│                             │
│  ┌─────────────────────┐   │
│  │   🐱              │   │
│  │   ようこそ！        │   │
│  │   Lv.5 (450/500XP) │   │
│  └─────────────────────┘   │
│                             │
│  ┌───────────┐ ┌─────────┐ │
│  │ 📸       │ │ 📚     │ │
│  │ 写真撮影 │ │ 図鑑   │ │
│  └───────────┘ └─────────┘ │
│                             │
│  ┌───────────────────────┐ │
│  │ 🎯 今日の復習 (5問)   │ │
│  │ [開始]              │ │
│  └───────────────────────┘ │
│                             │
│  📊 進捗: 12/20品種発見    │
└─────────────────────────────┘
```

#### 図鑑画面
```
┌─────────────────────────────┐
│  < 図鑑          [検索] [絞込] │
│                             │
│  ████████░░░░░░ 12/20       │
│                             │
│  ┌─────┬─────┬─────┬─────┐ │
│  │🐱  │🐱  │🐱  │？  │ │
│  │ス  │ア  │メ  │    │ │
│  │コ  │メ  │イ  │    │ │
│  └─────┴─────┴─────┴─────┘ │
│  ┌─────┬─────┬─────┬─────┐ │
│  │？  │？  │？  │？  │ │
│  │    │    │    │    │ │
│  │    │    │    │    │ │
│  └─────┴─────┴─────┴─────┘ │
│                             │
└─────────────────────────────┘
```

#### クイズ画面
```
┌─────────────────────────────┐
│  復習クイズ      問題 2/5   │
│  ⭐⭐⭐                     │
│                             │
│  ┌─────────────────────┐   │
│  │                     │   │
│  │   [猫の写真]        │   │
│  │                     │   │
│  └─────────────────────┘   │
│                             │
│  この品種は？               │
│                             │
│  ○ メインクーン             │
│  ○ ノルウェージャン         │
│  ○ ラグドール               │
│  ○ サイベリアン             │
│                             │
│        [回答する]           │
└─────────────────────────────┘
```

### アニメーション
```
- 品種発見時: カードフリップ + キラキラエフェクト
- レベルアップ: 画面全体に光のエフェクト + 効果音
- 正解時: 緑のチェックマーク + バウンス
- 不正解時: 赤の×マーク + シェイク
- 画面遷移: スライドイン/アウト
```

---

## 🔧 実装優先度と開発スケジュール

### Week 1: コア機能実装

**Day 1-2: プロジェクトセットアップ**
- [x] Expoプロジェクト初期化 (Expo SDK 54, Expo Router済み)
- [x] TypeScript設定 (strict mode済み)
- [ ] 既存テンプレートのクリーンアップ (不要な画面・コンポーネント削除)
- [ ] タブ構成の変更 (ホーム/図鑑/クイズ/プロフィール)
- [ ] 追加パッケージのインストール (async-storage, image-picker, file-system, image-manipulator)
- [ ] breeds.json作成 (20品種)
- [ ] カラーテーマ定義 (既存theme.tsを拡張)

**Day 3-4: カメラ & 識別機能**
- [ ] camera.tsx (撮影/ギャラリー選択画面) の実装
- [ ] expo-image-pickerの統合 (カメラ & ギャラリー)
- [ ] Gemini API連携サービス作成 (responseSchemaで構造化出力)
- [ ] 画像リサイズ → Base64変換処理
- [ ] 識別結果表示UI
- [ ] ローディング・エラー状態管理

**Day 5-6: 図鑑システム**
- [ ] pokedex.tsx (図鑑一覧タブ) 実装
- [ ] breed-card コンポーネント作成
- [ ] 発見済み/未発見の表示切り替え
- [ ] breed/[id].tsx (品種詳細・動的ルート) 実装
- [ ] AsyncStorageによるデータ永続化
- [ ] 進捗計算ロジック

**Day 7: 基本クイズ機能**
- [ ] QuizScreen実装
- [ ] クイズ生成ロジック
- [ ] 4択問題UI
- [ ] 正解/不正解判定
- [ ] スコア表示

### Week 2: UI/UX改善 & 仕上げ

**Day 8-9: ゲーム風UI実装**
- [ ] カードデザイン改善
- [ ] 発見時のアニメーション
- [ ] レベル/XPシステムの実装
- [ ] ProfileScreen作成
- [ ] プログレスバーの実装

**Day 10-11: 復習機能強化**
- [ ] 難易度選択画面
- [ ] 問題タイプの追加 (特徴から選ぶ、違いを選ぶ)
- [ ] 間隔反復アルゴリズムの実装
- [ ] 復習スケジュール管理
- [ ] クイズ結果画面の改善

**Day 12-13: データ & 画像整備**
- [ ] 残り品種データの作成
- [ ] 品種画像の収集・最適化
- [ ] 説明文の充実
- [ ] 見分けポイントの詳細化

**Day 14: 最終調整**
- [ ] バグ修正
- [ ] パフォーマンス最適化
- [ ] 実機テスト (iOS & Android)
- [ ] アイコン・スプラッシュ画面の作成
- [ ] App Store / Google Play用スクリーンショット

---

## 📊 データフロー

### 1. 品種識別フロー

```
[ユーザー] 写真撮影/選択
    ↓
[App] 画像をBase64にエンコード
    ↓
[Gemini API] リクエスト送信
    POST /v1beta/models/gemini-2.5-flash:generateContent
    {
      contents: [{
        parts: [
          { inline_data: { mime_type: "image/jpeg", data: "..." } },
          { text: "この猫の品種を特定してください" }
        ]
      }],
      generationConfig: {
        response_mime_type: "application/json",
        response_schema: { ... }
      }
    }
    ↓
[Gemini API] レスポンス (responseSchemaで構造化JSON出力)
    {
      breed_id: "scottish_fold",
      confidence: 0.94,
      characteristics: ["折れ耳", "丸顔"]
    }
    ↓
[App] breeds.jsonから詳細情報を取得
    ↓
[App] 結果をストレージに保存
    await AsyncStorage.setItem('breeds-discovered', JSON.stringify(...))
    ↓
[App] 図鑑に追加 & XP付与
    ↓
[UI] 結果表示 + アニメーション
```

### 2. ストレージ構造

```typescript
// キー: 'user-profile'
{
  level: 5,
  xp: 450,
  discovered_count: 12,
  total_quiz_taken: 15,
  total_correct_answers: 52
}

// キー: 'breeds-discovered'
{
  "scottish_fold": {
    discovered_at: "2026-02-16T10:30:00Z",
    user_photo_url: "file:///...",
    times_reviewed: 3,
    correct_answers: 2,
    mastery_level: 2
  },
  "american_shorthair": { ... }
}

// キー: 'quiz-history'
[
  {
    date: "2026-02-16T15:00:00Z",
    difficulty: "medium",
    questions: 5,
    correct: 4,
    xp_gained: 20
  }
]

// キー: 'settings'
{
  difficulty: "medium",
  sound_enabled: true,
  haptic_enabled: true
}
```

### 3. クイズ生成ロジック

```typescript
function generateQuiz(
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 5
): Question[] {
  const discovered = getDiscoveredBreeds();
  
  if (discovered.length < 4) {
    throw new Error('最低4品種発見する必要があります');
  }
  
  const questions: Question[] = [];
  
  for (let i = 0; i < count; i++) {
    // 正解の品種をランダム選択
    const correctBreed = randomChoice(discovered);
    
    // 難易度に応じて選択肢を生成
    const options = generateOptions(correctBreed, difficulty);
    
    questions.push({
      type: 'multiple_choice',
      correct_breed: correctBreed,
      options: shuffle(options),
      breed_id: correctBreed.id
    });
  }
  
  return questions;
}

function generateOptions(
  correctBreed: Breed,
  difficulty: 'easy' | 'medium' | 'hard'
): Breed[] {
  let pool: Breed[];
  
  switch (difficulty) {
    case 'easy':
      // 全く異なる品種から選択
      pool = getAllBreeds().filter(b => 
        b.size !== correctBreed.size ||
        b.difficulty !== correctBreed.difficulty
      );
      break;
      
    case 'medium':
      // 似た特徴を持つ品種を混ぜる
      pool = getAllBreeds().filter(b =>
        b.size === correctBreed.size
      );
      break;
      
    case 'hard':
      // similar_breedsを優先的に選択
      pool = correctBreed.similar_breeds
        .map(id => getBreedById(id))
        .concat(getAllBreeds());
      break;
  }
  
  return [correctBreed, ...randomSample(pool, 3)];
}
```

---

## ✅ 完成の定義 (MVP)

以下の条件をすべて満たした時点でMVP完成とする:

### 機能要件
- [ ] カメラまたはギャラリーから写真を選択できる
- [ ] Gemini APIで猫の品種を識別できる
- [ ] 識別結果が正しく表示される
- [ ] 図鑑に20品種以上のデータが存在する
- [ ] 発見済み/未発見が明確に区別される
- [ ] 品種詳細画面で特徴・性格が表示される
- [ ] 3-5問のクイズが正常に動作する
- [ ] 難易度選択ができる (初級/中級/上級)
- [ ] 正解/不正解が正しく判定される
- [ ] XP・レベルシステムが動作する
- [ ] 進捗がローカルストレージに保存される

### 技術要件
- [ ] iOS実機で動作する
- [ ] Android実機で動作する
- [ ] アプリがクラッシュせずに安定動作する
- [ ] 画像識別が10秒以内に完了する
- [ ] オフラインでも図鑑閲覧・復習ができる

### UI/UX要件
- [ ] ポケモン図鑑風のデザインになっている
- [ ] カードUIが実装されている
- [ ] 発見時のアニメーションがある
- [ ] 正解/不正解のフィードバックが明確
- [ ] 直感的に操作できる

---

## 🚀 将来の拡張機能 (Post-MVP)

### Phase 2: 学習機能の強化
- 間隔反復学習の完全実装
- 弱点分析 (よく間違える品種の提示)
- カスタム復習リスト
- フラッシュカードモード

### Phase 3: ゲーム要素の追加
- バッジ・トロフィーシステム
- デイリーチャレンジ
- 週間ランキング (ローカル)
- ストリーク機能 (連続日数)

### Phase 4: コンテンツ拡充
- 犬の品種追加 (DogLex)
- 品種数を50 → 100に拡大
- 品種の歴史・起源の詳細説明
- 飼育アドバイス機能

### Phase 5: ソーシャル機能
- 発見した猫の写真をシェア
- フレンド機能
- グローバルランキング
- コミュニティ投稿

### Phase 6: 収益化 (検討中)
- プレミアム版
  - 広告なし
  - 全品種アンロック
  - 詳細統計
  - オフライン完全対応
- 寄付機能 (動物保護団体への寄付)

---

## 📝 技術的な注意事項

### Gemini API使用時の注意
```typescript
// 料金: 無料枠 (Gemini 2.5 Flash)
// 無料枠ではデータがGoogleの製品改善に使用される
// 画像はトークン消費が大きいため、リサイズで節約する
// → 同一画像の再送信を避けるローカルキャッシュを検討

// エラーハンドリング必須
try {
  const result = await identifyBreed(imageBase64);
} catch (error) {
  if (error instanceof IdentificationError) {
    switch (error.code) {
      case 'RATE_LIMIT':
        showError('リクエスト上限に達しました。しばらく待ってから再試行してください');
        break;
      case 'BAD_REQUEST':
        showError('画像を認識できませんでした。別の写真を試してください');
        break;
      default:
        showError('識別に失敗しました。再試行してください');
    }
  }
}
```

### ストレージの制限
```typescript
// AsyncStorageの制限
// - Android: デフォルト最大6MB (全体)
// - iOS: 制限なし (実質的にはディスク容量に依存)
// - 文字列のみ保存可能 (JSON.stringify/parseが必要)
// - 画像は直接保存せず、ファイルシステムに保存してパスを保存

// 画像保存例
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const savedUri = `${FileSystem.documentDirectory}breeds/${breedId}_${Date.now()}.jpg`;
await FileSystem.moveAsync({ from: imageUri, to: savedUri });

const discovered = JSON.parse(await AsyncStorage.getItem('breeds-discovered') || '{}');
discovered[breedId] = { ...discovered[breedId], user_photo_url: savedUri };
await AsyncStorage.setItem('breeds-discovered', JSON.stringify(discovered));
```

### パフォーマンス最適化
```typescript
// 画像のリサイズ (識別前)
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const resized = await manipulateAsync(
  imageUri,
  [{ resize: { width: 800 } }], // 幅800pxにリサイズ
  { compress: 0.8, format: SaveFormat.JPEG }
);
```

---

## 🔐 セキュリティ & プライバシー

### データの取り扱い
- ユーザーの写真はローカルデバイスにのみ保存
- クラウド同期なし (MVP)
- Gemini APIには識別時のみ画像を送信（無料枠ではデータがGoogleの製品改善に使用される）
- 個人を特定できる情報は収集しない

### API キーの管理

**重要**: Gemini APIキーをクライアントアプリに直接埋め込んではならない。
ビルドされたアプリからキーを抽出される危険がある。

**推奨アーキテクチャ**: 簡易バックエンドプロキシを経由してGemini APIを呼び出す。
```
[アプリ] → [バックエンドプロキシ (Cloudflare Workers等)] → [Gemini API]
```

**MVP簡易対応**: 開発中はExpo環境変数 (.env.local) を使用し、
リリース前にバックエンドプロキシに移行する。
```typescript
// .env.local (gitignoreに追加)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

// 開発中のみ直接使用 (リリース前にプロキシに移行)
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
```

---

## 📄 ライセンス & 著作権

### アプリ
- MIT License (オープンソース化する場合)

### 品種画像
- パブリックドメインまたはCC0ライセンスの画像を使用
- 出典を明記

### 品種データ
- 公開情報をもとに独自に編集
- 各品種協会の情報を参照

---

## 📞 サポート & フィードバック

### MVP完成後の改善プロセス
1. 実際に使ってみる (自分で1週間使用)
2. 友人・家族にテストしてもらう
3. フィードバックを収集
4. 優先度の高い改善から実装

### 問題が発生した場合
- GitHub Issuesで管理 (プロジェクトをGitHub公開する場合)
- バグレポート用のフォーム作成

---

## 🎓 学習目標 (このプロジェクトを通じて)

1. **React Native / Expo**
   - モバイルアプリの基本構造
   - ナビゲーション
   - カメラ・画像処理

2. **TypeScript**
   - 型定義の実践
   - インターフェース設計

3. **AI統合**
   - Gemini APIの使い方
   - 画像認識の実装

4. **状態管理**
   - ローカルストレージ
   - アプリ内状態管理

5. **UI/UX**
   - ゲームライクなデザイン
   - アニメーション実装

6. **アルゴリズム**
   - クイズ生成ロジック
   - 間隔反復学習

---

## 📚 参考リソース

### 公式ドキュメント
- Expo: https://docs.expo.dev/
- React Navigation: https://reactnavigation.org/
- Gemini API: https://ai.google.dev/gemini-api/docs

### 参考アプリ
- Pokémon GO (図鑑UI)
- Duolingo (学習システム)
- Anki (間隔反復学習)

---

**作成日**: 2026年2月16日  
**最終更新**: 2026年2月16日  
**バージョン**: 1.0 (MVP要件定義)