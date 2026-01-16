import { useEffect, useState } from 'react';
import { fetchQuizzes, createQuiz, updateQuiz } from '../api';

const useQuiz = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadQuizzes = async () => {
            try {
                const data = await fetchQuizzes();
                setQuizzes(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadQuizzes();
    }, []);

    const addQuiz = async (quizData) => {
        try {
            const newQuiz = await createQuiz(quizData);
            setQuizzes((prevQuizzes) => [...prevQuizzes, newQuiz]);
        } catch (err) {
            setError(err);
        }
    };

    const editQuiz = async (quizId, quizData) => {
        try {
            const updatedQuiz = await updateQuiz(quizId, quizData);
            setQuizzes((prevQuizzes) =>
                prevQuizzes.map((quiz) => (quiz.id === quizId ? updatedQuiz : quiz))
            );
        } catch (err) {
            setError(err);
        }
    };

    return { quizzes, loading, error, addQuiz, editQuiz };
};

export default useQuiz;