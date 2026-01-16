import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { quizzes, users, categories, subcategories } from '../db/schema.js';
import { eq, and, desc, asc } from 'drizzle-orm';

const router = Router();

router.get('/config', async (req, res: Response) => {
  try {
    const { categoryId, subcategoryId, difficulty, questionCount } = req.query;

    if (!categoryId || !subcategoryId || !difficulty || !questionCount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const completedQuizzes = await db
      .select({
        userId: quizzes.userId,
        email: users.email,
        scoreCorrect: quizzes.scoreCorrect,
        scorePercentage: quizzes.scorePercentage,
        durationSeconds: quizzes.durationSeconds,
        completedAt: quizzes.completedAt,
      })
      .from(quizzes)
      .innerJoin(users, eq(quizzes.userId, users.id))
      .where(
        and(
          eq(quizzes.categoryId, parseInt(categoryId as string)),
          eq(quizzes.subcategoryId, parseInt(subcategoryId as string)),
          eq(quizzes.difficulty, difficulty as string),
          eq(quizzes.questionCount, parseInt(questionCount as string)),
          eq(quizzes.status, 'completed')
        )
      )
      .orderBy(desc(quizzes.scoreCorrect), asc(quizzes.durationSeconds));

    const leaderboard = completedQuizzes.map((q, index) => ({
      rank: index + 1,
      userId: q.userId,
      email: q.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      scoreCorrect: q.scoreCorrect,
      scorePercentage: q.scorePercentage,
      durationSeconds: q.durationSeconds,
      completedAt: q.completedAt,
    }));

    return res.json({ leaderboard: leaderboard.slice(0, 10) });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

router.get('/category/:categoryId/top', async (req, res: Response) => {
  try {
    const categoryId = parseInt(req.params.categoryId);

    const category = await db.select().from(categories).where(eq(categories.id, categoryId)).get();
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const topScores = await db
      .select({
        userId: quizzes.userId,
        email: users.email,
        scoreCorrect: quizzes.scoreCorrect,
        scorePercentage: quizzes.scorePercentage,
        durationSeconds: quizzes.durationSeconds,
        subcategoryId: quizzes.subcategoryId,
        difficulty: quizzes.difficulty,
        questionCount: quizzes.questionCount,
      })
      .from(quizzes)
      .innerJoin(users, eq(quizzes.userId, users.id))
      .where(
        and(
          eq(quizzes.categoryId, categoryId),
          eq(quizzes.status, 'completed')
        )
      )
      .orderBy(desc(quizzes.scorePercentage), asc(quizzes.durationSeconds))
      .limit(3);

    const subs = await db.select().from(subcategories).where(eq(subcategories.categoryId, categoryId));

    const top3 = topScores.map((score, index) => ({
      rank: index + 1,
      email: score.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      scorePercentage: score.scorePercentage,
      subcategory: subs.find(s => s.id === score.subcategoryId)?.name,
      difficulty: score.difficulty,
    }));

    return res.json({
      category: category.name,
      categoryIcon: category.icon,
      top3,
    });
  } catch (error) {
    console.error('Category top fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch top scores' });
  }
});

router.get('/all-categories', async (req, res: Response) => {
  try {
    const allCategories = await db.select().from(categories);
    const result = [];

    for (const category of allCategories) {
      const topScores = await db
        .select({
          email: users.email,
          scorePercentage: quizzes.scorePercentage,
          durationSeconds: quizzes.durationSeconds,
        })
        .from(quizzes)
        .innerJoin(users, eq(quizzes.userId, users.id))
        .where(
          and(
            eq(quizzes.categoryId, category.id),
            eq(quizzes.status, 'completed')
          )
        )
        .orderBy(desc(quizzes.scorePercentage), asc(quizzes.durationSeconds))
        .limit(3);

      result.push({
        categoryId: category.id,
        categoryName: category.name,
        categoryIcon: category.icon,
        categoryColor: category.color,
        top3: topScores.map((score, index) => ({
          rank: index + 1,
          email: score.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
          scorePercentage: score.scorePercentage,
        })),
      });
    }

    return res.json(result);
  } catch (error) {
    console.error('All categories leaderboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboards' });
  }
});

export default router;
