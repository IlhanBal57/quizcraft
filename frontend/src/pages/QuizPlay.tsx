import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useQuizStore } from '../store/quizStore';
import { quizAPI } from '../lib/api';
import { Card, CardContent } from '../components/ui/Card';
import { CheckCircle, XCircle } from 'lucide-react';

const successSound = typeof Audio !== 'undefined' ? new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3') : null;
const errorSound = typeof Audio !== 'undefined' ? new Audio('https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3') : null;

export default function QuizPlay() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { currentQuiz, currentQuestionIndex, answers, setAnswer, nextQuestion, startTime } = useQuizStore();
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctKey, setCorrectKey] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (currentQuiz?.questionCount || 0) - 1;
  const progress = ((currentQuestionIndex + 1) / (currentQuiz?.questionCount || 1)) * 100;

  const submitQuiz = useCallback(async () => {
    if (!quizId || !startTime) return;
    
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
    const answersArray = Object.entries(answers).map(([index, answer]) => ({
      questionIndex: parseInt(index),
      answer,
    }));

    try {
      await quizAPI.submit(quizId, { answers: answersArray, durationSeconds });
      navigate(`/quiz/results/${quizId}`);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  }, [quizId, startTime, answers, navigate]);

  useEffect(() => {
    if (!currentQuiz) {
      navigate('/home');
    }
  }, [currentQuiz, navigate]);

  const handleAnswerClick = async (answer: 'A' | 'B' | 'C' | 'D') => {
    if (selectedAnswer || !quizId || isTransitioning) return;

    setSelectedAnswer(answer);
    setAnswer(currentQuestionIndex, answer);

    try {
      const response = await quizAPI.answerQuestion(quizId, {
        questionIndex: currentQuestionIndex,
        answer,
      });

      setIsCorrect(response.data.isCorrect);
      setCorrectKey(response.data.correctKey);

      if (response.data.isCorrect) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        successSound?.play().catch(() => {});
      } else {
        errorSound?.play().catch(() => {});
      }

      setIsTransitioning(true);
      setTimeout(() => {
        if (isLastQuestion) {
          submitQuiz();
        } else {
          nextQuestion();
          setSelectedAnswer(null);
          setIsCorrect(null);
          setCorrectKey(null);
          setIsTransitioning(false);
        }
      }, 3000);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const getOptionClass = (option: 'A' | 'B' | 'C' | 'D') => {
    const baseClass = 'w-full p-4 text-left rounded-lg border-2 transition-all flex items-center justify-between';
    
    if (!selectedAnswer) {
      return `${baseClass} border-border hover:border-primary hover:bg-primary/5`;
    }

    if (option === correctKey) {
      return `${baseClass} border-green-500 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300`;
    }

    if (option === selectedAnswer && !isCorrect) {
      return `${baseClass} border-red-500 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300`;
    }

    return `${baseClass} border-border opacity-50`;
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[] = [
    { key: 'A', text: currentQuestion.optionA },
    { key: 'B', text: currentQuestion.optionB },
    { key: 'C', text: currentQuestion.optionC },
    { key: 'D', text: currentQuestion.optionD },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            Question {currentQuestionIndex + 1} of {currentQuiz?.questionCount}
          </span>
          <span className="text-muted-foreground">
            {currentQuiz?.category} → {currentQuiz?.subcategory}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-8">
              {/* Question Image - Flag */}
              {currentQuestion.imageUrl && (
                <div className="mb-6 flex justify-center">
                  <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl p-4 shadow-lg border-4 border-gray-200 dark:border-gray-700">
                    <img 
                      src={currentQuestion.imageUrl} 
                      alt="Flag" 
                      className="h-32 md:h-40 w-auto object-contain drop-shadow-md"
                      style={{ minWidth: '200px', maxWidth: '320px' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                      }}
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium shadow">
                      🏳️ Identify this flag
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-xl font-semibold mb-8">{currentQuestion.prompt}</h2>

              <div className="space-y-3">
                {options.map((option) => (
                  <button
                    key={option.key}
                    className={getOptionClass(option.key)}
                    onClick={() => handleAnswerClick(option.key)}
                    disabled={!!selectedAnswer}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-semibold text-sm">
                        {option.key}
                      </span>
                      <span>{option.text}</span>
                    </span>
                    {selectedAnswer && option.key === correctKey && (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    )}
                    {selectedAnswer && option.key === selectedAnswer && !isCorrect && (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                  </button>
                ))}
              </div>

              {selectedAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  {isCorrect ? (
                    <p className="text-green-600 font-semibold text-lg">🎉 Correct!</p>
                  ) : (
                    <p className="text-red-600 font-semibold text-lg">❌ Incorrect</p>
                  )}
                  <p className="text-muted-foreground text-sm mt-2">
                    {isLastQuestion ? 'Submitting results...' : 'Next question in 3 seconds...'}
                  </p>
                </motion.div>
              )}

            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}