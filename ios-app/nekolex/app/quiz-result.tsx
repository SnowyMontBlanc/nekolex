import { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { NekoLexColors, Typography } from '@/constants/theme';
import { ScreenBackground } from '@/components/screen-background';
import { useUser } from '@/contexts/user-context';
import { hapticSuccess, hapticError, hapticLight } from '@/services/haptics';
import { LevelUpAnimation } from '@/components/animations';
import { XP_REWARDS } from '@/utils/xp-calculator';
import breedsData from '@/data/breeds.json';
import type { Breed, QuizDifficulty, QuizQuestion } from '@/types';

const breedMap = new Map((breedsData.breeds as Breed[]).map((b) => [b.id, b]));

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
type ResultTier = { icon: IoniconsName; title: string; color: string; bgColor: string; borderColor: string };

function getResultTier(percentage: number, isPerfect: boolean): ResultTier {
  if (isPerfect)        return { icon: 'trophy',      title: 'パーフェクト！', color: NekoLexColors.reward,   bgColor: NekoLexColors.warningLight, borderColor: NekoLexColors.warning };
  if (percentage >= 80) return { icon: 'star',         title: 'すばらしい！',  color: NekoLexColors.success, bgColor: NekoLexColors.successLight, borderColor: NekoLexColors.success };
  if (percentage >= 60) return { icon: 'thumbs-up',    title: 'よくできた！',  color: NekoLexColors.progress, bgColor: NekoLexColors.progressLight, borderColor: NekoLexColors.progress };
  if (percentage >= 40) return { icon: 'alert-circle',  title: 'まずまず！',   color: NekoLexColors.warning,  bgColor: NekoLexColors.warningLight, borderColor: NekoLexColors.warning };
  return                       { icon: 'refresh',      title: 'がんばろう！',  color: NekoLexColors.error,   bgColor: NekoLexColors.errorLight,   borderColor: NekoLexColors.error };
}

export default function QuizResultScreen() {
  const router = useRouter();
  const { completeQuiz, updateBreedReview, pendingLevelUp, clearPendingLevelUp } = useUser();
  const params = useLocalSearchParams<{
    difficulty: string; score: string; total: string; questions: string; answers: string;
  }>();

  const difficulty = (params.difficulty ?? 'easy') as QuizDifficulty;
  const score = parseInt(params.score ?? '0', 10);
  const total = parseInt(params.total ?? '5', 10);
  const questions: QuizQuestion[] = params.questions ? JSON.parse(params.questions) : [];
  const answers: (string | null)[] = params.answers ? JSON.parse(params.answers) : [];

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const isPerfect = score === total && total > 0;
  const xpFromCorrect = score * XP_REWARDS.QUIZ_CORRECT;
  const xpBonus = isPerfect ? XP_REWARDS.QUIZ_PERFECT : 0;
  const totalXp = xpFromCorrect + xpBonus;
  const tier = getResultTier(percentage, isPerfect);

  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current || questions.length === 0) return;
    savedRef.current = true;

    const saveResult = async () => {
      // Haptic feedback based on score
      if (isPerfect || percentage >= 80) {
        hapticSuccess();
      } else if (percentage < 40) {
        hapticError();
      } else {
        hapticLight();
      }

      await completeQuiz({
        date: new Date().toISOString(),
        difficulty,
        questions: total,
        correct: score,
        xp_gained: totalXp,
      });
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const ans = answers[i];
        if (ans) await updateBreedReview(q.correct_breed_id, ans === q.correct_breed_id);
      }
    };
    saveResult();
  }, []);

  return (
    <ScreenBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>クイズ結果</Text>

        {/* Result card */}
        <View style={[styles.resultCard, { backgroundColor: tier.bgColor, borderColor: tier.borderColor }]}>
          <View style={[styles.resultIconWrap, { backgroundColor: tier.color }]}>
            <Ionicons name={tier.icon} size={36} color="#FFFFFF" />
          </View>
          <Text style={[styles.resultTitle, { color: tier.color }]}>{tier.title}</Text>

          {/* Score ring */}
          <View style={[styles.scoreRing, { borderColor: tier.borderColor }]}>
            <Text style={[styles.scoreBig, { color: tier.color }]}>{score}</Text>
            <Text style={styles.scoreSlash}>/</Text>
            <Text style={styles.scoreTotal}>{total}</Text>
          </View>
          <Text style={[styles.scoreLabel, { color: tier.color }]}>正解</Text>

          {/* Progress bar */}
          <View style={styles.scoreBarTrack}>
            <View style={[styles.scoreBarFill, { width: `${percentage}%`, backgroundColor: tier.color }]} />
            {[25, 50, 75].map((m) => (
              <View key={m} style={[styles.scoreBarSegment, { left: `${m}%` as unknown as number }]} />
            ))}
          </View>
          <Text style={[styles.percentText, { color: tier.color }]}>{percentage}%</Text>
        </View>

        {/* XP card */}
        <View style={styles.xpCard}>
          <View style={styles.xpLeft}>
            <Text style={styles.xpLabel}>獲得XP</Text>
            <Text style={styles.xpTotal}>+{totalXp} XP</Text>
          </View>
          <View style={styles.xpRight}>
            <Text style={styles.xpDetail}>正解 {score}問 × {XP_REWARDS.QUIZ_CORRECT}XP</Text>
            {isPerfect && (
              <View style={styles.xpBonusRow}>
                <Ionicons name="star" size={12} color={NekoLexColors.reward} />
                <Text style={styles.xpBonus}>パーフェクトボーナス +{XP_REWARDS.QUIZ_PERFECT}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Per-question results */}
        <Text style={styles.sectionTitle}>問題別の結果</Text>
        <View style={styles.questionList}>
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === q.correct_breed_id;
            const correctBreed = breedMap.get(q.correct_breed_id);
            const userBreed = userAnswer ? breedMap.get(userAnswer) : null;

            return (
              <View key={i} style={[styles.questionResult, isCorrect ? styles.questionResultCorrect : styles.questionResultWrong]}>
                <View style={[styles.qNumBadge, { backgroundColor: isCorrect ? NekoLexColors.success : NekoLexColors.error }]}>
                  <Text style={styles.qNumText}>Q{i + 1}</Text>
                </View>
                <View style={styles.questionInfo}>
                  {isCorrect ? (
                    <Text style={styles.correctText}>{correctBreed?.name_ja ?? q.correct_breed_id}</Text>
                  ) : (
                    <>
                      <Text style={styles.wrongText}>{userBreed?.name_ja ?? userAnswer ?? '未回答'}</Text>
                      <Text style={styles.correctHint}>正解: {correctBreed?.name_ja ?? q.correct_breed_id}</Text>
                    </>
                  )}
                </View>
                <Ionicons
                  name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={isCorrect ? NekoLexColors.success : NekoLexColors.error}
                />
              </View>
            );
          })}
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.replace('/(tabs)/quiz')}
            activeOpacity={0.85}>
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.retryText}>もう一度！</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.85}>
            <Ionicons name="home" size={18} color={NekoLexColors.text} />
            <Text style={styles.homeText}>ホームへ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {pendingLevelUp !== null && (
        <LevelUpAnimation newLevel={pendingLevelUp} onComplete={clearPendingLevelUp} />
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: { paddingBottom: 40 },

  header: {
    fontSize: Typography.display.fontSize,
    fontWeight: '900',
    color: NekoLexColors.text,
    textAlign: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    letterSpacing: -0.3,
  },

  // Result card
  resultCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 0,
    elevation: 9,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  resultIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: NekoLexColors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 5,
  },
  resultTitle: { fontSize: Typography.display.fontSize, fontWeight: '900' },
  scoreRing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderWidth: 3,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 4,
    marginTop: 4,
  },
  scoreBig: { fontSize: Typography.jumbo.fontSize, fontWeight: '900' },
  scoreSlash: { fontSize: Typography.heading.fontSize, fontWeight: '700', color: NekoLexColors.textLight },
  scoreTotal: { fontSize: Typography.display.fontSize, fontWeight: '700', color: NekoLexColors.textLight },
  scoreLabel: { fontSize: Typography.caption.fontSize, fontWeight: '800', letterSpacing: 0.5 },
  scoreBarTrack: {
    width: '100%',
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    position: 'relative',
    marginTop: 4,
  },
  scoreBarFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 6,
  },
  scoreBarSegment: {
    position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  percentText: { fontSize: Typography.caption.fontSize, fontWeight: '800' },

  // XP card
  xpCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: NekoLexColors.accent + '30',
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: NekoLexColors.warning,
    shadowColor: NekoLexColors.warning,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  xpLeft: { flex: 1 },
  xpLabel: { fontSize: Typography.micro.fontSize, fontWeight: '800', color: NekoLexColors.warning, textTransform: 'uppercase', letterSpacing: 0.5 },
  xpTotal: { fontSize: Typography.display.fontSize, fontWeight: '900', color: NekoLexColors.reward, marginTop: 2 },
  xpRight: { gap: 4 },
  xpDetail: { fontSize: Typography.micro.fontSize, fontWeight: '600', color: NekoLexColors.textLight, textAlign: 'right' },
  xpBonusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  xpBonus: { fontSize: Typography.micro.fontSize, fontWeight: '800', color: NekoLexColors.reward, textAlign: 'right' },

  // Section title
  sectionTitle: {
    fontSize: Typography.bodyLg.fontSize,
    fontWeight: '900',
    color: NekoLexColors.text,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },

  // Question results
  questionList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  questionResult: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2.5,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    padding: 12,
    gap: 12,
  },
  questionResultCorrect: {
    backgroundColor: NekoLexColors.successLight,
    borderColor: NekoLexColors.success,
    shadowColor: NekoLexColors.success,
  },
  questionResultWrong: {
    backgroundColor: NekoLexColors.errorLight,
    borderColor: NekoLexColors.error,
    shadowColor: NekoLexColors.error,
  },
  qNumBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qNumText: { fontSize: Typography.caption.fontSize, fontWeight: '900', color: '#FFFFFF' },
  questionInfo: { flex: 1 },
  correctText: { fontSize: Typography.body.fontSize, fontWeight: '700', color: NekoLexColors.success },
  wrongText: { fontSize: Typography.body.fontSize, fontWeight: '700', color: NekoLexColors.error },
  correctHint: { fontSize: Typography.micro.fontSize, fontWeight: '600', color: NekoLexColors.textLight, marginTop: 2 },
  resultIcon: { fontSize: Typography.subheading.fontSize },

  // Buttons
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: NekoLexColors.primary,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: NekoLexColors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 7,
    paddingVertical: 16,
  },
  retryText: { fontSize: Typography.body.fontSize, fontWeight: '900', color: '#FFFFFF' },
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: NekoLexColors.surface,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: NekoLexColors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 7,
    paddingVertical: 16,
  },
  homeText: { fontSize: Typography.body.fontSize, fontWeight: '900', color: NekoLexColors.text },
});
