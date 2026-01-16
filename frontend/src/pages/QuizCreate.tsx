import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createQuiz } from '../../store/quizSlice';
import QuizForm from '../components/quiz/QuizForm';

const QuizCreate = () => {
    const dispatch = useDispatch();
    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        questions: [],
    });

    const handleQuizDataChange = (data) => {
        setQuizData(data);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        dispatch(createQuiz(quizData));
    };

    return (
        <div className="quiz-create">
            <h1>Create a New Quiz</h1>
            <QuizForm 
                quizData={quizData} 
                onQuizDataChange={handleQuizDataChange} 
                onSubmit={handleSubmit} 
            />
        </div>
    );
};

export default QuizCreate;