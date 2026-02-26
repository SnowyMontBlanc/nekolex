# 007: Claude API 連携サービス

## 概要
Claude API (Anthropic) を使用した猫品種識別機能を実装する。tool_use による構造化出力で識別結果を取得する。

## 依存先
002 (型定義), 006 (画像処理サービス)

## ブロック対象
008

## 作業内容

### 1. Claude API サービス (`services/claude-api.ts`)

#### API 設定
- Model: `claude-sonnet-4-5-20250929`
- API Key: 環境変数 `EXPO_PUBLIC_CLAUDE_API_KEY` から取得 (MVP)
- 将来的にバックエンドプロキシに移行

#### 品種識別関数
```typescript
identifyBreed(imageBase64: string): Promise<IdentificationResult>
```

#### リクエスト構造
```typescript
{
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 1024,
  tools: [{
    name: "identify_cat_breed",
    description: "猫の品種を識別した結果を返す",
    input_schema: {
      type: "object",
      properties: {
        breed_id: { type: "string", description: "品種ID (breeds.jsonのidと一致)" },
        confidence: { type: "number", description: "信頼度 (0-1)" },
        characteristics: { type: "array", items: { type: "string" }, description: "識別した特徴" }
      },
      required: ["breed_id", "confidence", "characteristics"]
    }
  }],
  tool_choice: { type: "tool", name: "identify_cat_breed" },
  messages: [{
    role: "user",
    content: [
      { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
      { type: "text", text: "この画像の猫の品種を特定してください。breeds.jsonに定義されている品種IDで回答してください。" }
    ]
  }]
}
```

#### レスポンス解析
- tool_use レスポンスから IdentificationResult を抽出
- breeds.json に存在する breed_id かを検証

### 2. エラーハンドリング
```typescript
// ステータスコード別の処理
- 429: レート制限 → 「しばらく待ってから再試行してください」
- 400: 不正リクエスト → 「画像を認識できませんでした」
- 401: 認証エラー → 「APIキーを確認してください」
- 500+: サーバーエラー → 「識別に失敗しました。再試行してください」
- ネットワークエラー → 「通信に失敗しました」
```

### 3. 環境変数設定
- `.env.local` ファイルにAPIキーを設定
- `.gitignore` に `.env.local` が含まれていることを確認

## 完了条件
- Claude API への画像送信と品種識別が動作する
- tool_use による構造化レスポンスが正しく解析される
- breed_id が breeds.json の品種と一致する
- 各種エラーが適切にハンドリングされる
- API キーが環境変数から読み込まれる

## TODO
- [x] services/claude-api.ts 作成
- [x] identifyBreed 関数実装
- [x] tool_use リクエスト構築
- [x] レスポンス解析 & IdentificationResult 抽出
- [x] breed_id の検証 (breeds.json との照合)
- [x] エラーハンドリング (429, 400, 401, 500+, ネットワーク)
- [x] .env.local 設定 & .gitignore 確認
