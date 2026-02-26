import { StyleSheet, View, Text, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import { NekoLexColors, Typography } from '@/constants/theme';
import { ScreenBackground } from '@/components/screen-background';
import { useUser } from '@/contexts/user-context';
import { ProgressBar } from '@/components/progress-bar';
import { xpProgress } from '@/utils/xp-calculator';
import { getSettings, saveSettings, resetAllData } from '@/services/storage';
import breedsData from '@/data/breeds.json';
import type { AppSettings } from '@/types';

const totalBreeds = breedsData.breeds.length;

const levelTitles: Record<number, string> = {
  1: 'ネコ見習い', 2: 'ネコウォッチャー', 3: 'ネコ好き',
  4: 'ネコ通', 5: 'ネコマスター', 6: 'ネコ博士',
  7: 'ネコ仙人', 8: 'ネコの達人', 9: 'ネコ王', 10: 'ネコの神',
};

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
const ACHIEVEMENTS: { name: string; icon: IoniconsName; condition: string; required: number; color: string }[] = [
  { name: '初心者',      icon: 'ribbon',    condition: '5品種発見',   required: 5,  color: NekoLexColors.game },
  { name: '愛好家',      icon: 'medal',     condition: '10品種発見',  required: 10, color: NekoLexColors.progress },
  { name: 'エキスパート', icon: 'trophy',   condition: '15品種発見',  required: 15, color: NekoLexColors.warning },
  { name: 'マスター',    icon: 'diamond',   condition: '全20品種発見', required: 20, color: NekoLexColors.feature },
];

const STAT_ITEMS = (
  discoveredCount: number,
  totalQuizTaken: number,
  correctRate: number,
  xp: number,
): { label: string; value: string; icon: IoniconsName; color: string }[] => [
  { label: '発見品種',   value: `${discoveredCount}/${totalBreeds}`, icon: 'paw',             color: NekoLexColors.brand },
  { label: 'クイズ回数', value: String(totalQuizTaken),              icon: 'game-controller', color: NekoLexColors.game },
  { label: '正解率',     value: `${correctRate}%`,                   icon: 'star',            color: NekoLexColors.reward },
  { label: '総XP',       value: String(xp),                          icon: 'flash',           color: NekoLexColors.feature },
];

export default function ProfileScreen() {
  const { profile, discoveredBreeds, refreshData } = useUser();
  const [settings, setSettings] = useState<AppSettings>({
    difficulty: 'easy',
    sound_enabled: true,
    haptic_enabled: true,
  });

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const progress = xpProgress(profile.xp);
  const title = levelTitles[profile.level] ?? 'レジェンド';
  const totalQuestions = profile.total_quiz_taken * 5;
  const correctRate =
    profile.total_correct_answers > 0 && totalQuestions > 0
      ? Math.min(Math.round((profile.total_correct_answers / totalQuestions) * 100), 100)
      : 0;

  const discoveredCount = Object.keys(discoveredBreeds).length;
  const stats = STAT_ITEMS(discoveredCount, profile.total_quiz_taken, correctRate, profile.xp);

  const toggleSound = async (value: boolean) => {
    const updated = { ...settings, sound_enabled: value };
    setSettings(updated);
    await saveSettings(updated);
  };

  const toggleHaptic = async (value: boolean) => {
    const updated = { ...settings, haptic_enabled: value };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleReset = () => {
    Alert.alert(
      'データリセット',
      'すべてのデータが削除されます。この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            await refreshData();
          },
        },
      ],
    );
  };

  return (
    <ScreenBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Level card */}
        <View style={styles.levelCard}>
          <View style={styles.levelCardTop}>
            <View style={styles.catAvatarWrap}>
              <Ionicons name="paw" size={36} color="#FFFFFF" />
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.rankTitle}>{title}</Text>
              <View style={styles.levelBadge}>
                <Ionicons name="star" size={12} color={NekoLexColors.textInverse} />
                <Text style={styles.levelBadgeText}>Lv.{profile.level}</Text>
              </View>
            </View>
          </View>

          <View style={styles.xpSection}>
            <View style={styles.xpLabelRow}>
              <Text style={styles.xpLabel}>EXPERIENCE</Text>
              <Text style={styles.xpValue}>{progress.current} / {progress.required} XP</Text>
            </View>
            <View style={styles.xpBarTrack}>
              <View style={[styles.xpBarFill, { width: `${progress.percentage}%` }]} />
              {[25, 50, 75].map((m) => (
                <View key={m} style={[styles.xpSegment, { left: `${m}%` as unknown as number }]} />
              ))}
            </View>
            <Text style={styles.xpPercent}>{progress.percentage}%</Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.sectionHeader}>
          <Ionicons name="bar-chart" size={16} color={NekoLexColors.text} />
          <Text style={styles.sectionTitle}>わたしの記録</Text>
        </View>
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statCard, { borderColor: s.color }]}>
              <View style={[styles.statIconWrap, { backgroundColor: s.color + '20' }]}>
                <Ionicons name={s.icon} size={22} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Discovery progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressCardHeader}>
            <Ionicons name="library" size={14} color={NekoLexColors.text} />
            <Text style={styles.progressCardTitle}>図鑑コンプリート</Text>
          </View>
          <ProgressBar current={discoveredCount} total={totalBreeds} color={NekoLexColors.progress} />
        </View>

        {/* Achievements */}
        <View style={styles.sectionHeader}>
          <Ionicons name="trophy" size={16} color={NekoLexColors.text} />
          <Text style={styles.sectionTitle}>実績バッジ</Text>
        </View>
        <View style={styles.achievementGrid}>
          {ACHIEVEMENTS.map((a) => {
            const unlocked = discoveredCount >= a.required;
            return (
              <View
                key={a.name}
                style={[
                  styles.achievementCard,
                  unlocked
                    ? [styles.achievementUnlocked, { borderColor: a.color, shadowColor: a.color }]
                    : styles.achievementLocked,
                ]}>
                <View style={[
                  styles.achievementIconWrap,
                  { backgroundColor: unlocked ? a.color + '20' : NekoLexColors.surfaceAlt }
                ]}>
                  <Ionicons
                    name={unlocked ? a.icon : 'lock-closed'}
                    size={24}
                    color={unlocked ? a.color : NekoLexColors.textLight}
                  />
                </View>
                <Text style={[styles.achievementName, !unlocked && styles.lockedText]}>
                  {a.name}
                </Text>
                <Text style={styles.achievementCond}>{a.condition}</Text>
              </View>
            );
          })}
        </View>

        {/* Settings */}
        <View style={styles.sectionHeader}>
          <Ionicons name="settings" size={16} color={NekoLexColors.text} />
          <Text style={styles.sectionTitle}>設定</Text>
        </View>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="volume-high" size={18} color={NekoLexColors.text} />
              <Text style={styles.settingLabel}>サウンド</Text>
            </View>
            <Switch
              value={settings.sound_enabled}
              onValueChange={toggleSound}
              trackColor={{ false: NekoLexColors.surfaceAlt, true: NekoLexColors.progress }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.settingDivider} />
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="phone-portrait" size={18} color={NekoLexColors.text} />
              <Text style={styles.settingLabel}>触覚フィードバック</Text>
            </View>
            <Switch
              value={settings.haptic_enabled}
              onValueChange={toggleHaptic}
              trackColor={{ false: NekoLexColors.surfaceAlt, true: NekoLexColors.progress }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Reset */}
        <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.8}>
          <Ionicons name="trash" size={16} color={NekoLexColors.error} />
          <Text style={styles.resetText}>データをリセット</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 40,
  },

  // Level card
  levelCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: NekoLexColors.feature,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: NekoLexColors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 9,
    padding: 20,
    gap: 18,
  },
  levelCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  catAvatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelInfo: { flex: 1, gap: 8 },
  rankTitle: { fontSize: Typography.subheading.fontSize, fontWeight: '900', color: '#FFFFFF' },
  levelBadge: {
    backgroundColor: NekoLexColors.accent,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: 'rgba(0,0,0,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  levelBadgeText: { fontSize: Typography.body.fontSize, fontWeight: '900', color: NekoLexColors.textInverse },
  xpSection: { gap: 8 },
  xpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLabel: { fontSize: Typography.micro.fontSize, fontWeight: '800', letterSpacing: 1.5, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' },
  xpValue: { fontSize: Typography.caption.fontSize, fontWeight: '700', color: '#FFFFFF' },
  xpBarTrack: {
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.3)',
    position: 'relative',
  },
  xpBarFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: NekoLexColors.accent, borderRadius: 6,
  },
  xpSegment: {
    position: 'absolute', top: 0, bottom: 0,
    width: 2, backgroundColor: 'rgba(0,0,0,0.2)',
  },
  xpPercent: { fontSize: Typography.micro.fontSize, fontWeight: '700', color: 'rgba(255,255,255,0.8)', textAlign: 'right' },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: Typography.bodyLg.fontSize,
    fontWeight: '900',
    color: NekoLexColors.text,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    flexShrink: 0,
    backgroundColor: NekoLexColors.surface,
    borderRadius: 16,
    borderWidth: 2.5,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 6,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIcon: { fontSize: Typography.subheading.fontSize },
  statValue: { fontSize: Typography.heading.fontSize, fontWeight: '900' },
  statLabel: { fontSize: Typography.micro.fontSize, fontWeight: '700', color: NekoLexColors.textLight, textAlign: 'center' },

  // Progress card
  progressCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: NekoLexColors.surface,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: NekoLexColors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 6,
    paddingTop: 14,
    paddingBottom: 4,
  },
  progressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  progressCardTitle: { fontSize: Typography.caption.fontSize, fontWeight: '800', color: NekoLexColors.text },

  // Achievements
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  achievementCard: {
    flexBasis: '47%',
    flexGrow: 1,
    flexShrink: 0,
    borderRadius: 16,
    borderWidth: 2.5,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  achievementUnlocked: {
    backgroundColor: NekoLexColors.surface,
  },
  achievementLocked: {
    backgroundColor: NekoLexColors.surfaceAlt,
    borderColor: NekoLexColors.border,
    shadowColor: '#000000',
  },
  achievementIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementName: { fontSize: Typography.caption.fontSize, fontWeight: '900', color: NekoLexColors.text, textAlign: 'center' },
  achievementCond: { fontSize: Typography.micro.fontSize, fontWeight: '600', color: NekoLexColors.textLight, textAlign: 'center' },
  lockedText: { color: NekoLexColors.textLight },

  // Settings
  settingsCard: {
    marginHorizontal: 16,
    backgroundColor: NekoLexColors.surface,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: NekoLexColors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 6,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingDivider: { height: 1.5, backgroundColor: NekoLexColors.border, marginHorizontal: 16 },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: { fontSize: Typography.body.fontSize, fontWeight: '700', color: NekoLexColors.text },

  // Reset button
  resetButton: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 15,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: NekoLexColors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 4,
  },
  resetText: { fontSize: Typography.body.fontSize, fontWeight: '800', color: NekoLexColors.error },
});
