import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AnimatedView, { FadeInDown, FadeInUp } from '../../components/ui/AnimatedView';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../lib/api';
import { validateEmail, validatePassword } from '../../lib/utils';
import { Button, Input } from '../../components/ui';
import { AuthStackParamList } from '../../navigation';
import { spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';

const { width } = Dimensions.get('window');

type LoginScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { themeColors } = useTheme();
  const { setAuth } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleLogin = async () => {
    // Validation
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await authAPI.login(email, password);
      await setAuth(response.data.user, response.data.token);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
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
          {/* Logo & Header */}
          <AnimatedView
            entering={FadeInDown.duration(600).delay(100)}
            style={styles.header}
          >
            <View style={[styles.logoContainer, { backgroundColor: themeColors.primary }]}>
              <Text style={styles.logoEmoji}>🎯</Text>
            </View>
            <Text style={[styles.title, { color: themeColors.text }]}>
              QuizCraft
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Test your knowledge, climb the leaderboard!
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
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              icon="lock-closed"
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Log In"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              style={styles.loginButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: themeColors.border }]} />
              <Text style={[styles.dividerText, { color: themeColors.textSecondary }]}>
                or
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: themeColors.border }]} />
            </View>

            {/* Register Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={styles.registerLink}
            >
              <Text style={[styles.registerText, { color: themeColors.textSecondary }]}>
                Don't have an account?{' '}
                <Text style={[styles.registerTextBold, { color: themeColors.primary }]}>
                  Sign Up
                </Text>
              </Text>
            </TouchableOpacity>
          </AnimatedView>

          {/* Demo Credentials */}
          <AnimatedView
            entering={FadeInUp.duration(600).delay(500)}
            style={[styles.demoContainer, { backgroundColor: themeColors.surface }]}
          >
            <Text style={[styles.demoTitle, { color: themeColors.textSecondary }]}>
              Demo Account
            </Text>
            <View style={styles.demoCredentials}>
              <View style={styles.demoItem}>
                <Ionicons name="mail-outline" size={16} color={themeColors.primary} />
                <Text style={[styles.demoText, { color: themeColors.text }]}>
                  admin@quizcraft.com
                </Text>
              </View>
              <View style={styles.demoItem}>
                <Ionicons name="key-outline" size={16} color={themeColors.primary} />
                <Text style={[styles.demoText, { color: themeColors.text }]}>
                  admin123
                </Text>
              </View>
            </View>
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
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
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
  loginButton: {
    marginTop: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
  },
  registerLink: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: fontSize.md,
  },
  registerTextBold: {
    fontWeight: fontWeight.semibold,
  },
  demoContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  demoCredentials: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  demoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  demoText: {
    fontSize: fontSize.sm,
  },
});
