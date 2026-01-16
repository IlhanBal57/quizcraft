import { Quiz } from '../models/Quiz';
import { Question } from '../models/Question';
import { Result } from '../models/Result';
import { Database } from '../config/database';

export const createQuiz = async (quizData) => {
    const quiz = await Database.insert(Quiz, quizData);
    return quiz;
};

export const getQuizById = async (quizId) => {
    const quiz = await Database.findById(Quiz, quizId);
    return quiz;
};

export const getAllQuizzes = async () => {
    const quizzes = await Database.findAll(Quiz);
    return quizzes;
};

export const addQuestionToQuiz = async (quizId, questionData) => {
    const question = await Database.insert(Question, { ...questionData, quiz_id: quizId });
    return question;
};

export const calculateScore = (answers, correctAnswers) => {
    let score = 0;
    answers.forEach((answer, index) => {
        if (answer === correctAnswers[index]) {
            score++;
        }
    });
    return score;
};

export const saveResult = async (resultData) => {
    const result = await Database.insert(Result, resultData);
    return result;
};