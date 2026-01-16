import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoriesAPI, leaderboardAPI } from '../lib/api';
import { Category } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Trophy, Play, ChevronRight } from 'lucide-react';
import { getMedalEmoji } from '../lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, leadRes] = await Promise.all([
          categoriesAPI.getAll(),
          leaderboardAPI.getAllCategories(),
        ]);
        setCategories(catRes.data);
        setLeaderboards(leadRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryClick = (categoryId: number) => {
    navigate('/quiz/setup', { state: { categoryId } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Choose Your Challenge</h1>
        <p className="text-muted-foreground">Select a category to test your knowledge</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => {
          const leaderboard = leaderboards.find(l => l.categoryId === category.id);
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                style={{ borderTopColor: category.color || '#3b82f6', borderTopWidth: '4px' }}
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      {category.name}
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.subcategories?.length || 0} subcategories
                  </p>
                  
                  {leaderboard?.top3?.length > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center gap-1 text-sm font-medium mb-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        Top Players
                      </div>
                      <div className="space-y-1">
                        {leaderboard.top3.slice(0, 3).map((entry: any) => (
                          <div key={entry.rank} className="flex items-center justify-between text-sm">
                            <span>
                              {getMedalEmoji(entry.rank)} {entry.email}
                            </span>
                            <span className="text-muted-foreground">
                              {entry.scorePercentage?.toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}