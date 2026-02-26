# 025 タイポグラフィ全ファイル適用

## 概要

`024` で定義した `Typography` トークンを全画面・コンポーネントに適用し、
ハードコードされた fontSize（特に 9/10/11px）を廃止する。

## 依存チケット

- `024` タイポグラフィシステム定義 (完了後に着手)

## 対象ファイル & 主な修正点

| ファイル | 問題のあるサイズ | 対応するトークン |
|---|---|---|
| `components/breed-card.tsx` | 9px (recentDate), 11px (labels) | `micro` (12) |
| `app/(tabs)/_layout.tsx` | 10px (tab label) | `micro` (12) |
| `app/(tabs)/index.tsx` | 9px, 10px, 11px | `micro` (12) |
| `components/quiz-question.tsx` | 10px (questionNum) | `micro` (12) |
| `app/(tabs)/profile.tsx` | 10px (xpLabel) | `micro` (12) |
| `app/quiz-result.tsx` | 12px (各 label) | `micro` (12) |
| その他 | 各サイズをトークンに置換 | 対応トークン参照 |

## 方針

- `fontSize` の直接指定を `Typography.xxx.fontSize` に置換
- `lineHeight` も合わせて `Typography.xxx.lineHeight` を適用
- 9/10/11px はすべて `Typography.micro.fontSize` (12) に引き上げ
- 装飾的な超大サイズ (80px・140px) はそのまま維持

## Todo

- [x] `components/breed-card.tsx` の fontSize をトークンに置換
- [x] `components/quiz-question.tsx` の fontSize をトークンに置換
- [x] `components/progress-bar.tsx` の fontSize をトークンに置換
- [x] `components/animations.tsx` の fontSize をトークンに置換
- [x] `app/(tabs)/_layout.tsx` の fontSize をトークンに置換
- [x] `app/(tabs)/index.tsx` の fontSize をトークンに置換
- [x] `app/(tabs)/pokedex.tsx` の fontSize をトークンに置換
- [x] `app/(tabs)/quiz.tsx` の fontSize をトークンに置換
- [x] `app/(tabs)/profile.tsx` の fontSize をトークンに置換
- [x] `app/quiz-result.tsx` の fontSize をトークンに置換
- [x] `app/breed/[id].tsx` の fontSize をトークンに置換
- [ ] 実機で全画面の文字サイズを目視確認
