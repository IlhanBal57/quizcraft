import { Request, Response } from 'express';
import { Quiz } from '../models/Quiz';
import { quizService } from '../services/quizService';

export const createQuiz = async (req: Request, res: Response) => {
    try {
        const quizData = req.body;
        const newQuiz = await quizService.createQuiz(quizData);
        res.status(201).json(newQuiz);
    } catch (error) {
        res.status(500).json({ message: 'Error creating quiz', error });
    }
};

export const getQuizzes = async (req: Request, res: Response) => {
    try {
        const quizzes = await quizService.getQuizzes();
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving quizzes', error });
    }
};

export const getQuizById = async (req: Request, res: Response) => {
    try {
        const quizId = req.params.id;
        const quiz = await quizService.getQuizById(quizId);
        if (quiz) {
            res.status(200).json(quiz);
        } else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving quiz', error });
    }
};

export const updateQuiz = async (req: Request, res: Response) => {
    try {
        const quizId = req.params.id;
        const quizData = req.body;
        const updatedQuiz = await quizService.updateQuiz(quizId, quizData);
        if (updatedQuiz) {
            res.status(200).json(updatedQuiz);
        } else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating quiz', error });
    }
};

export const deleteQuiz = async (req: Request, res: Response) => {
    try {
        const quizId = req.params.id;
        const deleted = await quizService.deleteQuiz(quizId);
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting quiz', error });
    }
};