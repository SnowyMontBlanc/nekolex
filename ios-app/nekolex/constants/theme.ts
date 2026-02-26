import { Platform } from 'react-native';

/**
 * NekoLex — Synthwave Dusk Color System
 *
 * Concept: A warm violet twilight — deep aubergine backgrounds with a
 * hot-pink / mint-cyan / golden accent palette. The mood is premium retro-
 * romantic: less "arcade neon", more "city at magic hour". The 5 role
 * colors flow through the visible spectrum (pink → cyan → gold → lavender
 * → sunset-orange) so every UI zone has its own atmospheric identity.
 *
 *  brand    (#FF2D7A) — Hot pink.      CTAs, hero identity, highlight rings.
 *  progress (#36F1CD) — Mint cyan.     XP bars, pokedex fill, live progress.
 *  reward   (#FFD83D) — Golden amber.  Stars, level badge, XP earned text.
 *  feature  (#C77DFF) — Soft violet.   Profile hero, premium / special UI.
 *  game     (#FF9A3C) — Sunset orange. Quiz card, game-mode actions, timers.
 *
 *  Semantic (quiz difficulty only):
 *    easy   = success (#2DD4BF)
 *    medium = warning  (#FBBF24)
 *    hard   = error    (#FB7185)
 */
export const NekoLexColors = {
  // Brand — アイデンティティ
  brand: '#FF2D7A',

  // Progress — XP・進捗
  progress: '#36F1CD',
  progressLight: 'rgba(54,241,205,0.13)',

  // Reward — 星・報酬
  reward: '#FFD83D',

  // Feature — プロフィール・特別UI
  feature: '#C77DFF',

  // Game — クイズ・ゲームアクション
  game: '#FF9A3C',

  // Semantic (quiz difficulty)
  success: '#2DD4BF',
  successLight: 'rgba(45,212,191,0.13)',
  warning: '#FBBF24',
  warningLight: 'rgba(251,191,36,0.13)',
  error: '#FB7185',
  errorLight: 'rgba(251,113,133,0.13)',

  // Surface — DARK (warm violet undertones)
  background: '#0D0717',   // 深紫の夜空
  surface: '#180D2A',      // カード面 — 少し明るい紫
  surfaceAlt: '#221340',   // ネスト要素・ホバー

  // Borders
  border: 'rgba(199,125,255,0.14)',  // 薄いバイオレット枠

  // Text
  text: '#F0E8FF',         // ほぼ白 (わずかに紫みがかった温かみ)
  textLight: '#7B6A9A',    // ミュートされた紫グレー
  textInverse: '#0D0717',  // 暗背景上の反転

  // ── Aliases ──────────────────────────────────────────────────
  primary: '#FF2D7A',
  secondary: '#36F1CD',
  accent: '#FFD83D',
};

// ── Spacing tokens ──────────────────────────────────────────────────────────
export const Spacing = {
  screenH: 16,
  cardRadius: 18,
  cardBorder: 1.5,   // ネオン枠は薄く
  cardShadow: 0,     // グロウは offset なし (centered glow)
  cardGap: 14,
  sectionTop: 24,
  sectionBottom: 12,
};

// ── Typography ────────────────────────────────────────────────────────────
// 最小 fontSize = 12 (micro)。fontWeight は含めない（用途依存）。
// 装飾的な超大サイズ (80px アイコン代替・140px ロゴ装飾) はトークン外で許容。
export const Typography = {
  micro:      { fontSize: 12, lineHeight: 16 }, // 最小キャプション（日付・サブラベル）
  caption:    { fontSize: 13, lineHeight: 18 }, // セカンダリテキスト・フィルター
  body:       { fontSize: 15, lineHeight: 22 }, // 本文・設定項目・説明文
  bodyLg:     { fontSize: 17, lineHeight: 24 }, // 強調本文・ボタンラベル
  subheading: { fontSize: 20, lineHeight: 28 }, // セクション見出し・難易度ラベル
  heading:    { fontSize: 24, lineHeight: 32 }, // 画面タイトル
  display:    { fontSize: 32, lineHeight: 40 }, // 大数値（XP・カウント）
  jumbo:      { fontSize: 44, lineHeight: 52 }, // 特大スコア表示
} as const;

// ── Difficulty colors — dark mode ───────────────────────────────────────────
export const DifficultyColors: Record<1 | 2 | 3, { bg: string; text: string; border: string }> = {
  1: { bg: 'rgba(45,212,191,0.13)',  text: '#2DD4BF', border: '#0D9488' },
  2: { bg: 'rgba(251,191,36,0.13)',  text: '#FBBF24', border: '#D97706' },
  3: { bg: 'rgba(251,113,133,0.13)', text: '#FB7185', border: '#E11D48' },
};

// ── Neon glow helpers ───────────────────────────────────────────────────────
// Spread these onto card styles to apply neon glow in a given color.
export function neonGlow(color: string, intensity: number = 1) {
  return {
    borderColor: color,
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55 * intensity,   // Synthwave Dusk: slightly stronger glow
    shadowRadius: 16,                   // wider, softer spread
    elevation: 14,
  };
}

// ── Base card style ─────────────────────────────────────────────────────────
export const GameCard = {
  backgroundColor: NekoLexColors.surface,
  borderRadius: Spacing.cardRadius,
  borderWidth: Spacing.cardBorder,
  borderColor: NekoLexColors.border,
  shadowColor: '#C77DFF',             // violet tint for ambient card shadow
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.35,
  shadowRadius: 18,
  elevation: 12,
};

export const GameButton = {
  borderRadius: 14,
  borderWidth: Spacing.cardBorder,
  borderColor: 'rgba(199,125,255,0.18)',
  shadowColor: '#FF2D7A',             // brand-tinted button glow
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.40,
  shadowRadius: 12,
  elevation: 7,
  paddingVertical: 14,
  paddingHorizontal: 24,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

// ── Navigation theme ────────────────────────────────────────────────────────
export const Colors = {
  light: {
    text: NekoLexColors.text,
    background: NekoLexColors.background,
    tint: NekoLexColors.brand,
    icon: NekoLexColors.textLight,
    tabIconDefault: NekoLexColors.textLight,
    tabIconSelected: NekoLexColors.brand,
  },
  dark: {
    text: NekoLexColors.text,
    background: NekoLexColors.background,
    tint: NekoLexColors.brand,
    icon: NekoLexColors.textLight,
    tabIconDefault: NekoLexColors.textLight,
    tabIconSelected: NekoLexColors.brand,
  },
};


export const Fonts = Platform.select({
  ios: {
    rounded: 'ui-rounded',
    sans: 'system-ui',
    mono: 'ui-monospace',
  },
  default: { rounded: 'normal', sans: 'normal', mono: 'monospace' },
  web: {
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
