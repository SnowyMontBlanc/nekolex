# 001: プロジェクトクリーンアップ & 基盤整備

## 概要
Expo テンプレートの不要ファイルを削除し、NekoLex 用のディレクトリ構成とテーマ定義を整備する。

## 依存先
なし

## ブロック対象
003, 006

## 作業内容

### 1. 不要ファイル・コンポーネントの削除
- テンプレートのサンプル画面内容をクリア (index.tsx, explore.tsx)
- 不要コンポーネント削除 (hello-wave.tsx, parallax-scroll-view.tsx など)
- 不要アセット削除 (react-logo 画像群)
- reset-project.js 削除

### 2. ディレクトリ構成の作成
```
ios-app/nekolex/
├── services/          # API・ストレージサービス
├── data/              # 品種データ
├── types/             # TypeScript型定義
├── utils/             # ユーティリティ
├── contexts/          # React Context
└── assets/breeds/     # 品種画像
```

### 3. テーマ定義の更新
`constants/theme.ts` に NekoLex カラーパレット・タイポグラフィを定義:
- primary: #FF6B6B (コーラルレッド)
- secondary: #4ECDC4 (ターコイズ)
- accent: #FFE66D (イエロー)
- background: #F7F7F7
- surface: #FFFFFF
- text: #2C3E50
- textLight: #95A5A6
- success: #2ECC71
- error: #E74C3C
- warning: #F39C12
- タイポグラフィ (title, subtitle, body, caption, button)

### 4. 追加パッケージのインストール確認
- @react-native-async-storage/async-storage
- expo-image-picker
- expo-file-system
- expo-image-manipulator
- (package.json に未記載のものがあればインストール)

## 完了条件
- 不要なテンプレートファイルが削除されている
- 必要なディレクトリがすべて作成されている
- テーマファイルに NekoLex のカラーパレットとタイポグラフィが定義されている
- 必要なパッケージがすべてインストールされている
- `npx expo start` でエラーなく起動する

## TODO
- [x] 不要コンポーネント・アセットの削除
- [x] サンプル画面内容のクリア
- [x] ディレクトリ構成の作成 (services, data, types, utils, contexts, assets/breeds)
- [x] constants/theme.ts のカラーパレット・タイポグラフィ更新
- [x] 追加パッケージのインストール確認
- [x] 起動確認
