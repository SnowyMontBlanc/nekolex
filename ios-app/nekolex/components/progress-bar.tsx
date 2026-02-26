import { StyleSheet, View, Text } from 'react-native';
import { NekoLexColors, Typography } from '@/constants/theme';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  color?: string;
  height?: number;
}

export function ProgressBar({
  current,
  total,
  label,
  color = NekoLexColors.secondary,
  height = 18,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label ?? `${current} / ${total} 品種発見`}</Text>
        <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
      </View>
      <View style={[styles.track, { height }]}>
        <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: color }]} />
        {/* Segment marks every 25% */}
        {[25, 50, 75].map((mark) => (
          <View
            key={mark}
            style={[styles.segment, { left: `${mark}%` as unknown as number }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
    color: NekoLexColors.text,
    fontFamily: undefined, // uses system rounded on iOS
  },
  percentage: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '800',
  },
  track: {
    borderRadius: 8,
    backgroundColor: '#E4E4E7',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: NekoLexColors.border,
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
  segment: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: NekoLexColors.border,
    opacity: 0.3,
  },
});
