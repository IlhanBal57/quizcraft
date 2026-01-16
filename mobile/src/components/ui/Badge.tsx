import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { borderRadius, fontSize, spacing } from '../../constants/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export default function Badge({
  text,
  variant = 'default',
  size = 'md',
  icon,
  style,
}: BadgeProps) {
  const { themeColors } = useTheme();

  const getVariantStyles = (): { backgroundColor: string; textColor: string; borderColor?: string } => {
    switch (variant) {
      case 'success':
        return { backgroundColor: 'rgba(16, 185, 129, 0.2)', textColor: '#10b981' };
      case 'warning':
        return { backgroundColor: 'rgba(245, 158, 11, 0.2)', textColor: '#f59e0b' };
      case 'error':
        return { backgroundColor: 'rgba(239, 68, 68, 0.2)', textColor: '#ef4444' };
      case 'info':
        return { backgroundColor: 'rgba(59, 130, 246, 0.2)', textColor: '#3b82f6' };
      case 'outline':
        return { backgroundColor: 'transparent', textColor: themeColors.primary, borderColor: themeColors.primary };
      default:
        return { backgroundColor: themeColors.surface, textColor: themeColors.text };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 2, paddingHorizontal: 8, fontSize: 10 };
      case 'lg':
        return { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 };
      default:
        return { paddingVertical: 4, paddingHorizontal: 12, fontSize: 12 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyles.backgroundColor,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderWidth: variantStyles.borderColor ? 1 : 0,
          borderColor: variantStyles.borderColor,
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.text,
          {
            color: variantStyles.textColor,
            fontSize: sizeStyles.fontSize,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

// Difficulty Badge Component
interface DifficultyBadgeProps {
  difficulty: 'easy' | 'medium' | 'hard';
  size?: BadgeSize;
}

export function DifficultyBadge({ difficulty, size = 'md' }: DifficultyBadgeProps) {
  const getConfig = () => {
    switch (difficulty) {
      case 'easy':
        return { text: 'Kolay', variant: 'success' as BadgeVariant };
      case 'medium':
        return { text: 'Orta', variant: 'warning' as BadgeVariant };
      case 'hard':
        return { text: 'Zor', variant: 'error' as BadgeVariant };
      default:
        return { text: difficulty, variant: 'default' as BadgeVariant };
    }
  };

  const config = getConfig();
  return <Badge text={config.text} variant={config.variant} size={size} />;
}

// Rank Badge Component
interface RankBadgeProps {
  rank: number;
  size?: BadgeSize;
}

export function RankBadge({ rank, size = 'md' }: RankBadgeProps) {
  const getMedal = () => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <Badge
      text={getMedal()}
      variant={rank <= 3 ? 'warning' : 'default'}
      size={size}
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    fontWeight: '600',
  },
});
