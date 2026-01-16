import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchQuiz, submitAnswer } from '../../api';
import { Question } from '../../types';

const QuizPlayer: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const [quiz, setQuiz] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const loadQuiz = async () => {
            const fetchedQuiz = await fetchQuiz(quizId);
            setQuiz(fetchedQuiz);
        };
        loadQuiz();
    }, [quizId]);

    const handleAnswer = (answer: string) => {
        setUserAnswers([...userAnswers, answer]);
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setIsSubmitted(true);
            submitAnswer(quizId, userAnswers);
        }
    };

    if (isSubmitted) {
        return <div>Your answers have been submitted!</div>;
    }

    if (quiz.length === 0) {
        return <div>Loading...</div>;
    }

    const currentQuestion = quiz[currentQuestionIndex];

    return (
        <div>
            <h2>{currentQuestion.prompt}</h2>
            <div>
                {['option_a', 'option_b', 'option_c', 'option_d'].map((option) => (
                    <button key={option} onClick={() => handleAnswer(currentQuestion[option])}>
                        {currentQuestion[option]}
                    </button>
                ))}
            </div>
            <p>Question {currentQuestionIndex + 1} of {quiz.length}</p>
        </div>
    );
};

export default QuizPlayer;