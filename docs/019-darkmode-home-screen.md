# 019 ダークモード UI修正 — ホーム画面 (index.tsx)

## 概要

ダークモード実装時に残った `index.tsx` のハードコードカラー修正と、
カードシャドウのネオングロウスタイルへの更新。

## 依存チケット

- `018` Gemini API移行 (完了済み — ダークテーマ `theme.ts` はここで定義)
- `015` ホーム画面実装 (完了済み)

## 背景

`theme.ts` はダークナイトアーケードテーマに刷新済み。
ただし `index.tsx` 内に以下の問題が残っている：

1. **`levelBadgeText`** — `color: NekoLexColors.border` を使用。
   `border` は `rgba(255,255,255,0.12)` に変更されたため、
   黄色バッジ上の文字が透明に近くなり視認不可。
2. **`actionCard` シャドウ** — `S.cardShadow (= 0)` & `NekoLexColors.border` を使用した
   ハードオフセットシャドウ。カードが色付き背景なのにネオングロウが効いていない。
3. **`quizCard` シャドウ** — 同上。
4. **`progressCard` シャドウ** — ダーク環境でシャドウが見えない。
5. **`recentCard` シャドウ** — 同上。

## Todo

- [x] `levelBadge` の star アイコン色: `NekoLexColors.border` → `NekoLexColors.textInverse`
- [x] `levelBadgeText` color: `NekoLexColors.border` → `NekoLexColors.textInverse`
- [x] `actionCard` シャドウをネオングロウに変更
  ```typescript
  // 各カードは backgroundColor が card.bg (brand or progress) なので
  // カードに inline でネオングロウを適用する
  // style={[styles.actionCard, { backgroundColor: card.bg }, neonGlow(card.bg)]}
  // styles.actionCard からは borderColor/shadowColor/shadowOffset/shadowOpacity/shadowRadius を削除
  ```
- [x] `quizCard` シャドウをネオングロウに変更
  ```typescript
  // NekoLexColors.game のネオングロウ
  // neonGlow(NekoLexColors.game) をインラインで適用
  ```
- [x] `progressCard` シャドウをソフトダークシャドウに変更
  ```typescript
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.4,
  shadowRadius: 12,
  elevation: 8,
  // borderColor は NekoLexColors.border のまま
  ```
- [x] `recentCard` シャドウをソフトダークシャドウに変更 (progressCard と同様)
- [x] `neonGlow` import を `@/constants/theme` から追加

## 参考コード

```typescript
// theme.ts の neonGlow ヘルパー
export function neonGlow(color: string, intensity: number = 1) {
  return {
    borderColor: color,
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45 * intensity,
    shadowRadius: 14,
    elevation: 12,
  };
}
```

## 変更ファイル

- `ios-app/nekolex/app/(tabs)/index.tsx`

## 完了条件

- [x] 全 Todo が完了
- [x] levelBadge のテキストが黄色バッジ上で視認できる (黒/ダーク色)
- [x] actionCard に色付きネオングロウが表示される
- [x] quizCard に orange ネオングロウが表示される
- [x] progressCard / recentCard がダーク背景で浮いて見える
- [x] TypeScript エラーなし
