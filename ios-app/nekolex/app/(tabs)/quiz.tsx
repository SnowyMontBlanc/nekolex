import { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { NekoLexColors, GameCard, Typography } from '@/constants/theme';
import { ScreenBackground } from '@/components/screen-background';
import { useUser } from '@/contexts/user-context';
import { QuizQuestion } from '@/components/quiz-question';
import { generateQuiz } from '@/utils/quiz-generator';
import type { QuizDifficulty, QuizQuestion as QuizQuestionType } from '@/types';

type QuizState = 'select' | 'playing';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const DIFFICULTIES: {
  key: QuizDifficulty;
  icon: IoniconsName;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}[] = [
  { key: 'easy',   icon: 'leaf',        label: '初級',  description: '異なる品種の見分け',     color: NekoLexColors.success, bgColor: NekoLexColors.successLight },
  { key: 'medium', icon: 'flame',       label: '中級',  description: '似た特徴の品種を含む',   color: NekoLexColors.warning, bgColor: NekoLexColors.warningLight },
  { key: 'hard',   icon: 'skull',       label: '上級',  description: '酷似品種の違いを問う',   color: NekoLexColors.error,   bgColor: NekoLexColors.errorLight },
];

export default function QuizScreen() {
  const router = useRouter();
  const { discoveredBreeds } = useUser();
  const discoveredCount = Object.keys(discoveredBreeds).length;
  const needsMoreBreeds = discoveredCount < 4;

  const [state, setState] = useState<QuizState>('select');
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('easy');
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);

  const startQuiz = useCallback(
    (selectedDifficulty: QuizDifficulty) => {
      const discoveredIds = Object.keys(discoveredBreeds);
      const generated = generateQuiz(selectedDifficulty, discoveredIds, 5);
      setDifficulty(selectedDifficulty);
      setQuestions(generated);
      setCurrentIndex(0);
      setAnswers(new Array(generated.length).fill(null));
      setScore(0);
      setIsAnswered(false);
      setState('playing');
    },
    [discoveredBreeds],
  );

  const handleAnswer = useCallback(
    (selectedBreedId: string) => {
      const question = questions[currentIndex];
      const correct = selectedBreedId === question.correct_breed_id;
      const newAnswers = [...answers];
      newAnswers[currentIndex] = selectedBreedId;
      setAnswers(newAnswers);
      if (correct) setScore((prev) => prev + 1);
      setIsAnswered(true);
    },
    [questions, currentIndex, answers],
  );

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsAnswered(false);
    } else {
      router.push({
        pathname: '/quiz-result',
        params: {
          difficulty,
          score: String(score),
          total: String(questions.length),
          questions: JSON.stringify(questions),
          answers: JSON.stringify(answers),
        },
      });
      setState('select');
      setCurrentIndex(0);
      setAnswers([]);
      setScore(0);
      setIsAnswered(false);
    }
  }, [currentIndex, questions, answers, difficulty, score, router]);

  const handleBack = useCallback(() => {
    setState('select');
    setCurrentIndex(0);
    setAnswers([]);
    setScore(0);
    setIsAnswered(false);
  }, []);

  // ── Difficulty selection ──────────────────────────────────────────────────
  if (state === 'select') {
    return (
      <ScreenBackground>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Ionicons name="game-controller" size={26} color={NekoLexColors.text} />
              <View>
                <Text style={styles.headerTitle}>復習クイズ</Text>
                <Text style={styles.headerSub}>発見した品種を復習しよう！</Text>
              </View>
            </View>
          </View>

          {/* Discovered count badge */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="paw" size={24} color={NekoLexColors.primary} />
            </View>
            <View>
              <Text style={styles.infoLabel}>発見済み品種</Text>
              <Text style={styles.infoValue}>{discoveredCount} 品種</Text>
            </View>
          </View>

          {needsMoreBreeds ? (
            <View style={styles.warningCard}>
              <Ionicons name="warning" size={44} color={NekoLexColors.warning} />
              <Text style={styles.warningTitle}>品種が足りません！</Text>
              <Text style={styles.warningText}>
                クイズには最低4品種の発見が必要です。{'\n'}
                あと{4 - discoveredCount}品種、発見しましょう！
              </Text>
              <TouchableOpacity
                style={styles.goDiscoverButton}
                onPress={() => router.push('/camera')}
                activeOpacity={0.85}>
                <Ionicons name="camera" size={18} color="#FFFFFF" />
                <Text style={styles.goDiscoverText}>品種を発見しに行く</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>難易度を選ぼう</Text>
              {DIFFICULTIES.map((d) => (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.diffCard, { backgroundColor: d.bgColor, borderColor: d.color }]}
                  onPress={() => startQuiz(d.key)}
                  activeOpacity={0.85}>
                  <View style={[styles.diffIconWrap, { backgroundColor: d.color }]}>
                    <Ionicons name={d.icon} size={22} color="#FFFFFF" />
                  </View>
                  <View style={styles.diffInfo}>
                    <Text style={[styles.diffLabel, { color: d.color }]}>{d.label}</Text>
                    <Text style={styles.diffDesc}>{d.description}</Text>
                  </View>
                  <View style={[styles.diffStart, { backgroundColor: d.color }]}>
                    <Ionicons name="play" size={14} color="#FFFFFF" />
                    <Text style={styles.diffStartText}>START</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </ScreenBackground>
    );
  }

  // ── Quiz playing ──────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex];

  return (
    <ScreenBackground>
      {/* Quiz header */}
      <View style={styles.quizHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.8}>
          <Ionicons name="close" size={18} color={NekoLexColors.text} />
        </TouchableOpacity>

        <View style={styles.quizMeta}>
          <Text style={styles.quizProgress}>
            {currentIndex + 1} / {questions.length}
          </Text>
          <View style={styles.scoreRow}>
            <Ionicons name="star" size={13} color={NekoLexColors.reward} />
            <Text style={styles.quizScore}>{score}正解</Text>
          </View>
        </View>

        {/* Difficulty badge */}
        {(() => {
          const d = DIFFICULTIES.find((x) => x.key === difficulty)!;
          return (
            <View style={[styles.quizDiffBadge, { backgroundColor: d.bgColor, borderColor: d.color }]}>
              <Text style={[styles.quizDiffText, { color: d.color }]}>{d.label}</Text>
            </View>
          );
        })()}
      </View>

      {/* Step progress bar */}
      <View style={styles.stepBarTrack}>
        {questions.map((_, i) => (
          <View
            key={i}
            style={[
              styles.stepDot,
              i < currentIndex && styles.stepDotDone,
              i === currentIndex && styles.stepDotActive,
            ]}
          />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.quizScroll}>
        <QuizQuestion
          key={currentIndex}
          question={currentQuestion}
          onAnswer={handleAnswer}
          isAnswered={isAnswered}
          selectedAnswer={answers[currentIndex]}
        />

        {isAnswered && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.nextButtonText}>
              {currentIndex < questions.length - 1 ? '次の問題へ →' : '結果を見る！'}
            </Text>
          </TouchableOpacity>
        )}
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

  // Selection header
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: Typography.display.fontSize,
    fontWeight: '900',
    color: NekoLexColors.text,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: NekoLexColors.textLight,
    marginTop: 1,
  },

  // Info card
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: NekoLexColors.surface,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: NekoLexColors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 6,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: NekoLexColors.primary + '15',
    borderWidth: 2,
    borderColor: NekoLexColors.primary + '35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: { fontSize: Typography.micro.fontSize, fontWeight: '700', color: NekoLexColors.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: Typography.subheading.fontSize, fontWeight: '900', color: NekoLexColors.text, marginTop: 2 },

  // Warning card
  warningCard: {
    marginHorizontal: 16,
    backgroundColor: NekoLexColors.surfaceAlt,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: NekoLexColors.warning,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 6,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  warningTitle: { fontSize: Typography.subheading.fontSize, fontWeight: '900', color: NekoLexColors.text },
  warningText: { fontSize: Typography.caption.fontSize, fontWeight: '600', color: NekoLexColors.textLight, textAlign: 'center', lineHeight: 21 },
  goDiscoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: NekoLexColors.primary,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: NekoLexColors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 4,
  },
  goDiscoverText: { fontSize: Typography.body.fontSize, fontWeight: '900', color: '#FFFFFF' },

  // Section title
  sectionTitle: {
    fontSize: Typography.bodyLg.fontSize,
    fontWeight: '900',
    color: NekoLexColors.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },

  // Difficulty cards
  diffCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 7,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  diffIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: NekoLexColors.border,
  },
  diffInfo: { flex: 1 },
  diffLabel: { fontSize: Typography.subheading.fontSize, fontWeight: '900' },
  diffDesc: { fontSize: Typography.caption.fontSize, fontWeight: '600', color: NekoLexColors.textLight, marginTop: 2 },
  diffStart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: NekoLexColors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  diffStartText: { fontSize: Typography.micro.fontSize, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },

  // Quiz playing header
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: NekoLexColors.surfaceAlt,
    borderWidth: 2,
    borderColor: NekoLexColors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizMeta: { flex: 1, gap: 2 },
  quizProgress: { fontSize: Typography.bodyLg.fontSize, fontWeight: '900', color: NekoLexColors.text },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  quizScore: { fontSize: Typography.caption.fontSize, fontWeight: '700', color: NekoLexColors.reward },
  quizDiffBadge: {
    borderRadius: 8,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  quizDiffText: { fontSize: Typography.micro.fontSize, fontWeight: '900' },

  // Step dots
  stepBarTrack: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
  },
  stepDot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: NekoLexColors.border,
    borderWidth: 1.5,
    borderColor: NekoLexColors.border,
  },
  stepDotDone: {
    backgroundColor: NekoLexColors.success,
    borderColor: NekoLexColors.success,
  },
  stepDotActive: {
    backgroundColor: NekoLexColors.primary,
    borderColor: NekoLexColors.primary,
  },

  quizScroll: { paddingBottom: 32 },
  nextButton: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: NekoLexColors.game,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: NekoLexColors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 7,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: { fontSize: Typography.bodyLg.fontSize, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.2 },
});
