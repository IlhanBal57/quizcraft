import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeOut,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import AnimatedView, { FadeIn, SlideInRight } from '../../components/ui/AnimatedView';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuizStore } from '../../store/quizStore';
import { quizAPI } from '../../lib/api';
import { AnswerKey } from '../../types';
import { ProgressBar } from '../../components/ui';
import { RootStackParamList } from '../../navigation';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';

const { width } = Dimensions.get('window');

type QuizPlayScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'QuizPlay'>;
  route: RouteProp<RootStackParamList, 'QuizPlay'>;
};

export default function QuizPlayScreen({ navigation, route }: QuizPlayScreenProps) {
  const { themeColors } = useTheme();
  const { quizId } = route.params;
  const {
    currentQuiz,
    currentQuestionIndex,
    answers,
    setAnswer,
    nextQuestion,
    startTime,
    reset,
  } = useQuizStore();

  const [selectedAnswer, setSelectedAnswer] = useState<AnswerKey | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctKey, setCorrectKey] = useState<AnswerKey | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isWaitingResult, setIsWaitingResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  
  const confettiRef = useRef<any>(null);

  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (currentQuiz?.questionCount || 0) - 1;
  const progress = ((currentQuestionIndex + 1) / (currentQuiz?.questionCount || 1)) * 100;

  useEffect(() => {
    if (!currentQuiz) {
      navigation.replace('Main');
    }
  }, [currentQuiz, navigation]);

  // Sound files are optional - will play if available
  const soundFiles = {
    correct: null as any,
    wrong: null as any,
  };
  
  try {
    soundFiles.correct = require('../../../assets/sounds/correct.wav');
    soundFiles.wrong = require('../../../assets/sounds/wrong.wav');
  } catch (e) {
    // Sound files not available
  }

  const playSound = async (correct: boolean) => {
    const soundFile = correct ? soundFiles.correct : soundFiles.wrong;
    if (!soundFile) return; // Skip if no sound file
    
    try {
      const { sound } = await Audio.Sound.createAsync(soundFile, { shouldPlay: true });
      await sound.playAsync();
      // Cleanup after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      // Sound not available, skip silently
    }
  };

  const handleAnswerPress = async (answer: AnswerKey) => {
    if (selectedAnswer || isTransitioning || isWaitingResult) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAnswer(answer);
    setAnswer(currentQuestionIndex, answer);
    setIsTransitioning(true);
    setIsWaitingResult(true);

    try {
      const response = await quizAPI.answerQuestion(quizId, {
        questionIndex: currentQuestionIndex,
        answer,
      });

      // Set correct answer first, then show result
      const isAnswerCorrect = response.data.isCorrect;
      const correctAnswerKey = response.data.correctKey;
      
      // Update states together to prevent flash
      setCorrectKey(correctAnswerKey);
      setIsCorrect(isAnswerCorrect);
      setIsWaitingResult(false);

      if (isAnswerCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowConfetti(true);
        confettiRef.current?.start();
        playSound(true);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        playSound(false);
      }
      
      setTimeout(() => {
        if (isLastQuestion) {
          submitQuiz();
        } else {
          nextQuestion();
          setSelectedAnswer(null);
          setIsCorrect(null);
          setCorrectKey(null);
          setIsTransitioning(false);
          setIsWaitingResult(false);
          setShowConfetti(false);
        }
      }, 1500);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setIsTransitioning(false);
      setIsWaitingResult(false);
    }
  };

  const submitQuiz = async () => {
    if (!startTime) return;

    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
    const answersArray = Object.entries(answers).map(([index, answer]) => ({
      questionIndex: parseInt(index),
      answer,
    }));

    try {
      await quizAPI.submit(quizId, { answers: answersArray, durationSeconds });
      navigation.replace('QuizResults', { quizId });
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const getOptionStyle = (option: AnswerKey) => {
    const baseStyle: any = {
      backgroundColor: themeColors.surface,
      borderColor: themeColors.border,
      borderWidth: 2,
    };

    // No answer selected yet
    if (!selectedAnswer) {
      return baseStyle;
    }

    // Waiting for API result - show selected answer with primary color
    if (isWaitingResult) {
      if (option === selectedAnswer) {
        return {
          ...baseStyle,
          backgroundColor: themeColors.primary + '20',
          borderColor: themeColors.primary,
        };
      }
      return {
        ...baseStyle,
        opacity: 0.5,
      };
    }

    // API result received - show correct/incorrect colors
    if (correctKey !== null) {
      // This is the correct answer - always show green
      if (option === correctKey) {
        return {
          ...baseStyle,
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10b981',
        };
      }

      // This was selected but is wrong - show red
      if (option === selectedAnswer && option !== correctKey) {
        return {
          ...baseStyle,
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: '#ef4444',
        };
      }

      // Other options - dim them
      return {
        ...baseStyle,
        opacity: 0.5,
      };
    }

    return baseStyle;
  };

  if (!currentQuestion) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.loadingText, { color: themeColors.text }]}>Loading...</Text>
      </View>
    );
  }

  const handleExitQuiz = () => {
    setShowExitModal(false);
    reset();
    navigation.replace('Main');
  };

  const options: { key: AnswerKey; text: string }[] = [
    { key: 'A', text: currentQuestion.optionA },
    { key: 'B', text: currentQuestion.optionB },
    { key: 'C', text: currentQuestion.optionC },
    { key: 'D', text: currentQuestion.optionD },
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <View style={styles.modalOverlay}>
          <AnimatedView entering={FadeIn.duration(200)} style={[styles.modalContainer, { backgroundColor: themeColors.surface }]}>
            <Ionicons name="warning" size={48} color={themeColors.warning || '#f59e0b'} />
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Exit Quiz?</Text>
            <Text style={[styles.modalMessage, { color: themeColors.textSecondary }]}>
              Your progress will not be saved. Are you sure you want to exit?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
                onPress={() => setShowExitModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: themeColors.text }]}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: themeColors.error || '#ef4444' }]}
                onPress={handleExitQuiz}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Exit</Text>
              </TouchableOpacity>
            </View>
          </AnimatedView>
        </View>
      )}

      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={100}
          origin={{ x: width / 2, y: 0 }}
          autoStart={false}
          fadeOut
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        {/* Exit Button */}
        <TouchableOpacity
          style={[styles.exitButton, { backgroundColor: themeColors.surface }]}
          onPress={() => setShowExitModal(true)}
        >
          <Ionicons name="close" size={24} color={themeColors.text} />
        </TouchableOpacity>

        <View style={styles.questionInfo}>
          <Text style={[styles.questionNumber, { color: themeColors.primary }]}>
            Question {currentQuestionIndex + 1}
          </Text>
          <Text style={[styles.questionTotal, { color: themeColors.textSecondary }]}>
            / {currentQuiz?.questionCount}
          </Text>
        </View>
        
        <View style={[styles.categoryBadge, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.categoryText, { color: themeColors.textSecondary }]}>
            {currentQuiz?.category}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} height={6} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Question Image (if flag question) */}
        {currentQuestion.imageUrl && (
          <AnimatedView
            entering={FadeIn.duration(300)}
            style={styles.imageContainer}
          >
            <View style={[styles.flagContainer, { backgroundColor: themeColors.surface }]}>
              <Image
                source={{ uri: currentQuestion.imageUrl }}
                style={styles.flagImage}
                resizeMode="contain"
              />
              <View style={[styles.flagLabel, { backgroundColor: themeColors.primary }]}>
                <Text style={styles.flagLabelText}>🏳️ Identify this flag</Text>
              </View>
            </View>
          </AnimatedView>
        )}

        {/* Question */}
        <AnimatedView
          key={`question-${currentQuestionIndex}`}
          entering={SlideInRight.duration(300)}
          exiting={SlideOutLeft.duration(300)}
          style={styles.questionContainer}
        >
          <Text style={[styles.questionText, { color: themeColors.text }]}>
            {currentQuestion.prompt}
          </Text>
        </AnimatedView>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <AnimatedView
              key={`${currentQuestionIndex}-${option.key}`}
              entering={FadeIn.duration(300).delay(index * 100)}
            >
              <TouchableOpacity
                onPress={() => handleAnswerPress(option.key)}
                disabled={!!selectedAnswer}
                activeOpacity={0.8}
                style={[styles.optionButton, getOptionStyle(option.key)]}
              >
                <View
                  style={[
                    styles.optionKey,
                    {
                      backgroundColor:
                        // Only show green/red after API result
                        correctKey !== null && option.key === correctKey
                          ? '#10b981'
                          : correctKey !== null && option.key === selectedAnswer && option.key !== correctKey
                          ? '#ef4444'
                          : themeColors.primary,
                    },
                  ]}
                >
                  <Text style={styles.optionKeyText}>{option.key}</Text>
                </View>
                
                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        // Only show green/red after API result
                        correctKey !== null && option.key === correctKey
                          ? '#10b981'
                          : correctKey !== null && option.key === selectedAnswer && option.key !== correctKey
                          ? '#ef4444'
                          : themeColors.text,
                    },
                  ]}
                >
                  {option.text}
                </Text>

                {/* Show icons only after API result */}
                {correctKey !== null && option.key === correctKey && (
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                )}
                {correctKey !== null && option.key === selectedAnswer && option.key !== correctKey && (
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                )}
              </TouchableOpacity>
            </AnimatedView>
          ))}
        </View>

        {/* Explanation */}
        {selectedAnswer && currentQuestion.explanation && (
          <AnimatedView
            entering={FadeIn.duration(300)}
            style={[styles.explanationContainer, { backgroundColor: themeColors.surface }]}
          >
            <Ionicons name="information-circle" size={20} color={themeColors.primary} />
            <Text style={[styles.explanationText, { color: themeColors.textSecondary }]}>
              {currentQuestion.explanation}
            </Text>
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
  loadingText: {
    fontSize: fontSize.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.md,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  questionInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1,
    justifyContent: 'center',
  },
  questionNumber: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  questionTotal: {
    fontSize: fontSize.lg,
    marginLeft: spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  progressContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  imageContainer: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  flagContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.lg,
  },
  flagImage: {
    width: width * 0.6,
    height: 120,
    borderRadius: borderRadius.md,
  },
  flagLabel: {
    position: 'absolute',
    bottom: -12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  flagLabelText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  questionContainer: {
    marginBottom: spacing.xl,
  },
  questionText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  optionKey: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionKeyText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  optionText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  explanationText: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: width * 0.85,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.xl,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  modalMessage: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonConfirm: {},
  modalButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
