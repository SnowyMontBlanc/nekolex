import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { NekoLexColors, GameCard, GameButton, Typography } from '@/constants/theme';
import { playCorrect, playWrong } from '@/services/sound';
import type { QuizQuestion as QuizQuestionType } from '@/types';

interface Props {
  question: QuizQuestionType;
  onAnswer: (selectedBreedId: string) => void;
  isAnswered: boolean;
  selectedAnswer: string | null;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export function QuizQuestion({ question, onAnswer, isAnswered, selectedAnswer }: Props) {
  const [localSelected, setLocalSelected] = useState<string | null>(null);

  const selected = isAnswered ? selectedAnswer : localSelected;
  const isCorrect = selectedAnswer === question.correct_breed_id;

  const handleConfirm = () => {
    if (localSelected && !isAnswered) {
      if (localSelected === question.correct_breed_id) {
        playCorrect();
      } else {
        playWrong();
      }
      onAnswer(localSelected);
    }
  };

  const getOptionState = (breedId: string): 'default' | 'selected' | 'correct' | 'wrong' => {
    if (!isAnswered) {
      return breedId === localSelected ? 'selected' : 'default';
    }
    if (breedId === question.correct_breed_id) return 'correct';
    if (breedId === selectedAnswer && breedId !== question.correct_breed_id) return 'wrong';
    return 'default';
  };

  const optionStyles: Record<string, { container: object; label: object; text: object }> = {
    default: {
      container: styles.optionDefault,
      label: styles.optionLabelDefault,
      text: styles.optionTextDefault,
    },
    selected: {
      container: styles.optionSelected,
      label: styles.optionLabelSelected,
      text: styles.optionTextSelected,
    },
    correct: {
      container: styles.optionCorrect,
      label: styles.optionLabelCorrect,
      text: styles.optionTextCorrect,
    },
    wrong: {
      container: styles.optionWrong,
      label: styles.optionLabelWrong,
      text: styles.optionTextWrong,
    },
  };

  return (
    <View style={styles.container}>
      {/* Question box */}
      <View style={styles.questionBox}>
        <Text style={styles.questionLabel}>もんだい</Text>
        <Text style={styles.questionText}>{question.question_text}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => {
          const state = getOptionState(option.breed_id);
          const s = optionStyles[state];

          return (
            <TouchableOpacity
              key={option.breed_id}
              style={[styles.optionBase, s.container]}
              onPress={() => !isAnswered && setLocalSelected(option.breed_id)}
              activeOpacity={isAnswered ? 1 : 0.8}
              disabled={isAnswered}>
              <View style={[styles.optionLabel, s.label]}>
                <Text style={[styles.optionLabelText, s.label]}>{OPTION_LABELS[index]}</Text>
              </View>
              <Text style={[styles.optionText, s.text]} numberOfLines={2}>
                {option.label}
              </Text>
              {isAnswered && option.breed_id === question.correct_breed_id && (
                <Ionicons name="checkmark-circle" size={20} color={NekoLexColors.success} />
              )}
              {isAnswered &&
                option.breed_id === selectedAnswer &&
                option.breed_id !== question.correct_breed_id && (
                  <Ionicons name="close-circle" size={20} color={NekoLexColors.error} />
                )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Confirm button */}
      {!isAnswered && (
        <TouchableOpacity
          style={[styles.confirmButton, !localSelected && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={!localSelected}>
          <Text style={styles.confirmText}>こたえる！</Text>
        </TouchableOpacity>
      )}

      {/* Feedback */}
      {isAnswered && (
        <View style={[styles.feedbackBox, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <Ionicons
            name={isCorrect ? 'happy' : 'sad-outline'}
            size={32}
            color={isCorrect ? NekoLexColors.success : NekoLexColors.error}
          />
          <View>
            <Text style={[styles.feedbackTitle, { color: isCorrect ? NekoLexColors.success : NekoLexColors.error }]}>
              {isCorrect ? 'せいかい！' : 'ざんねん…'}
            </Text>
            {!isCorrect && (
              <Text style={styles.feedbackHint}>
                正解: {question.options.find((o) => o.breed_id === question.correct_breed_id)?.label}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 14,
  },
  questionBox: {
    ...GameCard,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  questionLabel: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: NekoLexColors.primary,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: Typography.bodyLg.fontSize,
    fontWeight: '700',
    color: NekoLexColors.text,
    textAlign: 'center',
    lineHeight: 27,
  },
  optionsContainer: {
    gap: 10,
  },
  optionBase: {
    borderRadius: 14,
    borderWidth: 2.5,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionDefault: {
    backgroundColor: NekoLexColors.surface,
    borderColor: NekoLexColors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 3,
  },
  optionSelected: {
    backgroundColor: NekoLexColors.feature + '18',
    borderColor: NekoLexColors.feature,
    shadowColor: NekoLexColors.feature,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  optionCorrect: {
    backgroundColor: NekoLexColors.successLight,
    borderColor: NekoLexColors.success,
    shadowColor: NekoLexColors.success,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  optionWrong: {
    backgroundColor: NekoLexColors.errorLight,
    borderColor: NekoLexColors.error,
    shadowColor: NekoLexColors.error,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabelDefault: {
    backgroundColor: NekoLexColors.surfaceAlt,
  },
  optionLabelSelected: {
    backgroundColor: NekoLexColors.feature,
  },
  optionLabelCorrect: {
    backgroundColor: NekoLexColors.success,
  },
  optionLabelWrong: {
    backgroundColor: NekoLexColors.error,
  },
  optionLabelText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    lineHeight: 20,
  },
  optionTextDefault: { color: NekoLexColors.text },
  optionTextSelected: { color: NekoLexColors.feature, fontWeight: '700' },
  optionTextCorrect: { color: NekoLexColors.success, fontWeight: '700' },
  optionTextWrong: { color: NekoLexColors.error, fontWeight: '700' },
  confirmButton: {
    ...GameButton,
    backgroundColor: NekoLexColors.primary,
  },
  confirmButtonDisabled: {
    opacity: 0.35,
  },
  confirmText: {
    fontSize: Typography.bodyLg.fontSize,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  feedbackBox: {
    borderRadius: 16,
    borderWidth: 2.5,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  feedbackCorrect: {
    backgroundColor: NekoLexColors.successLight,
    borderColor: NekoLexColors.success,
  },
  feedbackWrong: {
    backgroundColor: NekoLexColors.errorLight,
    borderColor: NekoLexColors.error,
  },
  feedbackTitle: {
    fontSize: Typography.subheading.fontSize,
    fontWeight: '900',
  },
  feedbackHint: {
    fontSize: Typography.caption.fontSize,
    color: NekoLexColors.textLight,
    marginTop: 2,
    fontWeight: '600',
  },
});
