# 023 テーマカラー刷新

## 概要

`constants/theme.ts` のカラーパレットをより洗練されたものに見直す。
コンセプトは担当エージェントに委ねる。

## 依存チケット

- `018` Gemini API移行 (完了済み — 現在のダークテーマはここで定義)
- `019`〜`022` のダークモード修正チケット (このチケットと**並行可能**。
  ただし後から色値の微調整が必要になる場合がある)

## 背景

現在のカラーパレット (ダークナイトアーケード):
```typescript
brand:    '#FF3A5C'  // ネオンレッド
progress: '#00CFAA'  // ティールネオン
reward:   '#FFD60A'  // イエローネオン
feature:  '#A78BFA'  // パープルネオン
game:     '#FB923C'  // オレンジネオン
background: '#12121E'
surface:    '#1C1C2E'
```

## 設計方針

担当エージェントが以下の観点でコンセプトを決定・実装すること:

### 守るべき制約
- **ダークテーマを維持**: `background` は深色系、`surface` は `background` より若干明るい
- **ロールベース構造を維持**: `brand` / `progress` / `reward` / `feature` / `game` の5役割は変えない
- **コントラスト比 AA 以上**: テキスト・アイコンが背景に対して読める
- **既存トークン名を変えない**: 他ファイルが名前参照しているため名前変更不可

### 変更可能な範囲
- 全カラー値 (`brand`, `progress`, `reward`, `feature`, `game`, `background`, `surface` 等)
- `neonGlow` のデフォルト `shadowOpacity` / `shadowRadius`
- `DifficultyColors` の値
- `GameCard` / `GameButton` のシャドウ・ボーダー値

### 推薦コンセプト候補 (どれか1つまたはミックス)

1. **Cyberpunk Neon** — 青みがかった深夜: `#0D0D1A` 背景、`#00D9FF` (cyan) + `#FF006E` (magenta) の強烈コントラスト
2. **Synthwave Dusk** — 紫がかった夕暮れ: `#1A0B2E` 背景、グラデーション的なパープル〜ピンク〜シアン
3. **Dark Emerald** — 深緑ベース: `#0A1628` 背景、`#00FF88` (emerald) + `#FF4567` (coral)
4. **Midnight Gold** — 極限まで抑えた黒に金: `#0C0C0F` 背景、`#FFD700` + `#E040FB` のジュエリー感

## Todo

- [x] コンセプトを1つ選定し、カラーパレット案を作成する (Synthwave Dusk 採用)
- [x] カラーパレットのコントラスト比を確認 (text: #F0E8FF on background: #0D0717 — AA 以上)
- [x] `theme.ts` の色値を更新 (brand/progress/reward/feature/game + surface/background 全更新)
- [x] `DifficultyColors` を新パレットに合わせて更新 (teal/amber/rose)
- [x] `neonGlow` のデフォルト値を新パレットに合わせて調整 (opacity: 0.55, radius: 16)
- [x] `GameCard` / `GameButton` のシャドウ値を新パレットに合わせて調整 (violet ambient shadow)
- [x] `screen-background.tsx` の装飾要素の色が新パレットと調和しているか確認・調整 (全テーマトークン使用済み)

## 変更ファイル

- `ios-app/nekolex/constants/theme.ts`
- 必要に応じて `ios-app/nekolex/components/screen-background.tsx`

## 完了条件

- [x] 全 Todo が完了
- [x] コンセプトが明確で統一感がある (Synthwave Dusk — 温かみのある紫の夕暮れ)
- [x] 全テキストが背景に対して読める (コントラスト比 AA 以上)
- [x] ダークテーマが維持されている (background: #0D0717, surface: #180D2A)
- [x] TypeScript エラーなし
- [x] 変更内容の簡単な説明コメントを `theme.ts` 冒頭に記載済み
