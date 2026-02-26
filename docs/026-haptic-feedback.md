# 026 触覚フィードバック正式実装

## 概要

`haptic_enabled` 設定を実際の振動動作に連動させ、
さらにクイズ正解・不正解・品種発見などのインタラクションにもハプティクスを追加する。

## 現状の問題

- `haptic-tab.tsx` はタブタップ時に常に振動する（設定の ON/OFF を見ていない）
- クイズ正解・不正解・品種発見などには振動がない

## 依存チケット

なし（独立して実施可能）

## 設計方針

### 設定の連動

`haptic-tab.tsx` で `getSettings()` を呼び出し、`haptic_enabled` が `false` のときは
`Haptics.impactAsync` をスキップする。

### 追加するフィードバック箇所

| 場面 | スタイル | 強度 |
|---|---|---|
| タブタップ | `ImpactFeedbackStyle.Light` | 弱 |
| クイズ正解 | `NotificationFeedbackType.Success` | 中 |
| クイズ不正解 | `NotificationFeedbackType.Error` | 中 |
| 品種発見（初回） | `ImpactFeedbackStyle.Heavy` | 強 |
| レベルアップ | `NotificationFeedbackType.Success` | 強 |
| ボタン長押し | `ImpactFeedbackStyle.Medium` | 中 |

### 実装方針

`services/haptics.ts` を新規作成し、設定チェック済みのラッパー関数を提供する。

```typescript
// services/haptics.ts
import * as Haptics from 'expo-haptics';
import { getSettings } from './storage';

export async function hapticSuccess() {
  const s = await getSettings();
  if (!s.haptic_enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function hapticError() {
  const s = await getSettings();
  if (!s.haptic_enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export async function hapticLight() {
  const s = await getSettings();
  if (!s.haptic_enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function hapticHeavy() {
  const s = await getSettings();
  if (!s.haptic_enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}
```

## Todo

- [x] `services/haptics.ts` を新規作成（設定チェック済みラッパー）
- [x] `components/haptic-tab.tsx` を `hapticLight()` に置き換え
- [x] `app/quiz-result.tsx` の正解・不正解判定時に `hapticSuccess` / `hapticError` を呼び出し
- [x] `components/animations.tsx` の発見アニメーション開始時に `hapticHeavy` を呼び出し
- [x] `components/animations.tsx` のレベルアップ時に `hapticSuccess` を呼び出し
- [ ] 実機で振動タイミングと強度を確認
- [ ] `profile.tsx` の設定 Switch が即座に反映されることを確認
