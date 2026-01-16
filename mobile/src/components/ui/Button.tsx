import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { borderRadius, fontSize, fontWeight, spacing } from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { themeColors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const sizeStyles: Record<string, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 18 },
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: sizeStyles[size].paddingVertical,
      paddingHorizontal: sizeStyles[size].paddingHorizontal,
      opacity: disabled || loading ? 0.6 : 1,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (variant) {
      case 'secondary':
        return { ...baseStyle, backgroundColor: themeColors.surface };
      case 'outline':
        return { ...baseStyle, backgroundColor: 'transparent', borderWidth: 2, borderColor: themeColors.primary };
      case 'ghost':
        return { ...baseStyle, backgroundColor: 'transparent' };
      case 'danger':
        return { ...baseStyle, backgroundColor: '#ef4444' };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: sizeStyles[size].fontSize,
      fontWeight: fontWeight.semibold,
    };

    switch (variant) {
      case 'secondary':
        return { ...baseStyle, color: themeColors.text };
      case 'outline':
        return { ...baseStyle, color: themeColors.primary };
      case 'ghost':
        return { ...baseStyle, color: themeColors.primary };
      case 'danger':
        return { ...baseStyle, color: '#ffffff' };
      default:
        return { ...baseStyle, color: '#ffffff' };
    }
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : themeColors.primary} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <>{icon}</>}
          <Text style={[getTextStyle(), icon ? { marginLeft: iconPosition === 'left' ? 8 : 0, marginRight: iconPosition === 'right' ? 8 : 0 } : {}]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && <>{icon}</>}
        </>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <AnimatedTouchable
        disabled={disabled || loading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[animatedStyle, style]}
        activeOpacity={0.9}
        {...props}
      >
        <LinearGradient
          colors={[themeColors.primary, themeColors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[getButtonStyle(), styles.gradient]}
        >
          {content}
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      disabled={disabled || loading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, getButtonStyle(), style]}
      activeOpacity={0.7}
      {...props}
    >
      {content}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: borderRadius.lg,
  },
});
