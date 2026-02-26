# NekoLex — 開発者向けセットアップ

## 前提条件

- Node.js 18+
- Gemini API キー ([Google AI Studio](https://aistudio.google.com/) で無料取得)

## セットアップ

```bash
npm install
cp .env.local.example .env.local
# .env.local に EXPO_PUBLIC_GEMINI_API_KEY を設定
```

## 起動

```bash
npx expo start        # 開発サーバー起動
npx expo start --ios  # iOS シミュレーター
```

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `EXPO_PUBLIC_GEMINI_API_KEY` | Gemini API キー (品種識別に使用) |

> **注意**: `EXPO_PUBLIC_` プレフィックスはビルド時にJSバンドルへ埋め込まれます。
> アプリストアへのリリース時はバックエンドプロキシ経由に切り替えてください。
