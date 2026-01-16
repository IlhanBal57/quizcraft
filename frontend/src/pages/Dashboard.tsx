import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import QuizCard from '../components/quiz/QuizCard';
import Layout from '../components/layout/Layout';

const Dashboard: React.FC = () => {
    const quizzes = useSelector((state: RootState) => state.quiz.quizzes);

    return (
        <Layout>
            <div className="dashboard">
                <h1 className="text-2xl font-bold mb-4">Your Quizzes</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quizzes.map((quiz) => (
                        <QuizCard key={quiz.id} quiz={quiz} />
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;