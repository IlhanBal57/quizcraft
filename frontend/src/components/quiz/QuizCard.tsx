import React from 'react';

interface QuizCardProps {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    onStart: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ title, description, category, difficulty, onStart }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-gray-700">{description}</p>
            <p className="text-gray-500">Category: {category}</p>
            <p className="text-gray-500">Difficulty: {difficulty}</p>
            <button 
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded" 
                onClick={onStart}
            >
                Start Quiz
            </button>
        </div>
    );
};

export default QuizCard;