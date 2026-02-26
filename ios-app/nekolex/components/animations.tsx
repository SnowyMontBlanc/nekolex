import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

import Ionicons from '@expo/vector-icons/Ionicons';
import { NekoLexColors, Typography } from '@/constants/theme';
import { hapticHeavy, hapticSuccess } from '@/services/haptics';
import { playLevelUp } from '@/services/sound';

/**
 * Discovery animation: card flip + sparkle effect
 */
export function DiscoveryAnimation({
  breedName,
  xp,
  onComplete,
}: {
  breedName: string;
  xp: number;
  onComplete?: () => void;
}) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const xpTranslateY = useSharedValue(20);
  const xpOpacity = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  const sparkleScale = useSharedValue(0.5);

  useEffect(() => {
    hapticHeavy();

    // Card appears
    scale.value = withSpring(1, { damping: 8, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 300 });

    // Sparkle effect
    sparkleOpacity.value = withDelay(200, withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(1000, withTiming(0, { duration: 500 })),
    ));
    sparkleScale.value = withDelay(200, withSpring(1.2, { damping: 6 }));

    // XP text floats up
    xpOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
    xpTranslateY.value = withDelay(500, withSpring(0, { damping: 10 }));

    // Auto-complete after animation
    if (onComplete) {
      const timer = setTimeout(onComplete, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
    transform: [{ scale: sparkleScale.value }],
  }));

  const xpStyle = useAnimatedStyle(() => ({
    opacity: xpOpacity.value,
    transform: [{ translateY: xpTranslateY.value }],
  }));

  return (
    <View style={styles.discoveryOverlay}>
      <Animated.View style={[styles.sparkleContainer, sparkleStyle]}>
        <Ionicons name="star-outline" size={48} color={NekoLexColors.reward} />
      </Animated.View>
      <Animated.View style={[styles.discoveryCard, cardStyle]}>
        <Ionicons name="paw" size={64} color={NekoLexColors.brand} />
        <Text style={styles.discoveryTitle}>新発見！</Text>
        <Text style={styles.discoveryBreed}>{breedName}</Text>
      </Animated.View>
      <Animated.View style={xpStyle}>
        <Text style={styles.discoveryXp}>+{xp} XP</Text>
      </Animated.View>
    </View>
  );
}

/**
 * Correct answer animation: bounce + green check
 */
export function CorrectAnimation({ onComplete }: { onComplete?: () => void }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.3, { damping: 4, stiffness: 200 }),
      withSpring(1, { damping: 8 }),
    );
    opacity.value = withTiming(1, { duration: 200 });

    if (onComplete) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.feedbackOverlay, style]}>
      <Ionicons name="checkmark-circle" size={48} color={NekoLexColors.success} />
    </Animated.View>
  );
}

/**
 * Wrong answer animation: shake + red X
 */
export function WrongAnimation({ onComplete }: { onComplete?: () => void }) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );

    if (onComplete) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.feedbackOverlay, style]}>
      <Ionicons name="close-circle" size={48} color={NekoLexColors.error} />
    </Animated.View>
  );
}

/**
 * Level up animation
 */
export function LevelUpAnimation({
  newLevel,
  onComplete,
}: {
  newLevel: number;
  onComplete?: () => void;
}) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const bgOpacity = useSharedValue(0);
  const textScale = useSharedValue(0.5);

  useEffect(() => {
    hapticSuccess();
    playLevelUp();

    bgOpacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(2000, withTiming(0, { duration: 500 })),
    );
    scale.value = withDelay(200, withSpring(1, { damping: 6, stiffness: 80 }));
    opacity.value = withDelay(200, withTiming(1, { duration: 300 }));
    textScale.value = withDelay(400, withSpring(1, { damping: 8 }));

    if (onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ scale: textScale.value }],
  }));

  return (
    <Animated.View style={[styles.levelUpOverlay, bgStyle]}>
      <Animated.View style={[styles.levelUpContent, contentStyle]}>
        <Ionicons name="star" size={64} color={NekoLexColors.reward} />
        <Animated.View style={textStyle}>
          <Text style={styles.levelUpText}>Level Up!</Text>
          <Text style={styles.levelUpNumber}>Lv. {newLevel}</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

/**
 * Animated press scale for buttons/cards
 */
export function AnimatedPressable({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[style, animatedStyle]}
      onTouchStart={() => {
        scale.value = withTiming(0.95, { duration: 100 });
      }}
      onTouchEnd={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
        if (onPress) {
          runOnJS(onPress)();
        }
      }}>
      {children}
    </Animated.View>
  );
}

/**
 * Animated progress bar
 */
export function AnimatedProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const width = useSharedValue(0);
  const percentage = total > 0 ? (current / total) * 100 : 0;

  useEffect(() => {
    width.value = withTiming(percentage, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [percentage]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.animProgressContainer}>
      <View style={styles.animProgressBar}>
        <Animated.View style={[styles.animProgressFill, fillStyle]} />
      </View>
      <Text style={styles.animProgressText}>
        {current}/{total} ({Math.round(percentage)}%)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Discovery
  discoveryOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
  },
  discoveryCard: {
    backgroundColor: NekoLexColors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  discoveryIcon: {
    marginBottom: 12,
  },
  discoveryTitle: {
    fontSize: Typography.heading.fontSize, fontWeight: '800' as const,
    color: NekoLexColors.primary,
  },
  discoveryBreed: {
    fontSize: Typography.subheading.fontSize, fontWeight: '700' as const,
    color: NekoLexColors.text,
    marginTop: 4,
  },
  discoveryXp: {
    fontSize: Typography.heading.fontSize,
    fontWeight: '800',
    color: '#F39C12',
    marginTop: 16,
  },

  // Feedback
  feedbackOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Level Up
  levelUpOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  levelUpContent: {
    alignItems: 'center',
  },
  levelUpStar: {
    marginBottom: 16,
  },
  levelUpText: {
    fontSize: Typography.display.fontSize,
    fontWeight: '800',
    color: '#FFE66D',
    textAlign: 'center',
  },
  levelUpNumber: {
    fontSize: Typography.display.fontSize,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
  },

  // Animated Progress Bar
  animProgressContainer: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  animProgressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  animProgressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: NekoLexColors.secondary,
  },
  animProgressText: {
    ...Typography.caption,
    color: NekoLexColors.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
});
