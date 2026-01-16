import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { quizAPI, leaderboardAPI } from '../lib/api';
import { useQuizStore } from '../store/quizStore';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Trophy, Home, RotateCcw, Share2, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatTime, getMedalEmoji } from '../lib/utils';

export default function QuizResults() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { reset } = useQuizStore();
  const { user } = useAuthStore();
  
  const [result, setResult] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!quizId) return;

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

        if (quizRes.data.scorePercentage >= 70) {
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 },
            });
          }, 500);
        }
      } catch (error) {
        console.error('Failed to fetch results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  const handlePlayAgain = () => {
    reset();
    navigate('/quiz/setup', {
      state: {
        categoryId: result?.categoryId,
        subcategoryId: result?.subcategoryId,
      },
    });
  };

  const handleGoHome = () => {
    reset();
    navigate('/home');
  };

  const handleShare = () => {
    const text = `I scored ${result?.scoreCorrect}/${result?.questionCount} (${result?.scorePercentage?.toFixed(0)}%) on QuizCraft - ${result?.category} / ${result?.subcategory}! 🎯`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <p>Results not found</p>
        <Button onClick={handleGoHome} className="mt-4">Go Home</Button>
      </div>
    );
  }

  const isTopThree = result.computedRankAtSubmit <= 3;
  const userRank = result.computedRankAtSubmit;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="text-6xl mb-4">
              {result.scorePercentage >= 80 ? '🏆' : result.scorePercentage >= 50 ? '👏' : '💪'}
            </div>
            <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-secondary">
                <div className="text-3xl font-bold text-primary">
                  {result.scoreCorrect}/{result.questionCount}
                </div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
              <div className="p-4 rounded-lg bg-secondary">
                <div className="text-3xl font-bold text-primary">
                  {result.scorePercentage?.toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="p-4 rounded-lg bg-secondary">
                <div className="text-3xl font-bold text-primary">
                  {formatTime(result.durationSeconds || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Time</div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {result.category} → {result.subcategory} • {result.difficulty} • {result.questionCount} questions
            </div>

            {userRank && (
              <div className={`p-4 rounded-lg ${isTopThree ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-secondary'}`}>
                <div className="text-2xl font-bold">
                  {isTopThree && getMedalEmoji(userRank)} Rank #{userRank}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isTopThree ? 'Congratulations! You made it to the podium! 🎉' : 'Keep practicing to reach the top 3!'}
                </div>
              </div>
            )}

            {/* Toggle Questions Review */}
            <Button 
              variant="outline" 
              onClick={() => setShowQuestions(!showQuestions)}
              className="w-full"
            >
              {showQuestions ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
              {showQuestions ? 'Hide Questions' : 'Review Questions'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Questions Review Section */}
      {showQuestions && result.questions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          {result.questions.map((q: any, index: number) => (
            <Card key={index} className={q.isCorrect ? 'border-green-500/50' : 'border-red-500/50'}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-1 rounded-full ${q.isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    {q.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">Question {index + 1}</div>
                    
                    {/* Question Image */}
                    {q.imageUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        <img 
                          src={q.imageUrl} 
                          alt="Question illustration" 
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <p className="font-medium mb-2">{q.prompt}</p>
                    
                    <div className="space-y-1 text-sm">
                      {['A', 'B', 'C', 'D'].map((key) => {
                        const optionKey = `option${key}` as keyof typeof q;
                        const isCorrect = q.correctKey === key;
                        const isUserAnswer = q.userAnswer === key;
                        
                        return (
                          <div 
                            key={key}
                            className={`p-2 rounded ${
                              isCorrect 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                : isUserAnswer && !isCorrect
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            <span className="font-medium">{key}:</span> {q[optionKey]}
                            {isCorrect && ' ✓'}
                            {isUserAnswer && !isCorrect && ' (Your answer)'}
                          </div>
                        );
                      })}
                    </div>
                    
                    {q.explanation && (
                      <div className="mt-2 p-2 bg-secondary rounded text-sm">
                        <span className="font-medium">Explanation:</span> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.slice(0, 3).map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      entry.userId === user?.id ? 'bg-primary/10 border border-primary' : 'bg-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getMedalEmoji(entry.rank)}</span>
                      <span className="font-medium">{entry.email}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{entry.scoreCorrect}/{result.questionCount}</div>
                      <div className="text-xs text-muted-foreground">{formatTime(entry.durationSeconds)}</div>
                    </div>
                  </div>
                ))}

                {!isTopThree && userRank > 3 && (
                  <>
                    <div className="text-center text-muted-foreground py-2">• • •</div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary">
                      <div className="flex items-center gap-3">
                        <span className="font-bold">#{userRank}</span>
                        <span className="font-medium">You</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{result.scoreCorrect}/{result.questionCount}</div>
                        <div className="text-xs text-muted-foreground">{formatTime(result.durationSeconds)}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                You're the first to complete this quiz configuration! 🎉
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex gap-4">
        <Button variant="outline" className="flex-1" onClick={handleGoHome}>
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button className="flex-1" onClick={handlePlayAgain}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Play Again
        </Button>
      </div>
    </div>
  );
}