import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedView, { FadeIn, FadeInUp, ZoomIn } from '../../components/ui/AnimatedView';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuizStore } from '../../store/quizStore';
import { quizAPI, leaderboardAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Card, Button, Badge, RankBadge } from '../../components/ui';
import { RootStackParamList } from '../../navigation';
import { formatTime, getMedalEmoji, truncateEmail, getScoreEmoji } from '../../lib/utils';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';

const { width } = Dimensions.get('window');

type QuizResultsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'QuizResults'>;
  route: RouteProp<RootStackParamList, 'QuizResults'>;
};

export default function QuizResultsScreen({ navigation, route }: QuizResultsScreenProps) {
  const { themeColors } = useTheme();
  const { quizId } = route.params;
  const { reset } = useQuizStore();
  const { user } = useAuthStore();

  const [result, setResult] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuestions, setShowQuestions] = useState(false);
  
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const quizRes = await quizAPI.getQuiz(quizId);
      setResult(quizRes.data);

      const leadRes = await leaderboardAPI.getByConfig({
        categoryId: quizRes.data.categoryId,
        subcategoryId: quizRes.data.subcategoryId,
        difficulty: quizRes.data.difficulty,
        questionCount: quizRes.data.questionCount,
      });
      setLeaderboard(leadRes.data.leaderboard || []);

      // Celebrate good scores
      if (quizRes.data.scorePercentage >= 70) {
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          confettiRef.current?.start();
        }, 500);
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    reset();
    navigation.replace('QuizSetup', {
      categoryId: result?.categoryId,
    });
  };

  const handleGoHome = () => {
    reset();
    navigation.replace('Main');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎯 I scored ${result?.scoreCorrect}/${result?.questionCount} (${result?.scorePercentage?.toFixed(0)}%) on QuizCraft!\n\nI competed in ${result?.category} / ${result?.subcategory} at ${result?.difficulty === 'easy' ? 'Easy' : result?.difficulty === 'medium' ? 'Medium' : 'Hard'} level. Try it yourself!`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.loadingText, { color: themeColors.text }]}>
          Loading results...
        </Text>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: themeColors.background }]}>
        <Ionicons name="alert-circle" size={48} color={themeColors.error} />
        <Text style={[styles.errorText, { color: themeColors.text }]}>
          Results not found
        </Text>
        <Button title="Home" onPress={handleGoHome} />
      </View>
    );
  }

  const isTopThree = result.computedRankAtSubmit <= 3;
  const isGoodScore = result.scorePercentage >= 70;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Confetti */}
      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: width / 2, y: 0 }}
        autoStart={false}
        fadeOut
        explosionSpeed={350}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Result Header */}
        <AnimatedView
          entering={ZoomIn.duration(500)}
          style={styles.resultHeader}
        >
          <Text style={styles.resultEmoji}>
            {getScoreEmoji(result.scorePercentage)}
          </Text>
          <Text style={[styles.resultTitle, { color: themeColors.text }]}>
            Quiz Complete!
          </Text>
        </AnimatedView>

        {/* Score Card */}
        <AnimatedView entering={FadeInUp.duration(500).delay(200)}>
          <LinearGradient
            colors={
              isGoodScore
                ? ['#10b981', '#059669']
                : result.scorePercentage >= 50
                ? ['#f59e0b', '#d97706']
                : ['#ef4444', '#dc2626']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreCard}
          >
            <View style={styles.scoreMain}>
              <Text style={styles.scoreValue}>
                {result.scoreCorrect}/{result.questionCount}
              </Text>
              <Text style={styles.scorePercentage}>
                %{result.scorePercentage?.toFixed(0)}
              </Text>
            </View>

            <View style={styles.scoreStats}>
              <View style={styles.statBox}>
                <Ionicons name="time" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statValue}>{formatTime(result.durationSeconds || 0)}</Text>
                <Text style={styles.statLabel}>Time</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statBox}>
                <Ionicons name="trophy" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statValue}>
                  {isTopThree && getMedalEmoji(result.computedRankAtSubmit)}
                  #{result.computedRankAtSubmit}
                </Text>
                <Text style={styles.statLabel}>Rank</Text>
              </View>
            </View>
          </LinearGradient>
        </AnimatedView>

        {/* Quiz Info */}
        <AnimatedView
          entering={FadeInUp.duration(500).delay(300)}
          style={[styles.quizInfo, { backgroundColor: themeColors.surface }]}
        >
          <View style={styles.quizInfoRow}>
            <Ionicons name="folder" size={18} color={themeColors.primary} />
            <Text style={[styles.quizInfoText, { color: themeColors.text }]}>
              {result.category} → {result.subcategory}
            </Text>
          </View>
          <View style={styles.quizInfoRow}>
            <Ionicons name="speedometer" size={18} color={themeColors.primary} />
            <Text style={[styles.quizInfoText, { color: themeColors.text }]}>
              {result.difficulty === 'easy' ? 'Easy' : result.difficulty === 'medium' ? 'Medium' : 'Hard'} • {result.questionCount} Questions
            </Text>
          </View>
        </AnimatedView>

        {/* Leaderboard Preview */}
        {leaderboard.length > 0 && (
          <AnimatedView entering={FadeInUp.duration(500).delay(400)}>
            <Card style={styles.leaderboardCard}>
              <View style={styles.leaderboardHeader}>
                <Ionicons name="trophy" size={20} color="#f59e0b" />
                <Text style={[styles.leaderboardTitle, { color: themeColors.text }]}>
                  Leaderboard
                </Text>
              </View>

              {leaderboard.slice(0, 5).map((entry, index) => {
                const isCurrentUser = entry.userId === user?.id;
                return (
                  <View
                    key={index}
                    style={[
                      styles.leaderboardEntry,
                      isCurrentUser && {
                        backgroundColor: themeColors.primary + '20',
                        borderRadius: borderRadius.md,
                      },
                    ]}
                  >
                    <Text style={styles.entryRank}>
                      {index < 3 ? getMedalEmoji(index + 1) : `#${index + 1}`}
                    </Text>
                    <Text
                      style={[
                        styles.entryEmail,
                        { color: isCurrentUser ? themeColors.primary : themeColors.text },
                      ]}
                      numberOfLines={1}
                    >
                      {isCurrentUser ? 'You' : truncateEmail(entry.email)}
                    </Text>
                    <Text style={[styles.entryScore, { color: themeColors.textSecondary }]}>
                      {entry.scoreCorrect}/{result.questionCount}
                    </Text>
                    <Text style={[styles.entryTime, { color: themeColors.textSecondary }]}>
                      {formatTime(entry.durationSeconds)}
                    </Text>
                  </View>
                );
              })}
            </Card>
          </AnimatedView>
        )}

        {/* Questions Review Toggle */}
        <AnimatedView entering={FadeInUp.duration(500).delay(500)}>
          <TouchableOpacity
            onPress={() => setShowQuestions(!showQuestions)}
            style={[styles.toggleButton, { backgroundColor: themeColors.surface }]}
          >
            <Ionicons
              name={showQuestions ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={themeColors.primary}
            />
            <Text style={[styles.toggleText, { color: themeColors.text }]}>
              {showQuestions ? 'Hide Questions' : 'View Questions'}
            </Text>
          </TouchableOpacity>
        </AnimatedView>

        {/* Questions Review */}
        {showQuestions && result.questions && (
          <AnimatedView entering={FadeIn.duration(300)} style={styles.questionsContainer}>
            {result.questions.map((q: any, index: number) => (
              <Card key={index} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text style={[styles.questionIndex, { color: themeColors.textSecondary }]}>
                    Question {index + 1}
                  </Text>
                  {q.isCorrect ? (
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  ) : (
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  )}
                </View>
                <Text style={[styles.questionPrompt, { color: themeColors.text }]}>
                  {q.prompt}
                </Text>
                <View style={styles.answerInfo}>
                  <Text style={[styles.answerLabel, { color: themeColors.textSecondary }]}>
                    Your answer:{' '}
                    <Text style={{ color: q.isCorrect ? '#10b981' : '#ef4444' }}>
                      {q.userAnswer || '-'}
                    </Text>
                  </Text>
                  {!q.isCorrect && (
                    <Text style={[styles.answerLabel, { color: themeColors.textSecondary }]}>
                      Correct answer:{' '}
                      <Text style={{ color: '#10b981' }}>{q.correctKey}</Text>
                    </Text>
                  )}
                </View>
              </Card>
            ))}
          </AnimatedView>
        )}

        {/* Action Buttons */}
        <AnimatedView
          entering={FadeInUp.duration(500).delay(600)}
          style={styles.actionButtons}
        >
          <Button
            title="Play Again"
            onPress={handlePlayAgain}
            icon={<Ionicons name="refresh" size={20} color="#fff" />}
            style={styles.actionButton}
          />
          <Button
            title="Share"
            variant="outline"
            onPress={handleShare}
            icon={<Ionicons name="share-social" size={20} color={themeColors.primary} />}
            style={styles.actionButton}
          />
        </AnimatedView>

        <Button
          title="Home"
          variant="ghost"
          onPress={handleGoHome}
          icon={<Ionicons name="home" size={20} color={themeColors.primary} />}
          style={styles.homeButton}
        />
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
  loadingText: {
    fontSize: fontSize.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.lg,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing.xxl + spacing.xl,
    paddingBottom: spacing.xxl,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  resultTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  scoreCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  scoreMain: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: fontWeight.extrabold,
    color: '#fff',
  },
  scorePercentage: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.9)',
  },
  scoreStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#fff',
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  quizInfo: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  quizInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quizInfoText: {
    fontSize: fontSize.sm,
  },
  leaderboardCard: {
    marginBottom: spacing.lg,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  leaderboardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  entryRank: {
    width: 32,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  entryEmail: {
    flex: 1,
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
  },
  entryScore: {
    fontSize: fontSize.sm,
    marginRight: spacing.md,
  },
  entryTime: {
    fontSize: fontSize.sm,
    width: 50,
    textAlign: 'right',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  toggleText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  questionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  questionCard: {
    padding: spacing.md,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  questionIndex: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  questionPrompt: {
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  answerInfo: {
    gap: spacing.xs,
  },
  answerLabel: {
    fontSize: fontSize.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  homeButton: {
    marginTop: spacing.sm,
  },
});
