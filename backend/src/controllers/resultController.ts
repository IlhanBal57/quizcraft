import { Request, Response } from 'express';
import ResultService from '../services/resultService';

class ResultController {
    async getResults(req: Request, res: Response) {
        try {
            const results = await ResultService.getAllResults();
            res.status(200).json(results);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving results', error });
        }
    }

    async getResultById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const result = await ResultService.getResultById(id);
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({ message: 'Result not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving result', error });
        }
    }

    async createResult(req: Request, res: Response) {
        try {
            const newResult = await ResultService.createResult(req.body);
            res.status(201).json(newResult);
        } catch (error) {
            res.status(500).json({ message: 'Error creating result', error });
        }
    }

    async updateResult(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const updatedResult = await ResultService.updateResult(id, req.body);
            if (updatedResult) {
                res.status(200).json(updatedResult);
            } else {
                res.status(404).json({ message: 'Result not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error updating result', error });
        }
    }

    async deleteResult(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const deleted = await ResultService.deleteResult(id);
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Result not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error deleting result', error });
        }
    }
}

export default new ResultController();