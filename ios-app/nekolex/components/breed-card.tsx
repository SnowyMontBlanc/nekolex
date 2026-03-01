import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NekoLexColors, DifficultyColors, Typography } from '@/constants/theme';
import type { Breed } from '@/types';

interface BreedCardProps {
  breed: Breed;
  discovered: boolean;
}

const CAT_EMOJIS: Record<string, string> = {
  scottish_fold: '😽',
  american_shorthair: '🐱',
  british_shorthair: '😸',
  maine_coon: '🦁',
  ragdoll: '😻',
  norwegian_forest_cat: '🐾',
  persian: '👑',
  russian_blue: '💙',
  siamese: '😺',
  bengal: '🐆',
  abyssinian: '🦊',
  munchkin: '🐇',
  sphynx: '👽',
  turkish_angora: '🤍',
  exotic_shorthair: '🥰',
  somali: '🦔',
  tonkinese: '💜',
  burmese: '☕',
  singapura: '🌟',
  mixed_breed: '🎌',
};

const DIFFICULTY_LABEL: Record<1 | 2 | 3, string> = {
  1: 'かんたん',
  2: 'ふつう',
  3: 'むずかしい',
};

export function BreedCard({ breed, discovered }: BreedCardProps) {
  const router = useRouter();
  const catEmoji = CAT_EMOJIS[breed.id] ?? '🐱';
  const diffColors = DifficultyColors[breed.difficulty];

  const handlePress = () => {
    if (discovered) {
      router.push(`/breed/${breed.id}`);
    }
  };

  if (!discovered) {
    return (
      <View style={[styles.card, styles.undiscoveredCard]}>
        <View style={styles.silhouette}>
          <Ionicons name="help" size={22} color={NekoLexColors.textLight} />
        </View>
        <Text style={styles.undiscoveredName}>???</Text>
        <Text style={styles.silhouetteHint}>みつけよう!</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      {/* Color accent strip at top */}
      <View style={[styles.cardStrip, { backgroundColor: diffColors.bg }]} />

      <View style={[styles.iconContainer, { borderColor: diffColors.border, backgroundColor: diffColors.bg }]}>
        <Text style={styles.catEmoji}>{catEmoji}</Text>
      </View>

      <Text style={styles.breedName} numberOfLines={2}>
        {breed.name_ja}
      </Text>

      {/* Difficulty badge */}
      <View style={[styles.diffBadge, { backgroundColor: diffColors.bg, borderColor: diffColors.border }]}>
        <Text style={[styles.diffText, { color: diffColors.text }]}>
          {DIFFICULTY_LABEL[breed.difficulty]}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: NekoLexColors.surface,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: NekoLexColors.border,
    shadowColor: '#C77DFF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    alignItems: 'center',
    minHeight: 140,
  },
  undiscoveredCard: {
    backgroundColor: NekoLexColors.surfaceAlt,
    borderColor: NekoLexColors.border,
    justifyContent: 'center',
    gap: 4,
  },
  cardStrip: {
    width: '100%',
    height: 6,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  catEmoji: {
    fontSize: Typography.display.fontSize,
  },
  breedName: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '700',
    color: NekoLexColors.text,
    textAlign: 'center',
    paddingHorizontal: 4,
    lineHeight: 15,
    marginBottom: 6,
  },
  diffBadge: {
    borderRadius: 6,
    borderWidth: 1.5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 8,
  },
  diffText: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  silhouette: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: NekoLexColors.surfaceAlt,
    borderWidth: 2.5,
    borderColor: NekoLexColors.border,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  questionMark: {
    fontSize: Typography.heading.fontSize,
    color: NekoLexColors.textLight,
    fontWeight: '900',
  },
  undiscoveredName: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '700',
    color: NekoLexColors.textLight,
    textAlign: 'center',
  },
  silhouetteHint: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '700',
    color: NekoLexColors.textLight,
    textAlign: 'center',
  },
});
