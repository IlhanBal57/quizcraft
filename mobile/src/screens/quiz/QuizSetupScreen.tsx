import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedView, { FadeInDown, FadeInUp } from '../../components/ui/AnimatedView';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { categoriesAPI, quizAPI } from '../../lib/api';
import { useQuizStore } from '../../store/quizStore';
import { Category, Subcategory, DifficultyLevel } from '../../types';
import { Card, Button, Badge, DifficultyBadge } from '../../components/ui';
import { RootStackParamList } from '../../navigation';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';

type QuizSetupScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'QuizSetup'>;
  route: RouteProp<RootStackParamList, 'QuizSetup'>;
};

const DIFFICULTIES: { value: DifficultyLevel; label: string; icon: string; color: string }[] = [
  { value: 'easy', label: 'Easy', icon: '😊', color: '#10b981' },
  { value: 'medium', label: 'Medium', icon: '🤔', color: '#f59e0b' },
  { value: 'hard', label: 'Hard', icon: '😈', color: '#ef4444' },
];

const QUESTION_COUNTS = [5, 10, 15, 20];

export default function QuizSetupScreen({ navigation, route }: QuizSetupScreenProps) {
  const { themeColors } = useTheme();
  const { setQuiz } = useQuizStore();
  const initialCategoryId = route.params?.categoryId;
  
  const [step, setStep] = useState<'category' | 'subcategory' | 'config'>(
    initialCategoryId ? 'subcategory' : 'category'
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
      
      if (initialCategoryId) {
        const category = response.data.find((c: Category) => c.id === initialCategoryId);
        if (category) {
          setSelectedCategory(category);
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
    setStep('subcategory');
  };

  const handleSubcategorySelect = (subcategory: Subcategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSubcategory(subcategory);
    setStep('config');
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 'config') {
      setStep('subcategory');
      setSelectedSubcategory(null);
    } else if (step === 'subcategory') {
      setStep('category');
      setSelectedCategory(null);
    } else {
      navigation.goBack();
    }
  };

  const handleStartQuiz = async () => {
    if (!selectedCategory || !selectedSubcategory) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStarting(true);
    
    try {
      const response = await quizAPI.start({
        categoryId: selectedCategory.id,
        subcategoryId: selectedSubcategory.id,
        difficulty,
        questionCount,
      });
      
      setQuiz(response.data);
      navigation.replace('QuizPlay', { quizId: response.data.quizId });
    } catch (error: any) {
      console.error('Failed to start quiz:', error);
      alert(error.response?.data?.error || 'Failed to start quiz');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          {step === 'category' && 'Select Category'}
          {step === 'subcategory' && selectedCategory?.name}
          {step === 'config' && 'Quiz Settings'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Dots */}
      <View style={styles.progressDots}>
        {['category', 'subcategory', 'config'].map((s, index) => (
          <View
            key={s}
            style={[
              styles.dot,
              {
                backgroundColor:
                  step === s
                    ? themeColors.primary
                    : ['category', 'subcategory', 'config'].indexOf(step) > index
                    ? themeColors.primary
                    : themeColors.surface,
              },
            ]}
          />
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Step: Category Selection */}
        {step === 'category' && (
          <AnimatedView entering={FadeInDown.duration(400)}>
            <Text style={[styles.stepTitle, { color: themeColors.textSecondary }]}>
              Choose your interest
            </Text>
            <View style={styles.optionsGrid}>
              {categories.map((category, index) => (
                <AnimatedView
                  key={category.id}
                  entering={FadeInUp.duration(300).delay(index * 50)}
                >
                  <Card
                    style={styles.categoryCard}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={[styles.categoryName, { color: themeColors.text }]}>
                      {category.name}
                    </Text>
                  </Card>
                </AnimatedView>
              ))}
            </View>
          </AnimatedView>
        )}

        {/* Step: Subcategory Selection */}
        {step === 'subcategory' && selectedCategory && (
          <AnimatedView entering={FadeInDown.duration(400)}>
            <View style={styles.categoryHeader}>
              <Text style={styles.selectedIcon}>{selectedCategory.icon}</Text>
              <Text style={[styles.stepTitle, { color: themeColors.textSecondary }]}>
                Select subcategory
              </Text>
            </View>
            <View style={styles.subcategoriesList}>
              {selectedCategory.subcategories?.map((sub, index) => (
                <AnimatedView
                  key={sub.id}
                  entering={FadeInUp.duration(300).delay(index * 50)}
                >
                  <Card
                    style={styles.subcategoryCard}
                    onPress={() => handleSubcategorySelect(sub)}
                  >
                    <Text style={styles.subcategoryIcon}>{sub.icon || '📝'}</Text>
                    <Text style={[styles.subcategoryName, { color: themeColors.text }]}>
                      {sub.name}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
                  </Card>
                </AnimatedView>
              ))}
            </View>
          </AnimatedView>
        )}

        {/* Step: Configuration */}
        {step === 'config' && selectedCategory && selectedSubcategory && (
          <AnimatedView entering={FadeInDown.duration(400)}>
            {/* Selected Info */}
            <View style={[styles.selectedInfo, { backgroundColor: themeColors.surface }]}>
              <Text style={styles.selectedInfoIcon}>{selectedCategory.icon}</Text>
              <View>
                <Text style={[styles.selectedInfoTitle, { color: themeColors.text }]}>
                  {selectedCategory.name}
                </Text>
                <Text style={[styles.selectedInfoSub, { color: themeColors.textSecondary }]}>
                  {selectedSubcategory.name}
                </Text>
              </View>
            </View>

            {/* Difficulty Selection */}
            <Text style={[styles.configLabel, { color: themeColors.text }]}>
              Difficulty Level
            </Text>
            <View style={styles.difficultyContainer}>
              {DIFFICULTIES.map((d) => (
                <TouchableOpacity
                  key={d.value}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setDifficulty(d.value);
                  }}
                  style={[
                    styles.difficultyCard,
                    {
                      backgroundColor:
                        difficulty === d.value
                          ? d.color + '20'
                          : themeColors.surface,
                      borderColor:
                        difficulty === d.value ? d.color : 'transparent',
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Text style={styles.difficultyIcon}>{d.icon}</Text>
                  <Text
                    style={[
                      styles.difficultyLabel,
                      { color: difficulty === d.value ? d.color : themeColors.text },
                    ]}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Question Count */}
            <Text style={[styles.configLabel, { color: themeColors.text }]}>
              Number of Questions
            </Text>
            <View style={styles.countContainer}>
              {QUESTION_COUNTS.map((count) => (
                <TouchableOpacity
                  key={count}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setQuestionCount(count);
                  }}
                  style={[
                    styles.countCard,
                    {
                      backgroundColor:
                        questionCount === count
                          ? themeColors.primary
                          : themeColors.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.countValue,
                      {
                        color:
                          questionCount === count ? '#fff' : themeColors.text,
                      },
                    ]}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Start Button */}
            <View style={styles.startButtonContainer}>
              <Button
                title={starting ? 'Preparing...' : 'Start Quiz 🚀'}
                onPress={handleStartQuiz}
                loading={starting}
                fullWidth
                size="lg"
              />
            </View>
          </AnimatedView>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  placeholder: {
    width: 40,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  stepTitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  categoryCard: {
    width: 100,
    alignItems: 'center',
    padding: spacing.lg,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  categoryName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  categoryHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  selectedIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  subcategoriesList: {
    gap: spacing.md,
  },
  subcategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  subcategoryIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  subcategoryName: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  selectedInfoIcon: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  selectedInfoTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  selectedInfoSub: {
    fontSize: fontSize.sm,
  },
  configLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  difficultyCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  difficultyIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  difficultyLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  countContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  countCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  countValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  startButtonContainer: {
    marginTop: spacing.lg,
  },
});
