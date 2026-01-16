export interface Result {
    id: number;
    user_id: number;
    quiz_id: number;
    score: number;
    total_questions: number;
    correct_answers: number;
    created_at: Date;
}