import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { borderRadius, spacing, fontSize } from '../../constants/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showLabel?: boolean;
  variant?: 'default' | 'gradient' | 'striped';
  color?: string;
  style?: ViewStyle;
}

export default function ProgressBar({
  progress,
  height = 8,
  showLabel = false,
  variant = 'gradient',
  color,
  style,
}: ProgressBarProps) {
  const { themeColors } = useTheme();
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${clampedProgress}%`, {
        duration: 500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
    };
  }, [clampedProgress]);

  return (
    <View style={style}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>
            İlerleme
          </Text>
          <Text style={[styles.labelValue, { color: themeColors.text }]}>
            {Math.round(clampedProgress)}%
          </Text>
        </View>
      )}
      
      <View
        style={[
          styles.track,
          { height, backgroundColor: themeColors.surface },
        ]}
      >
        <Animated.View style={[styles.progressContainer, animatedStyle]}>
          {variant === 'gradient' ? (
            <LinearGradient
              colors={[themeColors.primary, themeColors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progress, { height }]}
            />
          ) : (
            <View
              style={[
                styles.progress,
                { height, backgroundColor: color || themeColors.primary },
              ]}
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
}

// Circular Progress Component
interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  color?: string;
}

export function CircularProgress({
  progress,
  size = 80,
  strokeWidth = 8,
  showValue = true,
  color,
}: CircularProgressProps) {
  const { themeColors } = useTheme();
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <View style={styles.circularBackground}>
        <View
          style={[
            styles.circularTrack,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: themeColors.surface,
            },
          ]}
        />
      </View>
      
      {/* This is a simplified version - for full SVG support use react-native-svg */}
      <View
        style={[
          styles.circularProgress,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color || themeColors.primary,
            borderTopColor: 'transparent',
            borderRightColor: clampedProgress > 25 ? color || themeColors.primary : 'transparent',
            borderBottomColor: clampedProgress > 50 ? color || themeColors.primary : 'transparent',
            borderLeftColor: clampedProgress > 75 ? color || themeColors.primary : 'transparent',
            transform: [{ rotate: '-90deg' }],
          },
        ]}
      />
      
      {showValue && (
        <View style={styles.circularValue}>
          <Text style={[styles.circularValueText, { color: themeColors.text }]}>
            {Math.round(clampedProgress)}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
  },
  labelValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  track: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressContainer: {
    height: '100%',
  },
  progress: {
    borderRadius: borderRadius.full,
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularBackground: {
    position: 'absolute',
  },
  circularTrack: {
    position: 'absolute',
  },
  circularProgress: {
    position: 'absolute',
  },
  circularValue: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularValueText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
