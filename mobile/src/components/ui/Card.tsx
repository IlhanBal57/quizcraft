import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { borderRadius, spacing, shadows, fontSize, fontWeight } from '../../constants/theme';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'gradient' | 'outlined';
  onPress?: () => void;
  accentColor?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Card({
  children,
  style,
  variant = 'default',
  onPress,
  accentColor,
}: CardProps) {
  const { themeColors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const cardStyle: ViewStyle = {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  };

  if (variant === 'outlined') {
    cardStyle.backgroundColor = 'transparent';
    cardStyle.borderWidth = 1;
    cardStyle.borderColor = themeColors.border;
  } else {
    cardStyle.backgroundColor = themeColors.backgroundCard;
  }

  if (accentColor) {
    cardStyle.borderLeftWidth = 4;
    cardStyle.borderLeftColor = accentColor;
  }

  const content = (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );

  if (variant === 'gradient') {
    const gradientContent = (
      <LinearGradient
        colors={[themeColors.backgroundCard, themeColors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[cardStyle, style]}
      >
        {children}
      </LinearGradient>
    );

    if (onPress) {
      return (
        <AnimatedTouchable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={animatedStyle}
          activeOpacity={0.9}
        >
          {gradientContent}
        </AnimatedTouchable>
      );
    }

    return gradientContent;
  }

  if (onPress) {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
        activeOpacity={0.9}
      >
        {content}
      </AnimatedTouchable>
    );
  }

  return content;
}

// Card Header Component
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
  const { themeColors } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {icon && <View style={styles.headerIcon}>{icon}</View>}
        <View>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {action && <View>{action}</View>}
    </View>
  );
}

// Card Content Component
interface CardContentProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

// Card Footer Component
interface CardFooterProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
  const { themeColors } = useTheme();

  return (
    <View style={[styles.footer, { borderTopColor: themeColors.border }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  content: {
    // Empty default style
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
