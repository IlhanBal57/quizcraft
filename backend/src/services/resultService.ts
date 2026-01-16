import { Result } from '../models/Result';
import { Quiz } from '../models/Quiz';
import { User } from '../models/User';
import db from '../config/database';

export const createResult = async (userId: number, quizId: number, score: number) => {
    const result = new Result({
        user_id: userId,
        quiz_id: quizId,
        score: score,
        created_at: new Date(),
    });

    await db('results').insert(result);
    return result;
};

export const getResultsByQuizId = async (quizId: number) => {
    const results = await db('results').where({ quiz_id: quizId }).select('*');
    return results;
};

export const getLeaderboard = async (quizId: number) => {
    const leaderboard = await db('results')
        .where({ quiz_id: quizId })
        .orderBy('score', 'desc')
        .limit(10);
    return leaderboard;
};

export const getUserResults = async (userId: number) => {
    const results = await db('results').where({ user_id: userId }).select('*');
    return results;
};