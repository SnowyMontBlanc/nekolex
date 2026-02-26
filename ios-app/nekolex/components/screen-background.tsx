import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StyleProp, ViewStyle } from 'react-native';

import { NekoLexColors } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ScreenBackground({ children, style }: Props) {
  return (
    <SafeAreaView style={[styles.root, style]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Ambient neon glows — large, very subtle */}
        <View style={styles.glowBrand} />
        <View style={styles.glowProgress} />

        {/* Diagonal energy stripes */}
        <View style={styles.stripe1} />
        <View style={styles.stripe2} />

        {/* Structural rule line */}
        <View style={styles.rule} />
      </View>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NekoLexColors.background,
  },

  // ── Ambient neon glow circles ────────────────────────────────────────────
  // Large, very low opacity. Creates colour atmosphere without being visible.
  glowBrand: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    top: -120,
    left: -100,
    backgroundColor: NekoLexColors.brand,
    opacity: 0.09,
  },
  glowProgress: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: -80,
    right: -80,
    backgroundColor: NekoLexColors.progress,
    opacity: 0.07,
  },

  // ── Diagonal stripes ─────────────────────────────────────────────────────
  // Sharp edges (no borderRadius). Racing stripe / editorial energy.
  stripe1: {
    position: 'absolute',
    width: 800,
    height: 80,
    backgroundColor: NekoLexColors.brand,
    opacity: 0.04,
    top: -10,
    left: -200,
    transform: [{ rotate: '-8deg' }],
  },
  stripe2: {
    position: 'absolute',
    width: 600,
    height: 40,
    backgroundColor: NekoLexColors.progress,
    opacity: 0.035,
    bottom: 120,
    right: -150,
    transform: [{ rotate: '-8deg' }],
  },

  // Thin vertical rule — design-grid reference line
  rule: {
    position: 'absolute',
    width: 1,
    height: '55%',
    backgroundColor: NekoLexColors.brand,
    opacity: 0.06,
    top: '22%',
    right: 22,
  },
});
