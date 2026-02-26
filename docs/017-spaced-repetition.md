# 017: 復習機能強化 (間隔反復学習)

## 概要
スペースド・リピティション (間隔反復学習) アルゴリズムを実装し、品種ごとの復習スケジュールを管理する。

## 依存先
012 (クイズ画面)

## ブロック対象
なし

## 作業内容

### 1. 間隔反復アルゴリズム

#### 復習スケジュール
```
初回発見 → 1日後 → 3日後 → 1週間後 → 2週間後 → 1ヶ月後

正解 → 次の復習間隔が長くなる (mastery_level + 1)
不正解 → 間隔をリセット (mastery_level = 0)
```

#### mastery_level と復習間隔の対応
```
0: 未復習 → 1日後に復習
1: 1日後正解 → 3日後に復習
2: 3日後正解 → 7日後に復習
3: 7日後正解 → 14日後に復習
4: 14日後正解 → 30日後に復習
5: マスター済み (定期復習のみ)
```

### 2. 復習管理ユーティリティ

```typescript
// 復習が必要な品種を取得
getBreedsNeedingReview(
  discoveredBreeds: Record<string, UserBreedProgress>
): string[]

// 次の復習日を計算
getNextReviewDate(masteryLevel: number, lastReviewDate: string): Date

// 復習結果を反映
updateMasteryLevel(
  breedId: string,
  correct: boolean,
  currentProgress: UserBreedProgress
): UserBreedProgress
```

### 3. 復習優先クイズ
- クイズ出題時に復習が必要な品種を優先的に出題
- quiz-generator.ts に復習優先ロジックを追加

### 4. ホーム画面への統合
- 「復習が必要な品種: X 品種」の表示
- 「今日の復習」クイズへの導線

## 完了条件
- mastery_level が正解/不正解に応じて更新される
- 復習が必要な品種が正しく算出される
- 復習間隔が mastery_level に応じて変化する
- クイズ出題時に復習品種が優先される
- ホーム画面に復習案内が表示される

## TODO
- [x] 間隔反復アルゴリズム実装
- [x] getBreedsNeedingReview 関数
- [x] getNextReviewDate 関数
- [x] updateMasteryLevel 関数
- [x] quiz-generator.ts に復習優先ロジック追加
- [x] ホーム画面に復習案内表示を追加
