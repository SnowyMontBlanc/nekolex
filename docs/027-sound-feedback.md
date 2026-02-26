# 027 サウンドフィードバック実装

## 概要

`sound_enabled` 設定を実際のサウンド再生に連動させる。
現状はサウンド機能が未実装（設定値のみ存在）のため、`expo-av` を使って効果音を実装する。

## 依存チケット

- `026` 触覚フィードバック（パターンが同じため、先に 026 を参考にする）

## 設計方針

### ライブラリ

`expo-av` を使用（Expo SDK 54 に含まれる）。

```bash
npx expo install expo-av
```

### サウンドファイル

`assets/sounds/` に配置（OGG/MP3 推奨、各 0.5〜1 秒以内）。

| ファイル名 | 場面 |
|---|---|
| `correct.mp3` | クイズで回答ボタンを押して正解した瞬間 |
| `wrong.mp3` | クイズで回答ボタンを押して不正解だった瞬間 |
| `discover.mp3` | カメラ識別で初めて品種を発見した瞬間 |
| `levelup.mp3` | レベルアップアニメーション開始時 |
| `tap.mp3` | ボタンタップ（オプション） |

### 実装方針

`services/sound.ts` を新規作成し、設定チェック済みのラッパー関数を提供する。

```typescript
// services/sound.ts
import { Audio } from 'expo-av';
import { getSettings } from './storage';

const sounds = {
  correct:  require('@/assets/sounds/correct.mp3'),
  wrong:    require('@/assets/sounds/wrong.mp3'),
  discover: require('@/assets/sounds/discover.mp3'),
  levelup:  require('@/assets/sounds/levelup.mp3'),
};

async function play(key: keyof typeof sounds) {
  const s = await getSettings();
  if (!s.sound_enabled) return;
  const { sound } = await Audio.Sound.createAsync(sounds[key]);
  await sound.playAsync();
  sound.setOnPlaybackStatusUpdate(status => {
    if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
  });
}

export const playCorrect  = () => play('correct');
export const playWrong    = () => play('wrong');
export const playDiscover = () => play('discover');
export const playLevelUp  = () => play('levelup');
```

### 呼び出し箇所

| 場面 | 関数 | 呼び出し箇所 |
|---|---|---|
| クイズ回答ボタン押下 → 正解 | `playCorrect()` | `components/quiz-question.tsx` |
| クイズ回答ボタン押下 → 不正解 | `playWrong()` | `components/quiz-question.tsx` |
| カメラ識別 → 初回発見 | `playDiscover()` | `app/camera.tsx` |
| レベルアップ | `playLevelUp()` | `components/animations.tsx` |

## Todo

- [x] `expo-av` をインストール
- [x] `assets/sounds/` にサウンドファイルを配置（CC0 ライセンスのものを使用）
  - `correct.mp3` / `wrong.mp3` / `discover.mp3` / `levelup.mp3`
- [x] `services/sound.ts` を新規作成（ファイル未配置時は try/catch でスキップ）
- [x] `app/quiz-result.tsx` の正解・不正解判定時に `playCorrect` / `playWrong` を呼び出し
- [x] `components/animations.tsx` の発見アニメーション開始時に `playDiscover` を呼び出し
- [x] `components/animations.tsx` のレベルアップ時に `playLevelUp` を呼び出し
- [ ] 実機でサウンドのタイミングと音量を確認
- [ ] `profile.tsx` の設定 Switch が即座に反映されることを確認
