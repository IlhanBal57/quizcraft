export interface Question {
    id: number;
    quiz_id: number;
    index: number;
    prompt: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_key: 'A' | 'B' | 'C' | 'D';
    explanation?: string;
    image_url?: string;
}