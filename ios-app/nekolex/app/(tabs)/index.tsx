import { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { NekoLexColors, Spacing, neonGlow, Typography } from '@/constants/theme';
import { ScreenBackground } from '@/components/screen-background';
import { useUser } from '@/contexts/user-context';
import { ProgressBar } from '@/components/progress-bar';
import { xpProgress } from '@/utils/xp-calculator';
import { getReviewCount } from '@/utils/spaced-repetition';
import breedsData from '@/data/breeds.json';
import type { Breed } from '@/types';

const allBreeds = breedsData.breeds as Breed[];
const breedMap = new Map(allBreeds.map((b) => [b.id, b]));

const levelTitles: Record<number, string> = {
  1: 'ネコ見習い', 2: 'ネコウォッチャー', 3: 'ネコ好き',
  4: 'ネコ通', 5: 'ネコマスター', 6: 'ネコ博士',
  7: 'ネコ仙人', 8: 'ネコの達人', 9: 'ネコ王', 10: 'ネコの神',
};

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const ACTION_CARDS: {
  icon: IoniconsName;
  label: string;
  route: string;
  bg: string;
  badge: (count: number) => string;
}[] = [
  {
    icon: 'camera',
    label: '写真で識別',
    route: '/camera',
    bg: NekoLexColors.brand,
    badge: () => '+10 XP',
  },
  {
    icon: 'book',
    label: '図鑑を見る',
    route: '/(tabs)/pokedex',
    bg: NekoLexColors.progress,
    badge: (count) => `${count} / ${allBreeds.length}`,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { profile, discoveredBreeds } = useUser();
  const progress = xpProgress(profile.xp);
  const discoveredCount = Object.keys(discoveredBreeds).length;
  const needsMoreBreeds = discoveredCount < 4;
  const reviewCount = useMemo(() => getReviewCount(discoveredBreeds), [discoveredBreeds]);
  const title = levelTitles[profile.level] ?? 'レジェンド';

  const recentDiscoveries = useMemo(() => {
    return Object.values(discoveredBreeds)
      .sort((a, b) => new Date(b.discovered_at).getTime() - new Date(a.discovered_at).getTime())
      .slice(0, 4)
      .map((p) => ({ progress: p, breed: breedMap.get(p.breed_id) }))
      .filter((d): d is { progress: typeof d.progress; breed: Breed } => d.breed !== undefined);
  }, [discoveredBreeds]);

  return (
    <ScreenBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero card ───────────────────────────── */}
        <View style={styles.hero}>
          {/* Ghost number — urban poster backdrop */}
          <Text style={styles.heroGhost} numberOfLines={1}>{discoveredCount}</Text>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.logoText}>NekoLex</Text>
              <Text style={styles.logoSub}>猫品種マスター</Text>
            </View>
            <View style={styles.levelBadge}>
              <Ionicons name="star" size={12} color={NekoLexColors.textInverse} />
              <Text style={styles.levelBadgeText}>Lv.{profile.level}</Text>
            </View>
          </View>

          <View style={styles.rankRow}>
            <Ionicons name="paw" size={14} color="rgba(255,255,255,0.85)" />
            <Text style={styles.rankTitle}>{title}</Text>
          </View>

          <View style={styles.xpBlock}>
            <View style={styles.xpLabelRow}>
              <Text style={styles.xpLabel}>EXP</Text>
              <Text style={styles.xpValue}>{progress.current} / {progress.required}</Text>
            </View>
            <View style={styles.xpBarTrack}>
              <View style={[styles.xpBarFill, { width: `${progress.percentage}%` }]} />
              {[25, 50, 75].map((m) => (
                <View key={m} style={[styles.xpSeg, { left: `${m}%` as unknown as number }]} />
              ))}
            </View>
          </View>
        </View>

        {/* ── Section: なにをする？ ─────────────── */}
        <Text style={styles.sectionTitle}>なにをする？</Text>
        <View style={styles.actionRow}>
          {ACTION_CARDS.map((card) => (
            <TouchableOpacity
              key={card.route}
              style={[styles.actionCard, { backgroundColor: card.bg }, neonGlow(card.bg)]}
              onPress={() => router.push(card.route as any)}
              activeOpacity={0.82}>
              <View style={styles.actionIconCircle}>
                <Ionicons name={card.icon} size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>{card.label}</Text>
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{card.badge(discoveredCount)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Quiz card ───────────────────────────── */}
        <TouchableOpacity
          style={styles.quizCard}
          onPress={() => router.push('/(tabs)/quiz')}
          activeOpacity={0.82}>
          <View style={styles.quizIconWrap}>
            <Ionicons name="game-controller" size={26} color="#FFFFFF" />
          </View>
          <View style={styles.quizLeft}>
            <Text style={styles.quizTitle}>復習クイズ</Text>
            <Text style={styles.quizSub}>
              {needsMoreBreeds
                ? `あと${4 - discoveredCount}品種発見しよう！`
                : reviewCount > 0
                  ? `${reviewCount}品種が復習タイム！`
                  : '発見した品種を復習しよう'}
            </Text>
          </View>
          <View style={styles.quizArrow}>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* ── Progress card ───────────────────────── */}
        <View style={styles.progressCard}>
          <View style={styles.progressCardHeader}>
            <Ionicons name="library" size={14} color={NekoLexColors.text} />
            <Text style={styles.progressCardTitle}>図鑑コンプリート</Text>
          </View>
          <ProgressBar
            current={discoveredCount}
            total={allBreeds.length}
            label={`${discoveredCount} / ${allBreeds.length} 品種発見`}
            color={NekoLexColors.progress}
          />
        </View>

        {/* ── Recent discoveries ───────────────────── */}
        {recentDiscoveries.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Ionicons name="time-outline" size={16} color={NekoLexColors.textLight} />
              <Text style={styles.sectionRowTitle}>さいきんの発見</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentRow}>
              {recentDiscoveries.map((d) => (
                <TouchableOpacity
                  key={d.progress.breed_id}
                  style={styles.recentCard}
                  onPress={() => router.push(`/breed/${d.progress.breed_id}`)}
                  activeOpacity={0.82}>
                  <View style={styles.recentIconWrap}>
                    <Ionicons name="paw" size={22} color={NekoLexColors.brand} />
                  </View>
                  <Text style={styles.recentName} numberOfLines={2}>
                    {d.breed.name_ja}
                  </Text>
                  <Text style={styles.recentDate}>
                    {new Date(d.progress.discovered_at).toLocaleDateString('ja-JP', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const S = Spacing;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 40 },

  // ── Hero ──────────────────────────────────────────────────────────
  hero: {
    backgroundColor: NekoLexColors.brand,
    marginHorizontal: S.screenH,
    marginTop: 12,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: NekoLexColors.brand,
    shadowColor: NekoLexColors.brand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    padding: 20,
    gap: 12,
    overflow: 'hidden',
  },
  // Ghost number — oversized typography as graphic element (urban poster technique)
  heroGhost: {
    position: 'absolute',
    right: -8,
    bottom: -28,
    fontSize: 140,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.07)',
    letterSpacing: -8,
    lineHeight: 140,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoText: { fontSize: Typography.display.fontSize, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1.5 },
  logoSub:  { fontSize: Typography.micro.fontSize, fontWeight: '700', color: 'rgba(255,255,255,0.65)', marginTop: 2, letterSpacing: 1.5, textTransform: 'uppercase' },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: NekoLexColors.reward,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: NekoLexColors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  levelBadgeText: { fontSize: Typography.caption.fontSize, fontWeight: '900', color: NekoLexColors.textInverse },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rankTitle: { fontSize: Typography.caption.fontSize, fontWeight: '800', color: '#FFFFFF' },
  xpBlock: { gap: 7 },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  xpLabel: { fontSize: Typography.micro.fontSize, fontWeight: '800', letterSpacing: 1.5, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' },
  xpValue: { fontSize: Typography.micro.fontSize, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  xpBarTrack: {
    height: 14, borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 2, borderColor: 'rgba(0,0,0,0.3)',
    overflow: 'hidden', position: 'relative',
  },
  xpBarFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: NekoLexColors.reward, borderRadius: 5,
  },
  xpSeg: {
    position: 'absolute', top: 0, bottom: 0,
    width: 2, backgroundColor: 'rgba(0,0,0,0.18)',
  },

  // ── Section headers ──────────────────────────────────────────────
  // Standalone text (no icon)
  sectionTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '900',
    color: NekoLexColors.text,
    paddingHorizontal: S.screenH,
    paddingTop: S.sectionTop,
    paddingBottom: S.sectionBottom,
  },
  // With leading icon
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: S.screenH,
    paddingTop: S.sectionTop,
    paddingBottom: S.sectionBottom,
  },
  // Text inside sectionRow — padding is on the row container, not the text
  sectionRowTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '900',
    color: NekoLexColors.text,
  },

  // ── Action cards ─────────────────────────────────────────────────
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: S.screenH,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    gap: 10,
    minHeight: 126,
    justifyContent: 'center',
  },
  actionIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: { fontSize: Typography.caption.fontSize, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  actionBadge: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  actionBadgeText: { fontSize: Typography.micro.fontSize, fontWeight: '900', color: '#FFFFFF' },

  // ── Quiz card ────────────────────────────────────────────────────
  quizCard: {
    marginHorizontal: S.screenH,
    marginTop: S.cardGap,
    backgroundColor: NekoLexColors.game,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: NekoLexColors.game,
    shadowColor: NekoLexColors.game,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  quizIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizLeft: { flex: 1, gap: 3 },
  quizTitle: { fontSize: Typography.bodyLg.fontSize, fontWeight: '900', color: '#FFFFFF' },
  quizSub:   { fontSize: Typography.micro.fontSize, fontWeight: '600', color: 'rgba(255,255,255,0.88)' },
  quizArrow: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center', alignItems: 'center',
  },

  // ── Progress card ────────────────────────────────────────────────
  progressCard: {
    marginHorizontal: S.screenH,
    marginTop: S.cardGap,
    backgroundColor: NekoLexColors.surface,
    borderRadius: S.cardRadius,
    borderWidth: S.cardBorder,
    borderColor: NekoLexColors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    paddingTop: 14,
    paddingBottom: 6,
  },
  progressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: S.screenH,
    marginBottom: 4,
  },
  progressCardTitle: { fontSize: Typography.caption.fontSize, fontWeight: '800', color: NekoLexColors.text },

  // ── Recent cards ─────────────────────────────────────────────────
  recentRow: {
    paddingHorizontal: S.screenH,
    paddingBottom: 4,
    gap: 10,
  },
  recentCard: {
    backgroundColor: NekoLexColors.surface,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: NekoLexColors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    padding: 12,
    alignItems: 'center',
    width: 96,
    gap: 5,
  },
  recentIconWrap: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: NekoLexColors.brand + '15',
    borderWidth: 2,
    borderColor: NekoLexColors.brand + '35',
    justifyContent: 'center', alignItems: 'center',
  },
  recentName: { fontSize: Typography.micro.fontSize, fontWeight: '700', color: NekoLexColors.text, textAlign: 'center', lineHeight: 14 },
  recentDate: { fontSize: Typography.micro.fontSize, fontWeight: '600', color: NekoLexColors.textLight },
});
