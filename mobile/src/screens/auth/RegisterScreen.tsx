import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedView, { FadeInDown, FadeInUp } from '../../components/ui/AnimatedView';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../lib/api';
import { validateEmail, validatePassword } from '../../lib/utils';
import { Button, Input } from '../../components/ui';
import { AuthStackParamList } from '../../navigation';
import { spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';

type RegisterScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { themeColors } = useTheme();
  const { setAuth } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const handleRegister = async () => {
    // Validation
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await authAPI.register(email, password);
      await setAuth(response.data.user, response.data.token);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[themeColors.background, themeColors.backgroundLight]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <AnimatedView
            entering={FadeInDown.duration(600).delay(100)}
            style={styles.header}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>
            
            <View style={[styles.logoContainer, { backgroundColor: themeColors.primary }]}>
              <Text style={styles.logoEmoji}>🚀</Text>
            </View>
            <Text style={[styles.title, { color: themeColors.text }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Join the quiz world and compete!
            </Text>
          </AnimatedView>

          {/* Form */}
          <AnimatedView
            entering={FadeInUp.duration(600).delay(300)}
            style={styles.form}
          >
            {errors.general && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            )}

            <Input
              label="Email"
              placeholder="example@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              icon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              icon="lock-closed"
              secureTextEntry
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              icon="lock-closed"
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title="Sign Up"
              onPress={handleRegister}
              loading={loading}
              fullWidth
              style={styles.registerButton}
            />

            {/* Login Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
            >
              <Text style={[styles.loginText, { color: themeColors.textSecondary }]}>
                Already have an account?{' '}
                <Text style={[styles.loginTextBold, { color: themeColors.primary }]}>
                  Log In
                </Text>
              </Text>
            </TouchableOpacity>
          </AnimatedView>

          {/* Features */}
          <AnimatedView
            entering={FadeInUp.duration(600).delay(500)}
            style={styles.features}
          >
            {[
              { icon: 'trophy', text: 'Compete on leaderboards' },
              { icon: 'stats-chart', text: 'Track your statistics' },
              { icon: 'infinite', text: 'Unlimited quizzes' },
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: themeColors.surface }]}>
                  <Ionicons
                    name={feature.icon as any}
                    size={20}
                    color={themeColors.primary}
                  />
                </View>
                <Text style={[styles.featureText, { color: themeColors.textSecondary }]}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </AnimatedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingTop: spacing.xxl + spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: -spacing.lg,
    padding: spacing.sm,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  errorBannerText: {
    color: '#ef4444',
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
  },
  registerButton: {
    marginTop: spacing.md,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    fontSize: fontSize.md,
  },
  loginTextBold: {
    fontWeight: fontWeight.semibold,
  },
  features: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: fontSize.sm,
  },
});
