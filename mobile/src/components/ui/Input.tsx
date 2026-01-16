import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { borderRadius, fontSize, spacing } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export default function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  style,
  ...props
}: InputProps) {
  const { themeColors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const focusAnim = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnim.value = withTiming(0, { duration: 200 });
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      borderColor: error 
        ? '#ef4444' 
        : focusAnim.value === 1 
          ? themeColors.primary 
          : themeColors.border,
      borderWidth: focusAnim.value === 1 ? 2 : 1,
    };
  });

  const isPassword = secureTextEntry !== undefined;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>
          {label}
        </Text>
      )}
      
      <AnimatedView
        style={[
          styles.inputContainer,
          { backgroundColor: themeColors.surface },
          animatedContainerStyle,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? themeColors.primary : themeColors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            { color: themeColors.text },
            icon && styles.inputWithIcon,
            (rightIcon || isPassword) && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={themeColors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </AnimatedView>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIcon: {
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  rightIcon: {
    padding: spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: '#ef4444',
    marginLeft: spacing.xs,
  },
});
