import type { IdentificationResult } from '@/types';
import breedsData from '@/data/breeds.json';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const VALID_BREED_IDS = new Set(breedsData.breeds.map((b) => b.id));
const BREED_ID_LIST = breedsData.breeds.map((b) => b.id).join(', ');

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    breed_id: {
      type: 'STRING',
      description: `品種ID (${BREED_ID_LIST} のいずれか)`,
    },
    confidence: {
      type: 'NUMBER',
      description: '信頼度 (0-1)',
    },
    characteristics: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: '識別した特徴のリスト（日本語）',
    },
  },
  required: ['breed_id', 'confidence', 'characteristics'],
};

export class IdentificationError extends Error {
  constructor(
    message: string,
    public readonly code: 'RATE_LIMIT' | 'BAD_REQUEST' | 'AUTH_ERROR' | 'SERVER_ERROR' | 'NETWORK_ERROR' | 'NOT_A_CAT' | 'UNKNOWN',
  ) {
    super(message);
    this.name = 'IdentificationError';
  }
}

export async function identifyBreed(imageBase64: string): Promise<IdentificationResult> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new IdentificationError(
      'APIキーが設定されていません。.env.local にEXPO_PUBLIC_GEMINI_API_KEYを設定してください。',
      'AUTH_ERROR',
    );
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                text: `この画像の猫の品種を特定してください。猫が写っていない場合は、confidence を 0 にして breed_id を "mixed_breed" としてください。品種IDは次のいずれかで回答してください: ${BREED_ID_LIST}`,
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          response_schema: RESPONSE_SCHEMA,
        },
      }),
    });
  } catch {
    throw new IdentificationError(
      '通信に失敗しました。ネットワーク接続を確認してください。',
      'NETWORK_ERROR',
    );
  }

  if (!response.ok) {
    switch (response.status) {
      case 429:
        throw new IdentificationError(
          'リクエスト上限に達しました。しばらく待ってから再試行してください。',
          'RATE_LIMIT',
        );
      case 400:
        throw new IdentificationError(
          '画像を認識できませんでした。別の写真を試してください。',
          'BAD_REQUEST',
        );
      case 403:
        throw new IdentificationError(
          'APIキーを確認してください。',
          'AUTH_ERROR',
        );
      default:
        throw new IdentificationError(
          '識別に失敗しました。再試行してください。',
          'SERVER_ERROR',
        );
    }
  }

  const data = await response.json();

  // Extract JSON from Gemini response
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new IdentificationError(
      '識別結果を取得できませんでした。再試行してください。',
      'UNKNOWN',
    );
  }

  let parsed: { breed_id: string; confidence: number; characteristics: string[] };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new IdentificationError(
      '識別結果の解析に失敗しました。再試行してください。',
      'UNKNOWN',
    );
  }

  const result: IdentificationResult = {
    breed_id: parsed.breed_id,
    confidence: Math.max(0, Math.min(1, parsed.confidence)),
    characteristics: parsed.characteristics ?? [],
  };

  // Validate breed_id
  if (!VALID_BREED_IDS.has(result.breed_id)) {
    result.breed_id = 'mixed_breed';
  }

  // Check if confidence is too low (likely not a cat)
  if (result.confidence < 0.1) {
    throw new IdentificationError(
      '猫が写っていないようです。猫が写った写真を選んでください。',
      'NOT_A_CAT',
    );
  }

  return result;
}
