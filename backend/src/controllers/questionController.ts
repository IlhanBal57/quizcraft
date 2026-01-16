import { Request, Response } from 'express';
import { Question } from '../models/Question';
import { Quiz } from '../models/Quiz';

// Create a new question
export const createQuestion = async (req: Request, res: Response) => {
    try {
        const { quiz_id, prompt, option_a, option_b, option_c, option_d, correct_key, explanation, image_url } = req.body;
        const newQuestion = await Question.create({
            quiz_id,
            prompt,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_key,
            explanation,
            image_url
        });
        res.status(201).json(newQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Error creating question', error });
    }
};

// Get all questions for a specific quiz
export const getQuestionsByQuizId = async (req: Request, res: Response) => {
    try {
        const { quiz_id } = req.params;
        const questions = await Question.findAll({ where: { quiz_id } });
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving questions', error });
    }
};

// Update a question
export const updateQuestion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedQuestion = await Question.update(req.body, { where: { id } });
        if (updatedQuestion[0] === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json({ message: 'Question updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating question', error });
    }
};

// Delete a question
export const deleteQuestion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Question.destroy({ where: { id } });
        if (deleted === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting question', error });
    }
};