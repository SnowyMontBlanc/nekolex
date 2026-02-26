import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import Ionicons from '@expo/vector-icons/Ionicons';
import { NekoLexColors, Typography } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';
import breedsData from '@/data/breeds.json';
import type { Breed } from '@/types';

const allBreeds = breedsData.breeds as Breed[];
const breedMap = new Map(allBreeds.map((b) => [b.id, b]));

const difficultyLabel = (d: 1 | 2 | 3) => {
  const stars = '\u2605'.repeat(d) + '\u2606'.repeat(3 - d);
  const labels = { 1: '簡単', 2: '普通', 3: '難しい' } as const;
  return `${stars} ${labels[d]}`;
};

const sizeLabel = (s: string) => {
  const map: Record<string, string> = { small: '小型', medium: '中型', large: '大型' };
  return map[s] ?? s;
};

export default function BreedDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { discoveredBreeds } = useUser();

  const breed = breedMap.get(id ?? '');
  const userProgress = discoveredBreeds[id ?? ''];

  if (!breed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>品種が見つかりませんでした</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageSection}>
          <Ionicons name="paw" size={80} color={NekoLexColors.primary} />
        </View>

        {/* Name */}
        <View style={styles.nameSection}>
          <Text style={styles.nameJa}>{breed.name_ja}</Text>
          <Text style={styles.nameEn}>{breed.name_en}</Text>
        </View>

        {/* Meta Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{sizeLabel(breed.size)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{breed.origin}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{difficultyLabel(breed.difficulty)}</Text>
          </View>
        </View>

        {/* Discovery info */}
        {userProgress && (
          <View style={styles.discoveryBanner}>
            <Text style={styles.discoveryText}>
              発見日: {new Date(userProgress.discovered_at).toLocaleDateString('ja-JP')}
            </Text>
            <Text style={styles.discoveryText}>
              習熟度: {userProgress.mastery_level}/5 | 正解数: {userProgress.correct_answers}
            </Text>
          </View>
        )}

        {/* Description */}
        <Section title="説明">
          <Text style={styles.bodyText}>{breed.description}</Text>
        </Section>

        {/* Characteristics */}
        <Section title="特徴">
          {breed.characteristics.map((c, i) => (
            <BulletItem key={i} text={c} />
          ))}
        </Section>

        {/* Temperament */}
        <Section title="性格">
          {breed.temperament.map((t, i) => (
            <BulletItem key={i} text={t} />
          ))}
        </Section>

        {/* Distinguishing Features */}
        <Section title="見分けポイント">
          {breed.distinguishing_features.map((f, i) => (
            <BulletItem key={i} text={f} />
          ))}
        </Section>

        {/* Similar Breeds */}
        {breed.similar_breeds.length > 0 && (
          <Section title="似ている品種">
            <View style={styles.similarRow}>
              {breed.similar_breeds.map((sId) => {
                const similar = breedMap.get(sId);
                if (!similar) return null;
                return (
                  <TouchableOpacity
                    key={sId}
                    style={styles.similarCard}
                    onPress={() => router.push(`/breed/${sId}`)}>
                    <Ionicons name="paw" size={30} color={NekoLexColors.textLight} />
                    <Text style={styles.similarName} numberOfLines={1}>
                      {similar.name_ja}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>
        )}

        {/* Care Notes */}
        <Section title="飼育上の注意">
          <Text style={styles.bodyText}>{breed.care_notes}</Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function BulletItem({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>{'\u2022'}</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NekoLexColors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...Typography.body,
    color: NekoLexColors.error,
  },
  scroll: {
    paddingBottom: 32,
  },
  imageSection: {
    height: 200,
    backgroundColor: NekoLexColors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catEmoji: {
    fontSize: 80,
  },
  nameSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  nameJa: {
    fontSize: Typography.heading.fontSize, fontWeight: '800' as const, letterSpacing: -0.5,
    color: NekoLexColors.text,
  },
  nameEn: {
    ...Typography.body,
    color: NekoLexColors.textLight,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  metaItem: {
    backgroundColor: NekoLexColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  metaLabel: {
    ...Typography.caption,
    color: NekoLexColors.text,
  },
  discoveryBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: NekoLexColors.secondary + '20',
    borderRadius: 8,
  },
  discoveryText: {
    ...Typography.caption,
    color: NekoLexColors.text,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: Typography.subheading.fontSize, fontWeight: '700' as const,
    color: NekoLexColors.text,
    marginBottom: 8,
  },
  bodyText: {
    ...Typography.body,
    color: NekoLexColors.text,
    lineHeight: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    paddingLeft: 4,
    marginBottom: 4,
  },
  bullet: {
    ...Typography.body,
    color: NekoLexColors.primary,
    marginRight: 8,
    lineHeight: 24,
  },
  bulletText: {
    ...Typography.body,
    color: NekoLexColors.text,
    flex: 1,
    lineHeight: 24,
  },
  similarRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  similarCard: {
    backgroundColor: NekoLexColors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  similarEmoji: {
    fontSize: Typography.display.fontSize,
    marginBottom: 4,
  },
  similarName: {
    ...Typography.caption,
    color: NekoLexColors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
});
