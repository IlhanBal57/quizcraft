import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedView, { FadeIn, FadeInDown, FadeInUp } from '../../components/ui/AnimatedView';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, themes, ThemeType } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { profileAPI } from '../../lib/api';
import { Card, Button, Badge, DifficultyBadge, RankBadge } from '../../components/ui';
import { RootStackParamList } from '../../navigation';
import { formatTime, formatDate, getMedalEmoji } from '../../lib/utils';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';

type ProfileScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Main'>;
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { themeColors, theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.get();
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleLogout = () => {
    logout();
  };

  const handlePlayAgain = (quiz: any) => {
    navigation.navigate('QuizSetup', {
      categoryId: quiz.categoryId,
    });
  };

  const themeOptions: { id: ThemeType; name: string; emoji: string }[] = [
    { id: 'dark', name: 'Dark', emoji: '🌙' },
    { id: 'midnight', name: 'Midnight Blue', emoji: '🌌' },
    { id: 'ocean', name: 'Ocean', emoji: '🌊' },
    { id: 'sunset', name: 'Sunset', emoji: '🌅' },
    { id: 'cyberpunk', name: 'Cyberpunk', emoji: '🤖' },
  ];

  const stats = profile?.stats || {};
  const history = profile?.history || [];

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <View style={[styles.loader, { borderColor: themeColors.primary }]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
          />
        }
      >
        {/* Profile Header */}
        <AnimatedView entering={FadeInDown.duration(500)} style={styles.header}>
          <LinearGradient
            colors={[themeColors.primary, themeColors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarContainer}
          >
            <Text style={styles.avatarText}>
              {user?.email?.[0]?.toUpperCase() || '?'}
            </Text>
          </LinearGradient>
          
          <Text style={[styles.userName, { color: themeColors.text }]}>
            {user?.email?.split('@')[0]}
          </Text>
          <Text style={[styles.userEmail, { color: themeColors.textSecondary }]}>
            {user?.email}
          </Text>
          
          <View style={styles.roleBadge}>
            <Badge
              text={user?.role === 'admin' ? '👑 Admin' : '👤 User'}
              variant={user?.role === 'admin' ? 'warning' : 'default'}
            />
          </View>
        </AnimatedView>

        {/* Stats Cards */}
        <AnimatedView
          entering={FadeInUp.duration(500).delay(100)}
          style={styles.statsContainer}
        >
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Ionicons name="game-controller" size={28} color="#f59e0b" />
              <Text style={[styles.statValue, { color: themeColors.text }]}>
                {stats.totalQuizzes || 0}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                Quiz
              </Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Ionicons name="analytics" size={28} color="#3b82f6" />
              <Text style={[styles.statValue, { color: themeColors.text }]}>
                %{stats.avgScore?.toFixed(0) || 0}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                Average
              </Text>
            </Card>
          </View>
          
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Ionicons name="trophy" size={28} color="#10b981" />
              <Text style={[styles.statValue, { color: themeColors.text }]}>
                %{stats.bestScore?.toFixed(0) || 0}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                Best
              </Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Ionicons name="time" size={28} color="#8b5cf6" />
              <Text style={[styles.statValue, { color: themeColors.text }]}>
                {formatTime(stats.totalTime || 0)}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                Total Time
              </Text>
            </Card>
          </View>
        </AnimatedView>

        {/* Theme Selector */}
        <AnimatedView entering={FadeInUp.duration(500).delay(200)}>
          <Card style={styles.themeCard}>
            <TouchableOpacity
              onPress={() => setShowThemes(!showThemes)}
              style={styles.themeHeader}
            >
              <View style={styles.themeHeaderLeft}>
                <Ionicons name="color-palette" size={24} color={themeColors.primary} />
                <Text style={[styles.themeTitle, { color: themeColors.text }]}>
                  Theme
                </Text>
              </View>
              <View style={styles.themeHeaderRight}>
                <Text style={[styles.currentTheme, { color: themeColors.textSecondary }]}>
                  {themeOptions.find(t => t.id === theme)?.name}
                </Text>
                <Ionicons
                  name={showThemes ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={themeColors.textSecondary}
                />
              </View>
            </TouchableOpacity>

            {showThemes && (
              <AnimatedView entering={FadeIn.duration(200)} style={styles.themeOptions}>
                {themeOptions.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setTheme(t.id)}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor:
                          theme === t.id ? themeColors.primary + '20' : themeColors.surface,
                        borderColor:
                          theme === t.id ? themeColors.primary : 'transparent',
                      },
                    ]}
                  >
                    <Text style={styles.themeEmoji}>{t.emoji}</Text>
                    <Text
                      style={[
                        styles.themeName,
                        { color: theme === t.id ? themeColors.primary : themeColors.text },
                      ]}
                    >
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </AnimatedView>
            )}
          </Card>
        </AnimatedView>

        {/* Quiz History */}
        <AnimatedView entering={FadeInUp.duration(500).delay(300)}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={20} color={themeColors.primary} />
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Quiz History
            </Text>
          </View>

          {history.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={48} color={themeColors.textSecondary} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                You haven't completed any quizzes yet
              </Text>
              <Button
                title="Start Your First Quiz"
                onPress={() => navigation.navigate('QuizSetup', {})}
                size="sm"
              />
            </Card>
          ) : (
            <View style={styles.historyList}>
              {history.slice(0, 10).map((quiz: any, index: number) => (
                <AnimatedView
                  key={quiz.id}
                  entering={FadeInUp.duration(300).delay(index * 50)}
                >
                  <Card style={styles.historyCard} onPress={() => handlePlayAgain(quiz)}>
                    <View style={styles.historyHeader}>
                      <View>
                        <Text style={[styles.historyCategory, { color: themeColors.text }]}>
                          {quiz.category}
                        </Text>
                        <Text style={[styles.historySubcategory, { color: themeColors.textSecondary }]}>
                          {quiz.subcategory}
                        </Text>
                      </View>
                      <DifficultyBadge difficulty={quiz.difficulty} size="sm" />
                    </View>
                    
                    <View style={styles.historyStats}>
                      <View style={styles.historyStat}>
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                        <Text style={[styles.historyStatText, { color: themeColors.text }]}>
                          {quiz.scoreCorrect}/{quiz.questionCount}
                        </Text>
                      </View>
                      <View style={styles.historyStat}>
                        <Ionicons name="time" size={16} color={themeColors.textSecondary} />
                        <Text style={[styles.historyStatText, { color: themeColors.textSecondary }]}>
                          {formatTime(quiz.durationSeconds)}
                        </Text>
                      </View>
                      {quiz.rank && (
                        <View style={styles.historyStat}>
                          <Text style={styles.historyRank}>
                            {getMedalEmoji(quiz.rank) || `#${quiz.rank}`}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={[styles.historyDate, { color: themeColors.textSecondary }]}>
                      {quiz.date ? formatDate(quiz.date) : ''}
                    </Text>
                  </Card>
                </AnimatedView>
              ))}
            </View>
          )}
        </AnimatedView>

        {/* Logout Button */}
        <AnimatedView entering={FadeInUp.duration(500).delay(400)} style={styles.logoutContainer}>
          <Button
            title="Log Out"
            variant="danger"
            onPress={handleLogout}
            icon={<Ionicons name="log-out" size={20} color="#fff" />}
            fullWidth
          />
        </AnimatedView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderTopColor: 'transparent',
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing.xxl + spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: fontWeight.bold,
  },
  userName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    marginTop: spacing.xs,
  },
  statsContainer: {
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  themeCard: {
    marginBottom: spacing.xl,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  themeTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  themeHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currentTheme: {
    fontSize: fontSize.sm,
  },
  themeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    gap: spacing.xs,
  },
  themeEmoji: {
    fontSize: 16,
  },
  themeName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
  },
  historyList: {
    gap: spacing.md,
  },
  historyCard: {
    padding: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  historyCategory: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  historySubcategory: {
    fontSize: fontSize.sm,
  },
  historyStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  historyStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  historyStatText: {
    fontSize: fontSize.sm,
  },
  historyRank: {
    fontSize: fontSize.md,
  },
  historyDate: {
    fontSize: fontSize.xs,
  },
  logoutContainer: {
    marginTop: spacing.xl,
  },
});
