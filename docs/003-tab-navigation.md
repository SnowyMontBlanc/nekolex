# 003: タブナビゲーション構成変更

## 概要
既存の2タブ構成 (Home, Explore) を NekoLex の4タブ構成 (ホーム/図鑑/クイズ/プロフィール) に変更する。

## 依存先
001

## ブロック対象
008, 009, 012, 014, 015

## 作業内容

### 1. タブレイアウトの更新 (`app/(tabs)/_layout.tsx`)
4つのタブを定義:
- **ホーム** (`index.tsx`): アイコン home
- **図鑑** (`pokedex.tsx`): アイコン book
- **クイズ** (`quiz.tsx`): アイコン help-circle / gamepad
- **プロフィール** (`profile.tsx`): アイコン person

### 2. タブ画面ファイルの作成
- `app/(tabs)/index.tsx` - ホーム画面 (既存を改修)
- `app/(tabs)/pokedex.tsx` - 図鑑一覧 (新規)
- `app/(tabs)/quiz.tsx` - クイズ画面 (新規)
- `app/(tabs)/profile.tsx` - プロフィール画面 (新規)
- `app/(tabs)/explore.tsx` - 削除

### 3. ルートレイアウトの更新 (`app/_layout.tsx`)
- Stack ナビゲーションに以下を追加:
  - `camera` (カメラ/識別画面)
  - `breed/[id]` (品種詳細)
  - `quiz-result` (クイズ結果)

### 4. 追加画面ファイルのスタブ作成
- `app/camera.tsx` - カメラ画面 (プレースホルダ)
- `app/breed/[id].tsx` - 品種詳細 (プレースホルダ)
- `app/quiz-result.tsx` - クイズ結果 (プレースホルダ)

### 5. タブバーのスタイリング
- NekoLex テーマカラーに合わせたタブバーデザイン
- アクティブ/非アクティブのカラー設定

## 完了条件
- 4つのタブが表示される
- 各タブのアイコンとラベルが正しい
- explore.tsx が削除されている
- 追加画面 (camera, breed/[id], quiz-result) へのナビゲーションが可能
- タブバーのスタイルが NekoLex テーマに合っている

## TODO
- [x] app/(tabs)/explore.tsx 削除
- [x] app/(tabs)/_layout.tsx を4タブ構成に更新
- [x] app/(tabs)/pokedex.tsx 作成 (プレースホルダ)
- [x] app/(tabs)/quiz.tsx 作成 (プレースホルダ)
- [x] app/(tabs)/profile.tsx 作成 (プレースホルダ)
- [x] app/(tabs)/index.tsx をホーム画面用にリセット
- [x] app/_layout.tsx に追加画面ルート定義
- [x] app/camera.tsx 作成 (プレースホルダ)
- [x] app/breed/[id].tsx 作成 (プレースホルダ)
- [x] app/quiz-result.tsx 作成 (プレースホルダ)
- [x] タブバースタイリング
