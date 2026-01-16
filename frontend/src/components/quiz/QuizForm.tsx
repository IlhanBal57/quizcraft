import React, { useState } from 'react';

const QuizForm: React.FC = () => {
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState('easy');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle quiz creation logic here
        console.log({
            title: quizTitle,
            description: quizDescription,
            category,
            difficulty,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="quiz-form">
            <div>
                <label htmlFor="quizTitle">Quiz Title</label>
                <input
                    type="text"
                    id="quizTitle"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="quizDescription">Description</label>
                <textarea
                    id="quizDescription"
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="category">Category</label>
                <input
                    type="text"
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="difficulty">Difficulty</label>
                <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </div>
            <button type="submit">Create Quiz</button>
        </form>
    );
};

export default QuizForm;