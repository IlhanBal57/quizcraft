import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedView, { FadeInDown, FadeInRight } from '../../components/ui/AnimatedView';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { categoriesAPI, leaderboardAPI } from '../../lib/api';
import { Category } from '../../types';
import { Card, Badge } from '../../components/ui';
import { RootStackParamList } from '../../navigation';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import { getMedalEmoji, truncateEmail } from '../../lib/utils';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.xl * 2 - spacing.md) / 2;

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Main'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { themeColors } = useTheme();
  const { user } = useAuthStore();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [catRes, leadRes] = await Promise.all([
        categoriesAPI.getAll(),
        leaderboardAPI.getAllCategories(),
      ]);
      setCategories(catRes.data);
      setLeaderboards(leadRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCategoryPress = (categoryId: number) => {
    navigation.navigate('QuizSetup', { categoryId });
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      ['#6366f1', '#8b5cf6'],
      ['#ec4899', '#f472b6'],
      ['#10b981', '#34d399'],
      ['#f59e0b', '#fbbf24'],
      ['#3b82f6', '#60a5fa'],
      ['#ef4444', '#f87171'],
      ['#8b5cf6', '#a78bfa'],
      ['#14b8a6', '#2dd4bf'],
      ['#f97316', '#fb923c'],
    ];
    return colors[index % colors.length];
  };

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
        {/* Header */}
        <AnimatedView
          entering={FadeInDown.duration(500)}
          style={styles.header}
        >
          <View>
            <Text style={[styles.greeting, { color: themeColors.textSecondary }]}>
              Welcome 👋
            </Text>
            <Text style={[styles.userName, { color: themeColors.text }]}>
              {user?.email?.split('@')[0] || 'Quizzer'}
            </Text>
          </View>
          <View style={[styles.avatarContainer, { backgroundColor: themeColors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.email?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        </AnimatedView>

        {/* Quick Stats */}
        <AnimatedView
          entering={FadeInDown.duration(500).delay(100)}
          style={styles.statsContainer}
        >
          <LinearGradient
            colors={[themeColors.primary, themeColors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsGradient}
          >
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <Ionicons name="game-controller" size={24} color="#fff" />
                <Text style={styles.statValue}>{categories.length}</Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
              <View style={styles.statItem}>
                <Ionicons name="layers" size={24} color="#fff" />
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Difficulties</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
              <View style={styles.statItem}>
                <Ionicons name="infinite" size={24} color="#fff" />
                <Text style={styles.statValue}>∞</Text>
                <Text style={styles.statLabel}>Quizzes</Text>
              </View>
            </View>
          </LinearGradient>
        </AnimatedView>

        {/* Section Title */}
        <AnimatedView
          entering={FadeInDown.duration(500).delay(200)}
          style={styles.sectionHeader}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Categories
          </Text>
          <Badge text={`${categories.length} categories`} variant="outline" size="sm" />
        </AnimatedView>

        {/* Categories Grid */}
        <View style={styles.categoriesGrid}>
          {categories.map((category, index) => {
            const colors = getCategoryColor(index);
            const leaderboard = leaderboards.find((l: any) => l.categoryId === category.id);
            
            return (
              <AnimatedView
                key={category.id}
                entering={FadeInRight.duration(400).delay(100 + index * 50)}
              >
                <Card
                  style={[styles.categoryCard, { width: CARD_WIDTH }]}
                  onPress={() => handleCategoryPress(category.id)}
                >
                  <LinearGradient
                    colors={colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.categoryIconContainer}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  </LinearGradient>
                  
                  <Text
                    style={[styles.categoryName, { color: themeColors.text }]}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                  
                  <Text style={[styles.subcategoryCount, { color: themeColors.textSecondary }]}>
                    {category.subcategories?.length || 0} subcategories
                  </Text>

                  {leaderboard?.top3?.[0] && (
                    <View style={[styles.topPlayer, { backgroundColor: themeColors.surface }]}>
                      <Text style={styles.topPlayerMedal}>🥇</Text>
                      <Text
                        style={[styles.topPlayerName, { color: themeColors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {truncateEmail(leaderboard.top3[0].email)}
                      </Text>
                    </View>
                  )}
                </Card>
              </AnimatedView>
            );
          })}
        </View>

        {/* How It Works */}
        <AnimatedView
          entering={FadeInDown.duration(500).delay(400)}
          style={styles.howItWorks}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            How It Works
          </Text>
          
          <View style={styles.stepsContainer}>
            {[
              { icon: 'apps', title: 'Choose Category', desc: 'Pick your interest' },
              { icon: 'options', title: 'Configure', desc: 'Set difficulty & questions' },
              { icon: 'play', title: 'Play', desc: 'Complete the quiz' },
              { icon: 'trophy', title: 'Rank Up', desc: 'Climb the leaderboard' },
            ].map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={[styles.stepIcon, { backgroundColor: themeColors.surface }]}>
                  <Ionicons
                    name={step.icon as any}
                    size={24}
                    color={themeColors.primary}
                  />
                </View>
                <Text style={[styles.stepTitle, { color: themeColors.text }]}>
                  {step.title}
                </Text>
                <Text style={[styles.stepDesc, { color: themeColors.textSecondary }]}>
                  {step.desc}
                </Text>
              </View>
            ))}
          </View>
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
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.xl,
  },
  greeting: {
    fontSize: fontSize.md,
  },
  userName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  statsContainer: {
    marginBottom: spacing.xl,
  },
  statsGradient: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.xs,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.sm,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  categoryCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subcategoryCount: {
    fontSize: fontSize.xs,
  },
  topPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  topPlayerMedal: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  topPlayerName: {
    fontSize: fontSize.xs,
    maxWidth: 80,
  },
  howItWorks: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  stepsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  stepItem: {
    width: '45%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  stepIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stepTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
});
