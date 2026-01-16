import { Request } from 'express';

export interface User {
    id: number;
    email: string;
    password_hash: string;
    role: 'user' | 'admin';
    created_at: Date;
    last_login: Date | null;
}

export interface Quiz {
    id: number;
    user_id: number;
    category_id: number;
    subcategory_id: number;
    difficulty: 'easy' | 'medium' | 'hard';
    question_count: number;
    score_correct: number;
    score_percentage: number;
    duration_seconds: number;
    created_at: Date;
    computed_rank_at_submit: Date | null;
}

export interface Question {
    id: number;
    quiz_id: number;
    index: number;
    prompt: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_key: 'a' | 'b' | 'c' | 'd';
    explanation: string | null;
    image_url: string | null;
}

export interface Result {
    id: number;
    quiz_id: number;
    user_id: number;
    score: number;
    created_at: Date;
}

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}