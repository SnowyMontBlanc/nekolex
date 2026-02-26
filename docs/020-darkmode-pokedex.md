# 020 ダークモード UI修正 — 図鑑系 (pokedex.tsx + breed-card.tsx)

## 概要

ダークモード実装時に残った図鑑系ファイルのハードコードカラー修正。

## 依存チケット

- `018` Gemini API移行 (完了済み — ダークテーマ定義済み)
- `009` 図鑑一覧画面 (完了済み)

## 修正箇所

### pokedex.tsx

| スタイル | 問題 | 修正方針 |
|---------|------|---------|
| `filterPill` `borderColor`/`shadowColor` | `#D4D4D8` (ライトグレー) — ダーク背景で白っぽく浮く | `NekoLexColors.border` |
| `filterPill` `backgroundColor` (inactive) | `#F4F4F5` などライト系 | `NekoLexColors.surfaceAlt` |
| `emptyIconWrap` `backgroundColor` | `#F4F4F5` | `NekoLexColors.surfaceAlt` |
| その他ハードコード `#` 値 | ライト系カラー全般 | テーマトークンに置換 |

### breed-card.tsx

| スタイル | 問題 | 修正方針 |
|---------|------|---------|
| `undiscoveredCard` `backgroundColor` | `#F4F4F5` (ライトグレー) — ダーク背景に合わない | `NekoLexColors.surfaceAlt` |
| シルエット用 `tintColor` / テキスト色 | `#D4D4D8`, `#A1A1AA` | `NekoLexColors.textLight` / `NekoLexColors.border` |
| `undiscoveredCard` `borderColor` | ライト系 | `NekoLexColors.border` |

## Todo

### pokedex.tsx
- [x] ファイルを読み込み、ハードコードカラー (`#F4F4F5`, `#D4D4D8`, `#E4E4E7` 等) を全て洗い出す
- [x] `filterPill` 系スタイルをダーク対応に更新 (`NekoLexColors.surfaceAlt` / `NekoLexColors.border` 使用済み)
- [x] `emptyIconWrap` 背景色をダーク対応に更新 (`NekoLexColors.surfaceAlt` 使用済み)
- [x] その他ライト系ハードコードカラーをテーマトークンに置換 (ハードコードなし確認)

### breed-card.tsx
- [x] ファイルを読み込み、ハードコードカラーを全て洗い出す
- [x] `undiscoveredCard` の背景色・ボーダー色をダーク対応に更新 (`NekoLexColors.surfaceAlt` / `NekoLexColors.border` 使用済み)
- [x] シルエット表示用の色をダーク対応に更新 (`NekoLexColors.textLight` 使用済み)

## 変更ファイル

- `ios-app/nekolex/app/(tabs)/pokedex.tsx`
- `ios-app/nekolex/components/breed-card.tsx`

## 完了条件

- [x] 全 Todo が完了
- [x] 図鑑一覧画面でダーク背景に浮いた白っぽい要素がない
- [x] 未発見カードがダーク背景でもシルエットとして認識できる
- [x] フィルタピルが自然に表示される
- [x] TypeScript エラーなし
