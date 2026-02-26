# 024 タイポグラフィシステム定義

## 概要

`constants/theme.ts` に `Typography` トークンを追加し、アプリ全体のフォントサイズを統一スケールで管理できるようにする。

## 依存チケット

- `023` テーマカラー刷新 (完了済み — theme.ts の基盤が整っている)

## 背景

現状、`fontSize` が 9〜140px まで約 20 種類以上バラバラに定義されている。
特に 9/10/11px の極小テキストが複数箇所に存在しており、実機で読みにくい。

## 設計方針

### Typography トークン

```typescript
export const Typography = {
  micro:      { fontSize: 12, lineHeight: 16 }, // 最小キャプション（日付・サブラベル）
  caption:    { fontSize: 13, lineHeight: 18 }, // セカンダリテキスト・フィルター
  body:       { fontSize: 15, lineHeight: 22 }, // 本文・設定項目・説明文
  bodyLg:     { fontSize: 17, lineHeight: 24 }, // 強調本文・ボタンラベル
  subheading: { fontSize: 20, lineHeight: 28 }, // セクション見出し・難易度ラベル
  heading:    { fontSize: 24, lineHeight: 32 }, // 画面タイトル
  display:    { fontSize: 32, lineHeight: 40 }, // 大数値（XP・カウント）
  jumbo:      { fontSize: 44, lineHeight: 52 }, // 特大スコア表示
} as const;
```

### ルール

- **最小 fontSize は `micro` の 12px**。9/10/11px は廃止。
- `fontWeight` はトークンに含めない（用途によって '600'〜'900' が変わるため）。
- `lineHeight` は `fontSize × 1.3〜1.4` を目安。
- 装飾的な超大サイズ（80px アイコン代替・140px ロゴ装飾）はトークン外として許容。

### スケール対応表

| トークン | fontSize | 主な用途 |
|---|---|---|
| `micro` | 12 | 日付、サブラベル、バッジ文字 |
| `caption` | 13 | フィルター、メタ情報、説明補足 |
| `body` | 15 | 本文、設定ラベル、説明文 |
| `bodyLg` | 17 | 強調本文、ボタンラベル、タイトル補足 |
| `subheading` | 20 | セクション見出し、難易度名、カード見出し |
| `heading` | 24 | 画面タイトル |
| `display` | 32 | XP・カウント・大きな数値 |
| `jumbo` | 44 | クイズ結果の特大スコア |

## 実装内容

- [x] `constants/theme.ts` に `Typography` オブジェクトを追加

## 関連チケット

- `025` タイポグラフィ全ファイル適用 — 全画面・コンポーネントを本スケールに置き換える
