import { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { NekoLexColors, Spacing, Typography } from '@/constants/theme';
import { ScreenBackground } from '@/components/screen-background';
import { useUser } from '@/contexts/user-context';
import { BreedCard } from '@/components/breed-card';
import { ProgressBar } from '@/components/progress-bar';
import breedsData from '@/data/breeds.json';
import type { Breed } from '@/types';

type Filter = 'all' | 'discovered' | 'undiscovered';
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const allBreeds = breedsData.breeds as Breed[];

const FILTERS: { key: Filter; label: string; icon: IoniconsName }[] = [
  { key: 'all',          label: 'すべて',  icon: 'layers-outline' },
  { key: 'discovered',   label: '発見済み', icon: 'checkmark-circle' },
  { key: 'undiscovered', label: '未発見',   icon: 'help-circle-outline' },
];

export default function PokedexScreen() {
  const { discoveredBreeds } = useUser();
  const [filter, setFilter] = useState<Filter>('all');

  const discoveredCount = Object.keys(discoveredBreeds).length;

  const filteredBreeds = useMemo(() => {
    switch (filter) {
      case 'discovered':   return allBreeds.filter((b) =>  b.id in discoveredBreeds);
      case 'undiscovered': return allBreeds.filter((b) => !(b.id in discoveredBreeds));
      default:             return allBreeds;
    }
  }, [filter, discoveredBreeds]);

  const renderItem = ({ item }: { item: Breed }) => (
    <BreedCard breed={item} discovered={item.id in discoveredBreeds} />
  );

  return (
    <ScreenBackground>

      {/* ── Header ─────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="book" size={24} color={NekoLexColors.text} />
          <View>
            <Text style={styles.headerTitle}>ネコ図鑑</Text>
            <Text style={styles.headerSub}>{discoveredCount}/{allBreeds.length}品種 コレクション中！</Text>
          </View>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countNum}>{discoveredCount}</Text>
          <Text style={styles.countDen}>/{allBreeds.length}</Text>
        </View>
      </View>

      {/* ── Progress bar ───────────────────────── */}
      <View style={styles.progressCard}>
        <ProgressBar
          current={discoveredCount}
          total={allBreeds.length}
          label={`${discoveredCount} / ${allBreeds.length} 品種発見`}
          color={NekoLexColors.progress}
        />
      </View>

      {/* ── Filter pills ───────────────────────── */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.8}>
            <Ionicons
              name={f.icon}
              size={13}
              color={filter === f.key ? '#FFFFFF' : NekoLexColors.textLight}
            />
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredBreeds.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="search" size={36} color={NekoLexColors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>
            {filter === 'discovered' ? 'まだ品種を発見していません！' : '該当する品種がありません'}
          </Text>
          {filter === 'discovered' && (
            <Text style={styles.emptyText}>写真を撮って図鑑を埋めよう！</Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredBreeds}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenBackground>
  );
}

const S = Spacing;

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Header ──────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: S.screenH,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: Typography.heading.fontSize, fontWeight: '900', color: NekoLexColors.text, letterSpacing: -0.3 },
  headerSub:   { fontSize: Typography.micro.fontSize, fontWeight: '600', color: NekoLexColors.textLight, marginTop: 2 },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: NekoLexColors.progress,
    borderRadius: 12,
    borderWidth: S.cardBorder,
    borderColor: NekoLexColors.border,
    shadowColor: NekoLexColors.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  countNum: { fontSize: Typography.subheading.fontSize, fontWeight: '900', color: '#FFFFFF' },
  countDen: { fontSize: Typography.caption.fontSize, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },

  // ── Progress card ────────────────────────────────────────────────
  progressCard: {
    marginHorizontal: S.screenH,
    backgroundColor: NekoLexColors.surface,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: NekoLexColors.border,
    shadowColor: NekoLexColors.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },

  // ── Filter ──────────────────────────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: S.screenH,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: NekoLexColors.surfaceAlt,
    borderWidth: 2.5,
    borderColor: NekoLexColors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  filterPillActive: {
    backgroundColor: NekoLexColors.progress,
    borderColor: NekoLexColors.border,
    shadowColor: NekoLexColors.border,
  },
  filterText:       { fontSize: Typography.caption.fontSize, fontWeight: '700', color: NekoLexColors.textLight },
  filterTextActive: { color: '#FFFFFF' },

  // ── Grid ────────────────────────────────────────────────────────
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },

  // ── Empty state ─────────────────────────────────────────────────
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: NekoLexColors.surfaceAlt,
    borderWidth: 2.5,
    borderColor: NekoLexColors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: { fontSize: Typography.bodyLg.fontSize, fontWeight: '800', color: NekoLexColors.text, textAlign: 'center' },
  emptyText:  { fontSize: Typography.caption.fontSize, fontWeight: '600', color: NekoLexColors.textLight, textAlign: 'center' },
});
