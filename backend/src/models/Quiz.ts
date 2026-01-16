export interface Quiz {
    id: number;
    user_id: number;
    category_id: number;
    subcategory_id: number;
    difficulty: string;
    question_count: number;
    score_correct: number;
    score_percentage: number;
    duration_seconds: number;
    created_at: Date;
    computed_rank_at_submit: Date;
}