import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedView, { FadeIn, FadeInDown, FadeInUp } from '../../components/ui/AnimatedView';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { leaderboardAPI, categoriesAPI } from '../../lib/api';
import { Card, Badge, DifficultyBadge } from '../../components/ui';
import { RootStackParamList } from '../../navigation';
import { formatTime, getMedalEmoji, getMedalColor } from '../../lib/utils';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import { Category } from '../../types';

type LeaderboardScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Main'>;
};

type Difficulty = 'easy' | 'medium' | 'hard';

type FilterState = {
  categoryId: number | null;
  subcategoryId: number | null;
  difficulty: Difficulty | null;
};

type CategoryLeaderboard = {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  top3: { rank: number; email: string; scorePercentage: number }[];
};

export default function LeaderboardScreen({ navigation }: LeaderboardScreenProps) {
  const { themeColors } = useTheme();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLeaderboards, setCategoryLeaderboards] = useState<CategoryLeaderboard[]>([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categoryId: null,
    subcategoryId: null,
    difficulty: null,
  });

  const difficulties: { value: Difficulty; label: string; color: string }[] = [
    { value: 'easy', label: 'Easy', color: '#10b981' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'hard', label: 'Hard', color: '#ef4444' },
  ];

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // If all filters are set, use getByConfig for specific leaderboard
      if (filters.categoryId && filters.subcategoryId && filters.difficulty) {
        const response = await leaderboardAPI.getByConfig({
          categoryId: filters.categoryId,
          subcategoryId: filters.subcategoryId,
          difficulty: filters.difficulty,
          questionCount: 10,
        });
        setFilteredLeaderboard(response.data?.leaderboard || []);
        setCategoryLeaderboards([]);
      } else {
        // Get all categories leaderboard
        const response = await leaderboardAPI.getAllCategories();
        setCategoryLeaderboards(response.data || []);
        setFilteredLeaderboard([]);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard();
  }, [filters]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const selectedCategory = categories.find(c => c.id === filters.categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  const clearFilters = () => {
    setFilters({
      categoryId: null,
      subcategoryId: null,
      difficulty: null,
    });
  };

  const hasActiveFilters = filters.categoryId || filters.subcategoryId || filters.difficulty;

  // Filtrelenmiş liderlik tablosu için render
  const renderFilteredLeaderboardItem = ({ item, index }: { item: any; index: number }) => {
    const rank = item.rank || index + 1;
    const isTopThree = rank <= 3;
    const medalEmoji = getMedalEmoji(rank);
    const medalColor = getMedalColor(rank);

    return (
      <AnimatedView entering={FadeInUp.duration(300).delay(index * 30)}>
        <Card
          style={[
            styles.leaderboardCard,
            isTopThree && {
              borderColor: medalColor,
              borderWidth: 2,
            },
          ]}
        >
          <View style={styles.rankContainer}>
            {medalEmoji ? (
              <Text style={styles.medalEmoji}>{medalEmoji}</Text>
            ) : (
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: themeColors.surface },
                ]}
              >
                <Text style={[styles.rankText, { color: themeColors.textSecondary }]}>
                  #{rank}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.playerInfo}>
            <LinearGradient
              colors={isTopThree ? [medalColor, medalColor + '80'] : [themeColors.primary, themeColors.accent]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {item.email?.[0]?.toUpperCase() || '?'}
              </Text>
            </LinearGradient>
            <View style={styles.playerDetails}>
              <Text style={[styles.playerName, { color: themeColors.text }]}>
                {item.email?.split('@')[0] || item.email}
              </Text>
            </View>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreValue, { color: themeColors.primary }]}>
              %{item.scorePercentage?.toFixed(0) || item.scoreCorrect}
            </Text>
            {item.durationSeconds && (
              <Text style={[styles.scoreTime, { color: themeColors.textSecondary }]}>
                {formatTime(item.durationSeconds)}
              </Text>
            )}
          </View>
        </Card>
      </AnimatedView>
    );
  };

  // Kategori bazlı liderlik tablosu kartı
  const renderCategoryCard = ({ item, index }: { item: CategoryLeaderboard; index: number }) => {
    return (
      <AnimatedView 
        key={`category-${item.categoryId}`} 
        entering={FadeInUp.duration(300).delay(index * 50)}
      >
        <Card style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryEmoji}>{item.categoryIcon}</Text>
            <Text style={[styles.categoryName, { color: themeColors.text }]}>
              {item.categoryName}
            </Text>
          </View>
          
          {item.top3 && item.top3.length > 0 ? (
            <View style={styles.top3Container}>
              {item.top3.map((player, playerIndex) => {
                const medalEmoji = getMedalEmoji(player.rank);
                const medalColor = getMedalColor(player.rank);
                
                return (
                  <View 
                    key={`${item.categoryId}-player-${playerIndex}`} 
                    style={[
                      styles.top3Item,
                      { borderLeftColor: medalColor, borderLeftWidth: 3 }
                    ]}
                  >
                    <Text style={styles.top3Medal}>{medalEmoji}</Text>
                    <Text 
                      style={[styles.top3Name, { color: themeColors.text }]}
                      numberOfLines={1}
                    >
                      {player.email?.split('@')[0] || player.email}
                    </Text>
                    <Text style={[styles.top3Score, { color: themeColors.primary }]}>
                      %{player.scorePercentage?.toFixed(0)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { color: themeColors.textSecondary }]}>
                No results yet
              </Text>
            </View>
          )}
        </Card>
      </AnimatedView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <AnimatedView entering={FadeInDown.duration(500)} style={styles.header}>
        <LinearGradient
          colors={[themeColors.primary + '30', themeColors.background]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              🏆 Leaderboard
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Discover top players
            </Text>
          </View>
        </LinearGradient>
      </AnimatedView>

      {/* Filter Toggle */}
      <AnimatedView entering={FadeIn.duration(300).delay(200)} style={styles.filterToggle}>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={[
            styles.filterButton,
            {
              backgroundColor: hasActiveFilters ? themeColors.primary + '20' : themeColors.surface,
              borderColor: hasActiveFilters ? themeColors.primary : themeColors.border,
            },
          ]}
        >
          <Ionicons
            name="filter"
            size={20}
            color={hasActiveFilters ? themeColors.primary : themeColors.textSecondary}
          />
          <Text
            style={[
              styles.filterButtonText,
              { color: hasActiveFilters ? themeColors.primary : themeColors.text },
            ]}
          >
            Filter
          </Text>
          {hasActiveFilters && (
            <View style={[styles.filterBadge, { backgroundColor: themeColors.primary }]}>
              <Text style={styles.filterBadgeText}>
                {[filters.categoryId, filters.subcategoryId, filters.difficulty].filter(Boolean).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={themeColors.error} />
            <Text style={[styles.clearButtonText, { color: themeColors.error }]}>
              Clear
            </Text>
          </TouchableOpacity>
        )}
      </AnimatedView>

      {/* Filters Panel */}
      {showFilters && (
        <AnimatedView entering={FadeIn.duration(200)} style={styles.filtersPanel}>
          <Card style={styles.filterCard}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: themeColors.textSecondary }]}>
                Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterOptions}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        categoryId: filters.categoryId === category.id ? null : category.id,
                        subcategoryId: null,
                      })
                    }
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor:
                          filters.categoryId === category.id
                            ? themeColors.primary
                            : themeColors.surface,
                        borderColor:
                          filters.categoryId === category.id
                            ? themeColors.primary
                            : themeColors.border,
                      },
                    ]}
                  >
                    <Text style={styles.filterEmoji}>{category.emoji}</Text>
                    <Text
                      style={[
                        styles.filterOptionText,
                        {
                          color:
                            filters.categoryId === category.id ? '#fff' : themeColors.text,
                        },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Subcategory Filter */}
            {subcategories.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: themeColors.textSecondary }]}>
                  Subcategory
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterOptions}
                >
                  {subcategories.map((sub) => (
                    <TouchableOpacity
                      key={sub.id}
                      onPress={() =>
                        setFilters({
                          ...filters,
                          subcategoryId:
                            filters.subcategoryId === sub.id ? null : sub.id,
                        })
                      }
                      style={[
                        styles.filterOption,
                        {
                          backgroundColor:
                            filters.subcategoryId === sub.id
                              ? themeColors.primary
                              : themeColors.surface,
                          borderColor:
                            filters.subcategoryId === sub.id
                              ? themeColors.primary
                              : themeColors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          {
                            color:
                              filters.subcategoryId === sub.id ? '#fff' : themeColors.text,
                          },
                        ]}
                      >
                        {sub.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Difficulty Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: themeColors.textSecondary }]}>
                Difficulty
              </Text>
              <View style={styles.filterOptionsRow}>
                {difficulties.map((diff) => (
                  <TouchableOpacity
                    key={diff.value}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        difficulty: filters.difficulty === diff.value ? null : diff.value,
                      })
                    }
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor:
                          filters.difficulty === diff.value
                            ? diff.color
                            : themeColors.surface,
                        borderColor:
                          filters.difficulty === diff.value
                            ? diff.color
                            : themeColors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        {
                          color:
                            filters.difficulty === diff.value ? '#fff' : themeColors.text,
                        },
                      ]}
                    >
                      {diff.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        </AnimatedView>
      )}

      {/* Leaderboard List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={[styles.loader, { borderColor: themeColors.primary }]} />
        </View>
      ) : filteredLeaderboard.length > 0 ? (
        // Filtered leaderboard
        <FlatList
          data={filteredLeaderboard}
          keyExtractor={(item, index) => `filtered-${item.rank || index}-${item.email || index}`}
          renderItem={renderFilteredLeaderboardItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.primary}
            />
          }
        />
      ) : categoryLeaderboards.length > 0 ? (
        // Category-based leaderboard
        <FlatList
          data={categoryLeaderboards}
          keyExtractor={(item) => `category-${item.categoryId}`}
          renderItem={renderCategoryCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.primary}
            />
          }
        />
      ) : (
        // Empty state
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={64} color={themeColors.textSecondary} />
          <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
            No results yet
          </Text>
          <Text style={[styles.emptySubtext, { color: themeColors.textSecondary }]}>
            Be the first to complete a quiz and join the leaderboard!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.md,
  },
  headerGradient: {
    paddingTop: spacing.xxl + spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  filterBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  clearButtonText: {
    fontSize: fontSize.sm,
  },
  filtersPanel: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  filterCard: {
    padding: spacing.md,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  filterOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  filterOptionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  filterEmoji: {
    fontSize: 16,
  },
  filterOptionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  medalEmoji: {
    fontSize: 28,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  playerCategory: {
    fontSize: fontSize.xs,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  scoreDetails: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 2,
  },
  scoreDetail: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  scoreTime: {
    fontSize: fontSize.xs,
  },
  // Kategori kartları için stiller
  categoryCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  top3Container: {
    gap: spacing.sm,
  },
  top3Item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    gap: spacing.sm,
  },
  top3Medal: {
    fontSize: 20,
    width: 28,
  },
  top3Name: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  top3Score: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  noDataContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
});
