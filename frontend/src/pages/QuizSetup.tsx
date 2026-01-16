import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoriesAPI, quizAPI } from '../lib/api';
import { Category, Subcategory } from '../types';
import { useQuizStore } from '../store/quizStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Play, Loader2 } from 'lucide-react';

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: 'bg-green-500', description: 'Perfect for beginners' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500', description: 'For the average quizzer' },
  { value: 'hard', label: 'Hard', color: 'bg-red-500', description: 'Challenge yourself!' },
];

const QUESTION_COUNTS = [10, 15, 20];

export default function QuizSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setQuiz } = useQuizStore();
  
  const [step, setStep] = useState<'category' | 'subcategory' | 'config'>('category');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data);
        
        // Check if coming from home with a pre-selected category
        const categoryId = location.state?.categoryId;
        if (categoryId) {
          const category = response.data.find((c: Category) => c.id === categoryId);
          if (category) {
            setSelectedCategory(category);
            setStep('subcategory');
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [location.state]);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setStep('subcategory');
  };

  const handleSubcategorySelect = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setStep('config');
  };

  const handleBack = () => {
    if (step === 'config') {
      setStep('subcategory');
      setSelectedSubcategory(null);
    } else if (step === 'subcategory') {
      setStep('category');
      setSelectedCategory(null);
    } else {
      navigate('/home');
    }
  };

  const handleStartQuiz = async () => {
    if (!selectedCategory || !selectedSubcategory) return;

    setStarting(true);
    try {
      const response = await quizAPI.start({
        categoryId: selectedCategory.id,
        subcategoryId: selectedSubcategory.id,
        difficulty,
        questionCount,
      });
      
      setQuiz(response.data);
      navigate(`/quiz/play/${response.data.quizId}`);
    } catch (error) {
      console.error('Failed to start quiz:', error);
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {step === 'category' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold mb-6">Select a Category</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => handleCategorySelect(category)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <h3 className="font-semibold">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {step === 'subcategory' && selectedCategory && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">
            {selectedCategory.icon} {selectedCategory.name}
          </h1>
          <p className="text-muted-foreground mb-6">Choose a subcategory</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {selectedCategory.subcategories?.map((sub) => (
              <Card
                key={sub.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => handleSubcategorySelect(sub)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">{sub.icon}</div>
                  <h3 className="font-semibold">{sub.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {step === 'config' && selectedCategory && selectedSubcategory && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {selectedSubcategory.icon} {selectedSubcategory.name}
            </h1>
            <p className="text-muted-foreground">Configure your quiz</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      difficulty === d.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setDifficulty(d.value)}
                  >
                    <div className={`w-3 h-3 rounded-full ${d.color} mx-auto mb-2`}></div>
                    <div className="font-semibold">{d.label}</div>
                    <div className="text-xs text-muted-foreground">{d.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Number of Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {QUESTION_COUNTS.map((count) => (
                  <button
                    key={count}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      questionCount === count
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setQuestionCount(count)}
                  >
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground">questions</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            size="xl"
            className="w-full"
            onClick={handleStartQuiz}
            disabled={starting}
          >
            {starting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Start Quiz
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
