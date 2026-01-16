import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { profileAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Trophy, Clock, BarChart3, Play, Calendar } from 'lucide-react';
import { formatTime, formatDate, getMedalEmoji } from '../lib/utils';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileAPI.get();
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePlayAgain = (quiz: any) => {
    navigate('/quiz/setup', {
      state: {
        categoryId: quiz.categoryId,
        subcategoryId: quiz.subcategoryId,
      },
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = profile?.stats || {};
  const history = profile?.history || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user?.email}</h1>
                  <p className="text-muted-foreground capitalize">
                    {user?.role} • Member since {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{stats.totalQuizzes || 0}</div>
              <div className="text-sm text-muted-foreground">Quizzes Taken</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.avgScore?.toFixed(0) || 0}%</div>
              <div className="text-sm text-muted-foreground">Avg. Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.bestScore?.toFixed(0) || 0}%</div>
              <div className="text-sm text-muted-foreground">Best Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{formatTime(stats.totalTime || 0)}</div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quiz History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Category</th>
                      <th className="text-left py-3 px-2">Difficulty</th>
                      <th className="text-center py-3 px-2">Score</th>
                      <th className="text-center py-3 px-2">Time</th>
                      <th className="text-center py-3 px-2">Rank</th>
                      <th className="text-right py-3 px-2">Date</th>
                      <th className="text-right py-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((quiz: any) => (
                      <tr key={quiz.id} className="border-b hover:bg-secondary/50">
                        <td className="py-3 px-2">
                          <div className="font-medium">{quiz.category}</div>
                          <div className="text-sm text-muted-foreground">{quiz.subcategory}</div>
                        </td>
                        <td className="py-3 px-2 capitalize">{quiz.difficulty}</td>
                        <td className="py-3 px-2 text-center">
                          <span className="font-semibold">{quiz.scoreCorrect}/{quiz.questionCount}</span>
                          <span className="text-muted-foreground ml-1">({quiz.scorePercentage?.toFixed(0)}%)</span>
                        </td>
                        <td className="py-3 px-2 text-center">{formatTime(quiz.durationSeconds)}</td>
                        <td className="py-3 px-2 text-center">
                          {quiz.rank && quiz.rank <= 3 ? (
                            <span className="text-lg">{getMedalEmoji(quiz.rank)}</span>
                          ) : quiz.rank ? (
                            `#${quiz.rank}`
                          ) : '-'}
                        </td>
                        <td className="py-3 px-2 text-right text-sm text-muted-foreground">
                          {formatDate(quiz.date)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button size="sm" variant="ghost" onClick={() => handlePlayAgain(quiz)}>
                            <Play className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No quizzes taken yet</p>
                <Button className="mt-4" onClick={() => navigate('/home')}>
                  Take Your First Quiz
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}