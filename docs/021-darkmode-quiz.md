# 021 ダークモード UI修正 — クイズ系 (quiz.tsx + quiz-question.tsx + quiz-result.tsx)

## 概要

ダークモード実装時に残ったクイズ系ファイルのハードコードカラー修正。

## 依存チケット

- `018` Gemini API移行 (完了済み — ダークテーマ定義済み)
- `012` クイズ画面実装 (完了済み)
- `013` クイズ結果画面 (完了済み)

## 修正箇所

### quiz.tsx

| スタイル | 問題 | 修正方針 |
|---------|------|---------|
| `backBtn` `backgroundColor` | `#F4F4F5` (ライトグレー) | `NekoLexColors.surfaceAlt` |
| `stepDot` (inactive) `backgroundColor` | `#E4E4E7` / `#D4D4D8` | `NekoLexColors.border` |
| その他ライト系ハードコードカラー | 各所 | テーマトークンに置換 |

### quiz-question.tsx

| スタイル | 問題 | 修正方針 |
|---------|------|---------|
| `optionDefault` `borderColor` / `shadowColor` | `#D4D4D8` | `NekoLexColors.border` |
| `optionLabelDefault` `backgroundColor` | `#F4F4F5` | `NekoLexColors.surfaceAlt` |
| その他ライト系ハードコードカラー | 各所 | テーマトークンに置換 |

### quiz-result.tsx

| スタイル | 問題 | 修正方針 |
|---------|------|---------|
| `scoreBarTrack` `backgroundColor` | `rgba(0,0,0,0.1)` — ダーク背景でほぼ不可視 | `rgba(255,255,255,0.08)` |
| `scoreBarTrack` `borderColor` | `rgba(0,0,0,0.2)` | `rgba(255,255,255,0.12)` |
| `correctText` color | `'#14532D'` (ダーク緑 — ダーク背景では読みにくい) | `NekoLexColors.success` |
| `wrongText` color | `'#7F1D1D'` (ダーク赤 — 同上) | `NekoLexColors.error` |
| その他ライト系ハードコードカラー | 各所 | テーマトークンに置換 |

## Todo

### quiz.tsx
- [x] ファイルを読み込み、ハードコードカラーを全て洗い出す
- [x] `backBtn` 背景色をダーク対応に更新 (`NekoLexColors.surfaceAlt` 使用済み)
- [x] `stepDot` (inactive) 色をダーク対応に更新 (`NekoLexColors.border` 使用済み)
- [x] その他ライト系カラーをテーマトークンに置換 (ハードコードなし確認)

### quiz-question.tsx
- [x] ファイルを読み込み、ハードコードカラーを全て洗い出す
- [x] `optionDefault` ボーダー・シャドウ色をダーク対応に更新 (`#D4D4D8` → `NekoLexColors.border`)
- [x] `optionLabelDefault` 背景色をダーク対応に更新 (`#F4F4F5` → `NekoLexColors.surfaceAlt`)
- [x] その他ライト系カラーをテーマトークンに置換 (`#14532D`/`#7F1D1D` → `NekoLexColors.success`/`NekoLexColors.error`)

### quiz-result.tsx
- [x] `scoreBarTrack` 背景色・ボーダー色をダーク対応に更新 (`rgba(0,0,0,...)` → `rgba(255,255,255,...)`)
- [x] `correctText` / `wrongText` 色をダーク対応に更新 (`#14532D`/`#7F1D1D` → `NekoLexColors.success`/`NekoLexColors.error`)
- [x] その他ライト系カラーをテーマトークンに置換 (`#FEF3C7`/`#CCFBF1` → warningLight/progressLight、`#B45309` → `NekoLexColors.reward`)

## 変更ファイル

- `ios-app/nekolex/app/(tabs)/quiz.tsx`
- `ios-app/nekolex/components/quiz-question.tsx`
- `ios-app/nekolex/app/quiz-result.tsx`

## 完了条件

- [x] 全 Todo が完了
- [x] 戻るボタンがダーク背景で視認できる
- [x] ステップドットが明確に表示される
- [x] クイズ選択肢がダーク背景で自然に表示される
- [x] クイズ結果の正解スコアバーが見える
- [x] 正解・不正解テキストがダーク背景で読める
- [x] TypeScript エラーなし
