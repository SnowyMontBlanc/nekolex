# 028 レベルアップ演出実装

## 概要

レベルアップ検知の仕組みと `LevelUpAnimation` の表示を実装する。
現状はコンポーネントが存在するが、どこにも表示されていない。

## 現状の仕組み

### XP / レベル計算

```
発見 +10 XP / クイズ正解 +5 XP / パーフェクトボーナス +20 XP

Lv1 (0 XP) → Lv2 (100) → Lv3 (250) → Lv4 (500) → Lv5 (800)
→ Lv6 (1200) → Lv7 (1700) → Lv8 (2300) → Lv9 (3000) → Lv10 (4000)

最大レベル: Lv10 (calculateLevel は最大 10 を返す)
```

### レベルアップ検知の欠落

`user-context.tsx` の `discoverBreed` / `completeQuiz` は共に
`setProfile((prev) => ...)` 内で `calculateLevel(newXp)` を呼び
`prev.level` と新レベルを**比較していない**。

```typescript
// 現状 (completeQuiz 内)
setProfile((prev) => {
  const updated = { ...prev, xp: prev.xp + result.xp_gained };
  updated.level = calculateLevel(updated.xp);  // prev.level との比較なし
  saveUserProfile(updated);
  return updated;
});
```

### LevelUpAnimation の未接続状態

| 項目 | 状態 |
|------|------|
| `LevelUpAnimation` コンポーネント | `components/animations.tsx` に存在 |
| どこかで import・render | **されていない** |
| `playLevelUp()` | `LevelUpAnimation.useEffect` 内にあるが、コンポーネントが mount されないので**鳴らない** |

## 設計方針

### 1. UserContext にレベルアップ通知を追加

`user-context.tsx` に以下を追加する。

```typescript
// 追加する state
const [pendingLevelUp, setPendingLevelUp] = useState<number | null>(null);

// 追加する関数
const clearPendingLevelUp = useCallback(() => setPendingLevelUp(null), []);
```

`discoverBreed` / `completeQuiz` 両方の `setProfile` updater 内でレベルアップを検知し、
updater 外から `setPendingLevelUp` を呼び出す。

```typescript
// updater 内で検知 → setTimeout で updater 外から通知
setProfile((prev) => {
  const newXp = prev.xp + XP_REWARDS.DISCOVER_BREED;
  const newLevel = calculateLevel(newXp);
  const final = { ...prev, xp: newXp, level: newLevel };
  saveUserProfile(final);
  if (newLevel > prev.level) {
    setTimeout(() => setPendingLevelUp(newLevel), 0);
  }
  return final;
});
```

### 2. UserContextValue に公開

```typescript
interface UserContextValue {
  // ... 既存
  pendingLevelUp: number | null;
  clearPendingLevelUp: () => void;
}
```

### 3. LevelUpAnimation をオーバーレイ表示

レベルアップが発生しうる 2 画面で表示する。

| 画面 | トリガー |
|------|---------|
| `app/camera.tsx` | `discoverBreed` → XP 加算 |
| `app/quiz-result.tsx` | `completeQuiz` → XP 加算 |

```tsx
// camera.tsx / quiz-result.tsx 共通パターン
const { pendingLevelUp, clearPendingLevelUp } = useUser();

// JSX 末尾に追加
{pendingLevelUp !== null && (
  <LevelUpAnimation
    newLevel={pendingLevelUp}
    onComplete={clearPendingLevelUp}
  />
)}
```

`LevelUpAnimation` は `StyleSheet.absoluteFillObject` + `zIndex: 100` で
画面全体に被さるため、特別なモーダル実装は不要。

### 4. playLevelUp() の発火タイミング確認

`LevelUpAnimation.useEffect` 内にすでに `playLevelUp()` が記述されている。
コンポーネントが mount されれば自動的に鳴る。追加実装不要。

## Todo

- [x] `user-context.tsx`: `pendingLevelUp` / `clearPendingLevelUp` を追加
- [x] `user-context.tsx`: `discoverBreed` にレベルアップ検知を追加
- [x] `user-context.tsx`: `completeQuiz` にレベルアップ検知を追加
- [x] `app/camera.tsx`: `LevelUpAnimation` オーバーレイを追加
- [x] `app/quiz-result.tsx`: `LevelUpAnimation` オーバーレイを追加
- [ ] 実機でレベルアップ演出・サウンドのタイミングを確認
