import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { quizzes, users, categories, subcategories } from '../db/schema.js';
import { eq, desc, count } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.userId, userId));

    const completedQuizzes = userQuizzes.filter(q => q.status === 'completed');
    const totalQuizzes = completedQuizzes.length;
    
    // Calculate average score
    const avgScore = totalQuizzes > 0 
      ? completedQuizzes.reduce((sum, q) => sum + (q.scorePercentage || 0), 0) / totalQuizzes 
      : 0;

    // Calculate best score
    const bestScore = totalQuizzes > 0
      ? Math.max(...completedQuizzes.map(q => q.scorePercentage || 0))
      : 0;

    // Calculate total time
    const totalTime = completedQuizzes.reduce((sum, q) => sum + (q.durationSeconds || 0), 0);

    let bestStreak = 0;
    let currentStreak = 0;
    for (const quiz of completedQuizzes.sort((a, b) => 
      new Date(a.completedAt || 0).getTime() - new Date(b.completedAt || 0).getTime()
    )) {
      if ((quiz.scorePercentage || 0) >= 70) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // Get recent history (last 10)
    const allCategories = await db.select().from(categories);
    const allSubcategories = await db.select().from(subcategories);

    const recentQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.userId, userId))
      .orderBy(desc(quizzes.startedAt))
      .limit(10);

    const history = recentQuizzes.map(quiz => ({
      id: quiz.uuid,
      category: allCategories.find(c => c.id === quiz.categoryId)?.name,
      subcategory: allSubcategories.find(s => s.id === quiz.subcategoryId)?.name,
      difficulty: quiz.difficulty,
      questionCount: quiz.questionCount,
      scoreCorrect: quiz.scoreCorrect,
      scorePercentage: quiz.scorePercentage,
      durationSeconds: quiz.durationSeconds,
      status: quiz.status,
      rank: quiz.computedRankAtSubmit,
      date: quiz.completedAt || quiz.startedAt,
      categoryId: quiz.categoryId,
      subcategoryId: quiz.subcategoryId,
    }));

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      stats: {
        totalQuizzes,
        avgScore: Math.round(avgScore * 10) / 10,
        bestScore: Math.round(bestScore * 10) / 10,
        totalTime,
        bestStreak,
      },
      history,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.get('/history', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const allCategories = await db.select().from(categories);
    const allSubcategories = await db.select().from(subcategories);

    const userQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.userId, userId))
      .orderBy(desc(quizzes.startedAt))
      .limit(limit)
      .offset(offset);

    const history = userQuizzes.map(quiz => ({
      id: quiz.uuid,
      category: allCategories.find(c => c.id === quiz.categoryId)?.name,
      subcategory: allSubcategories.find(s => s.id === quiz.subcategoryId)?.name,
      difficulty: quiz.difficulty,
      questionCount: quiz.questionCount,
      scoreCorrect: quiz.scoreCorrect,
      scorePercentage: quiz.scorePercentage,
      durationSeconds: quiz.durationSeconds,
      status: quiz.status,
      rank: quiz.computedRankAtSubmit,
      date: quiz.completedAt || quiz.startedAt,
      categoryId: quiz.categoryId,
      subcategoryId: quiz.subcategoryId,
    }));

    const totalCount = await db
      .select({ count: count() })
      .from(quizzes)
      .where(eq(quizzes.userId, userId));

    return res.json({
      history,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('History fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
