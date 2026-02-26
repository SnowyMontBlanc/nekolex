# NekoLex - 猫品種マスター

**ポケモン図鑑風の猫品種学習アプリ**

写真を撮るだけで猫の品種を識別し、ゲーム感覚で品種知識を身につけられる iOS / Android アプリです。

---

## スクリーンショット

<!-- TODO: アプリ完成後にスクリーンショットを追加 -->
| ホーム | 図鑑 | 識別結果 | クイズ |
|--------|------|---------|--------|
| ![home](docs/screenshots/home.png) | ![pokedex](docs/screenshots/pokedex.png) | ![result](docs/screenshots/result.png) | ![quiz](docs/screenshots/quiz.png) |

---

## 機能

- **写真識別** — カメラ撮影またはギャラリーから画像を選択し、AIが猫の品種を自動識別
- **図鑑システム** — 発見済み品種をポケモン図鑑風にコレクション (20品種)
- **復習クイズ** — 4択クイズで学習定着。難易度は初級 / 中級 / 上級から選択可能
- **XP・レベルシステム** — 品種発見やクイズ正解でXPを獲得してレベルアップ
- **間隔反復学習** — スペースド・リピティションで記憶を効率的に定着

---

## 技術スタック

| 分野 | 技術 |
|------|------|
| フレームワーク | React Native 0.81 / Expo SDK 54 |
| 言語 | TypeScript (strict mode) |
| ルーティング | Expo Router v6 (file-based routing) |
| AI識別 | Gemini API (gemini-2.5-flash) |
| ストレージ | AsyncStorage (ローカルのみ) |
| アニメーション | react-native-reanimated v4 |

---

## セットアップ

### 必要なもの

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- [Expo Go](https://expo.dev/go) アプリ (実機確認用)
- Gemini API キー ([Google AI Studio](https://aistudio.google.com/) で無料取得)

### インストール

```bash
git clone https://github.com/your-username/nekolex.git
cd nekolex/ios-app/nekolex
npm install
```

### 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して Gemini API キーを設定します:

```
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### 起動

```bash
npx expo start
```

QRコードを Expo Go アプリで読み取るか、シミュレーターで起動します。

---

## プロジェクト構成

```
nekolex/
├── ios-app/nekolex/        # Expo アプリ本体
│   ├── app/                # 画面 (Expo Router)
│   ├── components/         # 共通コンポーネント
│   ├── services/           # API・ストレージ処理
│   ├── data/breeds.json    # 品種マスターデータ (20品種)
│   ├── contexts/           # React Context (状態管理)
│   └── utils/              # クイズ生成・XP計算
└── docs/                   # 実装チケット
```

---

## ライセンス

MIT License
