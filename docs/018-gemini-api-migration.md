# 018: Claude API → Gemini API 移行（無料枠）

## 概要
品種識別機能で使用しているClaude API（有料）をGemini API無料枠（Gemini 2.5 Flash）に移行し、APIコストをゼロにする。

## 依存先
007 (Claude API連携サービス)

## ブロック対象
なし

## 背景
- Claude API: input $3/MTok, output $15/MTok（画像はトークン消費大）
- Gemini 2.5 Flash 無料枠: input/output トークン無料、画像入力対応、JSON構造化出力対応
- 無料枠の制限: データがGoogleの製品改善に使用される

## 作業内容

### 1. `services/claude-api.ts` → `services/gemini-api.ts` に変更

#### エンドポイント
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
Header: x-goog-api-key: {API_KEY}
Content-Type: application/json
```

#### リクエスト構造（Claude tool_use → Gemini responseSchema）
```json
{
  "contents": [{
    "parts": [
      {
        "inline_data": {
          "mime_type": "image/jpeg",
          "data": "<base64>"
        }
      },
      {
        "text": "この画像の猫の品種を特定してください。..."
      }
    ]
  }],
  "generationConfig": {
    "response_mime_type": "application/json",
    "response_schema": {
      "type": "OBJECT",
      "properties": {
        "breed_id": { "type": "STRING" },
        "confidence": { "type": "NUMBER" },
        "characteristics": {
          "type": "ARRAY",
          "items": { "type": "STRING" }
        }
      },
      "required": ["breed_id", "confidence", "characteristics"]
    }
  }
}
```

#### レスポンス解析
- `response.candidates[0].content.parts[0].text` からJSONを取得
- `JSON.parse()` で IdentificationResult に変換

#### 維持する機能
- `IdentificationError` クラス（エラーコード体系はそのまま）
- `identifyBreed(imageBase64): Promise<IdentificationResult>` 関数シグネチャ
- `VALID_BREED_IDS` によるbreed_idバリデーション
- confidence < 0.1 で NOT_A_CAT エラー

### 2. `app/camera.tsx` の import 変更
```typescript
// Before
import { identifyBreed, IdentificationError } from '@/services/claude-api';
// After
import { identifyBreed, IdentificationError } from '@/services/gemini-api';
```

### 3. 環境変数の変更
```
# Before
EXPO_PUBLIC_CLAUDE_API_KEY=...

# After
EXPO_PUBLIC_GEMINI_API_KEY=...
```

### 4. 旧ファイルの削除
- `services/claude-api.ts` を削除

## Gemini API エラーハンドリング
```
- 429: レート制限 → 「リクエスト上限に達しました」
- 400: 不正リクエスト → 「画像を認識できませんでした」
- 403: 認証/権限エラー → 「APIキーを確認してください」
- 500+: サーバーエラー → 「識別に失敗しました」
- ネットワークエラー → 「通信に失敗しました」
```

## 完了条件
- Gemini API への画像送信と品種識別が動作する
- responseSchema による構造化JSONが正しく解析される
- breed_id が breeds.json の品種と一致する
- 各種エラーが適切にハンドリングされる
- API キーが環境変数 `EXPO_PUBLIC_GEMINI_API_KEY` から読み込まれる
- Claude API の旧コードが完全に除去されている
- TypeScript コンパイルエラーがない

## TODO
- [x] services/gemini-api.ts 作成
- [x] identifyBreed 関数実装（Gemini REST API）
- [x] responseSchema による構造化出力リクエスト
- [x] レスポンス解析 & IdentificationResult 抽出
- [x] breed_id の検証（breeds.json との照合）
- [x] エラーハンドリング（429, 400, 403, 500+, ネットワーク）
- [x] app/camera.tsx の import 変更
- [x] .env.local の環境変数を EXPO_PUBLIC_GEMINI_API_KEY に変更
- [x] services/claude-api.ts の削除
