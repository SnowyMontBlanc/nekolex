# 022 ダークモード UI修正 — プロフィール画面 (profile.tsx)

## 概要

ダークモード実装時に残った `profile.tsx` のハードコードカラー修正。

## 依存チケット

- `018` Gemini API移行 (完了済み — ダークテーマ定義済み)
- `014` プロフィール画面 (完了済み)

## 修正箇所

### profile.tsx

| スタイル | 問題 | 修正方針 |
|---------|------|---------|
| `settingDivider` `backgroundColor` | `#F4F4F5` (ライトグレー区切り線) — ダーク背景で白っぽく浮く | `NekoLexColors.border` (透明白) or `NekoLexColors.surfaceAlt` |
| `achievementLocked` `backgroundColor` | `#D4D4D8` などライト系 | `NekoLexColors.surfaceAlt` |
| `achievementLocked` テキスト色 | ライト系グレー | `NekoLexColors.textLight` |
| レベルカード関連 | ダーク背景での視認性不足の箇所 | テーマトークンに置換 |
| その他ライト系ハードコードカラー | 各所 | テーマトークンに置換 |

## Todo

- [x] ファイルを読み込み、ハードコードカラー (`#F4F4F5`, `#D4D4D8`, `#E4E4E7` 等) を全て洗い出す
- [x] `settingDivider` をダーク対応に更新 (`NekoLexColors.border` 使用済み)
- [x] `achievementLocked` をダーク対応に更新 (`NekoLexColors.surfaceAlt` / `NekoLexColors.border` 使用済み)
- [x] レベルカード関連のダーク対応漏れを修正 (feature カード上の rgba(0,0,0,...) は意図的・適切)
- [x] その他ライト系カラーをテーマトークンに置換 (ハードコードなし確認)

## 変更ファイル

- `ios-app/nekolex/app/(tabs)/profile.tsx`

## 完了条件

- [x] 全 Todo が完了
- [x] 区切り線がダーク背景で適切な濃さで見える
- [x] 未解除アチーブメントがダーク背景でロック状態として視認できる
- [x] プロフィール全体でダーク背景に浮いた白い要素がない
- [x] TypeScript エラーなし
