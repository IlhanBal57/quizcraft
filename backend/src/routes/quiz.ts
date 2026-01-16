import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { quizzes, questions, categories, subcategories } from '../db/schema.js';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { generateQuestions } from '../services/questionGenerator.js';
import { z } from 'zod';

const router = Router();

const startQuizSchema = z.object({
  categoryId: z.number(),
  subcategoryId: z.number(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questionCount: z.number().min(5).max(30),
});

router.post('/start', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, subcategoryId, difficulty, questionCount } = startQuizSchema.parse(req.body);

    const category = await db.select().from(categories).where(eq(categories.id, categoryId)).get();
    const subcategory = await db.select().from(subcategories).where(eq(subcategories.id, subcategoryId)).get();

    if (!category || !subcategory) {
      return res.status(404).json({ error: 'Category or subcategory not found' });
    }

    let generatedQuestions;
    try {
      generatedQuestions = await generateQuestions({
        category: category.name,
        subcategory: subcategory.name,
        difficulty,
        count: questionCount,
      });
    } catch (genError: any) {
      console.error('Question generation failed:', genError);
      return res.status(503).json({ 
        error: 'Question generation failed', 
        message: 'Could not generate questions. Please try again.',
        details: genError.message 
      });
    }

    const quizUuid = uuidv4();
    const [newQuiz] = await db.insert(quizzes).values({
      uuid: quizUuid,
      userId: req.userId!,
      categoryId,
      subcategoryId,
      difficulty,
      questionCount,
      status: 'in_progress',
    }).returning();

    const questionValues = generatedQuestions.map((q, index) => ({
      quizId: newQuiz.id,
      questionIndex: index,
      prompt: q.prompt,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctKey: q.correctKey,
      explanation: q.explanation || null,
      imageUrl: q.imageUrl || null,
    }));

    await db.insert(questions).values(questionValues);

    const insertedQuestions = await db.select().from(questions).where(eq(questions.quizId, newQuiz.id)).orderBy(asc(questions.questionIndex));

    res.json({
      quizId: quizUuid,
      categoryId,
      subcategoryId,
      category: category.name,
      subcategory: subcategory.name,
      difficulty,
      questionCount,
      questions: insertedQuestions.map(q => ({
        id: q.id,
        index: q.questionIndex,
        prompt: q.prompt,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        imageUrl: q.imageUrl,
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Start quiz error:', error);
    res.status(500).json({ error: 'Failed to start quiz' });
  }
});

router.post('/:quizId/answer', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = req.params;
    const { questionIndex, answer } = req.body;

    const quiz = await db.select().from(quizzes).where(eq(quizzes.uuid, quizId)).get();
    if (!quiz || quiz.userId !== req.userId) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const question = await db.select().from(questions)
      .where(and(eq(questions.quizId, quiz.id), eq(questions.questionIndex, questionIndex)))
      .get();

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const isCorrect = question.correctKey === answer;
    await db.update(questions)
      .set({ userAnswer: answer, isCorrect: isCorrect ? 1 : 0 })
      .where(eq(questions.id, question.id));

    res.json({
      isCorrect,
      correctKey: question.correctKey,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error('Answer error:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

router.post('/:quizId/submit', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = req.params;
    const { durationSeconds } = req.body;

    const quiz = await db.select().from(quizzes).where(eq(quizzes.uuid, quizId)).get();
    if (!quiz || quiz.userId !== req.userId) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quizQuestions = await db.select().from(questions).where(eq(questions.quizId, quiz.id));
    const correctCount = quizQuestions.filter(q => q.isCorrect === 1).length;
    const scorePercentage = (correctCount / quiz.questionCount) * 100;

    const competingQuizzes = await db.select()
      .from(quizzes)
      .where(and(
        eq(quizzes.categoryId, quiz.categoryId),
        eq(quizzes.subcategoryId, quiz.subcategoryId),
        eq(quizzes.difficulty, quiz.difficulty),
        eq(quizzes.questionCount, quiz.questionCount),
        eq(quizzes.status, 'completed')
      ))
      .orderBy(desc(quizzes.scoreCorrect), asc(quizzes.durationSeconds));

    let rank = 1;
    for (const q of competingQuizzes) {
      if (q.scoreCorrect! > correctCount || 
         (q.scoreCorrect === correctCount && q.durationSeconds! < durationSeconds)) {
        rank++;
      } else {
        break;
      }
    }

    await db.update(quizzes).set({
      scoreCorrect: correctCount,
      scorePercentage,
      durationSeconds,
      status: 'completed',
      completedAt: new Date().toISOString(),
      computedRankAtSubmit: rank,
    }).where(eq(quizzes.id, quiz.id));

    res.json({
      scoreCorrect: correctCount,
      scorePercentage,
      durationSeconds,
      rank,
    });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

router.get('/:quizId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = req.params;

    const quiz = await db.select().from(quizzes).where(eq(quizzes.uuid, quizId)).get();
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const category = await db.select().from(categories).where(eq(categories.id, quiz.categoryId)).get();
    const subcategory = await db.select().from(subcategories).where(eq(subcategories.id, quiz.subcategoryId)).get();

    // Get all questions with their answers for review
    const quizQuestions = await db.select()
      .from(questions)
      .where(eq(questions.quizId, quiz.id))
      .orderBy(asc(questions.questionIndex));

    res.json({
      ...quiz,
      category: category?.name,
      subcategory: subcategory?.name,
      questions: quizQuestions.map(q => ({
        prompt: q.prompt,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctKey: q.correctKey,
        userAnswer: q.userAnswer,
        isCorrect: q.isCorrect === 1,
        explanation: q.explanation,
        imageUrl: q.imageUrl,
      })),
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to get quiz' });
  }
});

export default router;