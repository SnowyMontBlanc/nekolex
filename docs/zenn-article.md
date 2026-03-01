---
title: "画像認識アプリを無料枠で作る。Gemini 2.5 Flashの構造化出力（Structured Outputs）が優秀すぎた"
emoji: "🐈"
type: "tech"
topics: ["reactnative", "expo", "gemini", "ai", "個人開発"]
published: false
---

## はじめに

街で見かけた猫や、友達の飼っている猫の品種って、意外とわからないこと多くないですか？
調べてみて「へー」と思っても、次に似た猫を見かけたときにはすっかり忘れていたり…。

そこで、**写真を撮るだけで猫の品種を識別して、ポケモン図鑑みたいにコレクションできるアプリ「NekoLex（ネコレックス）」** を作ってみました。

![写真で識別](https://raw.githubusercontent.com/SnowyMontBlanc/nekolex/main/assets/screenshots/%E5%86%99%E7%9C%9F%E3%81%A7%E8%AD%98%E5%88%A5.gif =300x)

![図鑑でコレクション](https://raw.githubusercontent.com/SnowyMontBlanc/nekolex/main/assets/screenshots/%E5%9B%B3%E9%91%91.png =300x)

![クイズで復習](https://raw.githubusercontent.com/SnowyMontBlanc/nekolex/main/assets/screenshots/%E5%BE%A9%E7%BF%92%E3%82%AF%E3%82%A4%E3%82%BA.gif =300x)

このアプリの裏側（画像の品種判定）には、Googleの **Gemini 2.5 Flash API** を使っています。

この記事では、AIに画像を投げて「**アプリでそのまま使えるキレイなJSONフォーマットで返してもらう**」ための実装ノウハウを紹介します。

ソースコードはGitHubで公開しています。
https://github.com/SnowyMontBlanc/nekolex

---

## 使用技術

* **フロントエンド**: React Native (0.81) / Expo (SDK 54) / TypeScript
* **ルーティング**: Expo Router v6
* **AI・画像認識**: Gemini 2.5 Flash API
* **カメラ・画像処理**: `expo-image-picker` / `expo-image-manipulator`

---

## なぜ Gemini API を選んだのか？

個人開発のMVP（まずは動くものを作る段階）で数あるAIモデルの中から Gemini 2.5 Flash を選んだ理由は主に2つです。

1. **無料枠がとにかく太っ腹**
   Google AI Studioからキーを発行するだけで、1日1,500リクエストまで無料で使えます。個人開発のプロトタイプやテスト用には十分すぎる枠です（※無料枠だと入力データがモデルの学習に使われる点には注意）。
2. **Structured Outputs（構造化出力）がすごく使いやすい**
   JSONスキーマを指定するだけで、本当に指定した通りのフォーマットでレスポンスが返ってきます。アプリ側で「AIの長文から正規表現で無理やりJSONを抜き出す」みたいな泥臭い処理が一切不要になります。

---

## 1. アプリ側での画像処理（送信前の工夫）

今のスマホカメラで撮った画像は数MB〜十数MBとかなり大きいです。これをそのまま Base64 化して API に投げると、通信量も増えるし、APIの制限にも引っかかりやすくなります。

なので、`expo-image-manipulator` を使って**送信前に画像をリサイズ・圧縮**しています。
品種の判定をするくらいなら、長辺800pxもあれば十分です。

:::message
**ポイント**
画像をAPIに投げる前にリサイズすることで、Geminiの無料枠トークン消費を抑え、通信時のレスポンスタイムも劇的に改善できます。
:::

```typescript:services/image-processor.ts
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const DEFAULT_MAX_WIDTH = 800;

export async function prepareImageForApi(imageUri: string) {
  // 1. 画像のリサイズと圧縮
  const resized = await manipulateAsync(
    imageUri,
    [{ resize: { width: DEFAULT_MAX_WIDTH } }],
    { compress: 0.8, format: SaveFormat.JPEG }
  );

  // 2. Base64 エンコード
  const base64 = await FileSystem.readAsStringAsync(resized.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  return { base64, mediaType: 'image/jpeg' };
}
```

---

## 2. Gemini API へのリクエスト（Structured Outputs の活用）

ここが一番のポイントです。
単に「この画像は何の品種？」と聞くと、AI は「これは〇〇という品種で〜」と長文の日本語を返してきちゃいます。でもアプリ側としては、図鑑データと紐付けるために**ID（例：`scottish_fold`）と信頼度の数値だけが欲しい**んですよね。

Gemini API なら、リクエストを送るときに `generationConfig` の `response_schema` を設定するだけで、この問題をサクッと解決できます。

:::details 実装コード全体（クリックで開く）
```typescript:services/gemini-api.ts
// 例として、猫のマスターデータ（JSON）から品種IDのリストを動的に生成します
import breedsData from '@/data/breeds.json';
const VALID_BREED_IDS = breedsData.breeds.map((b) => b.id);
const BREED_ID_LIST = VALID_BREED_IDS.join(', '); // "scottish_fold, american_shorthair, ..." になる

// 期待する JSON のスキーマを定義
const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    breed_id: {
      type: 'STRING',
      // プロンプトを兼ねて、AIに「この中から選べ」と指示する
      description: `品種ID (${BREED_ID_LIST} のいずれか)`,
    },
    confidence: {
      type: 'NUMBER',
      description: '信頼度 (0.0から1.0の間)',
    },
    characteristics: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: '画像から識別した猫の特徴リスト（日本語）',
    },
  },
  required: ['breed_id', 'confidence', 'characteristics'],
};

export async function identifyBreed(imageBase64: string) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              // プロンプトで「猫が写っていない場合のフォールバック」も指示しておく
              text: `この画像の猫の品種を特定してください。猫が写っていない場合は、confidence を 0 にして breed_id を "mixed_breed" としてください。`,
            },
          ],
        }],
        generationConfig: {
          // 💡 ここが重要！MIMEタイプをJSONに指定し、スキーマを渡す
          response_mime_type: 'application/json',
          response_schema: RESPONSE_SCHEMA,
        },
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error('画像から猫の品種を判定できませんでした');
  }

  // スキーマを指定しているため基本的には安全ですが、
  // 万が一の通信エラーやパース失敗に備えて try-catch で囲むと安全です
  try {
    return JSON.parse(text); 
  } catch (error) {
    throw new Error('AIの回答を解析できませんでした');
  }
}
```
:::

### 実装のポイント解説

実装の中で特に重要だった工夫を3つにまとめました。

#### 1. `response_mime_type` のセット
`response_mime_type: 'application/json'` を入れるだけで、AIが勝手に付けてくる余計なマークダウン（`` ` ` `json ... ` ` ` ``）がなくなり、純粋な JSON 文字列だけが返ってくるようになります。これだけでパースが劇的に楽になります。

#### 2. `description` をプロンプトとして使う
`description: "品種ID (${BREED_ID_LIST} のいずれか)"` のようにスキーマの中に指示を書いておくことで、AIが勝手にアプリに存在しない謎のIDを作り出すのを防げます。
配列を動的に `join()` して渡すことで、猫のマスターデータが増えてもAPI側のコードはいじらなくて済むようにしています。

#### 3. エッジケースもプロンプトでカバー
ユーザーが間違えて「犬」や「机」の写真を送ってきたときにアプリがおかしくならないよう、以下のルールをプロンプト（`text`）に仕込んでいます。
> 「猫が写っていない場合は、confidence を 0 にして breed_id を "mixed_breed" としてください」

アプリ側では、このレスポンスの `confidence`（信頼度）が極端に低い（0.1未満）場合は、**「雑種として登録する」のではなく「猫が写っていないようです」というエラー弾き処理**を行っています。この制御をアプリ側で確実に行えるのも、数値が明確なJSONで返ってくるおかげです。

---

## おわりに

Gemini の Structured Outputs を使ってみたら、画像からのデータ抽出が拍子抜けするほど簡単でした。
あとは返ってきた JSON の `breed_id` をキーにして、アプリ内に持っている猫の詳細データ（性格や見分け方）とガッチャンコして画面に出すだけです。

今回は「ただ図鑑を埋める」だけじゃなく、一度見つけた猫をクイズで復習する機能（Spaced Repetition）も入れたので、個人開発のアプリとしては結構遊びごたえのあるものになったかなと思います。

生成AIってチャットボットのイメージが強いですが、こういう**「裏側の優秀な分類・判定モジュール」**として使うと、個人開発で作れるアプリの幅が一気に広がってめちゃくちゃ楽しいです。皆さんもぜひ試してみてください！
