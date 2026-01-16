import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
    return (
        <div className="sidebar">
            <h2>QuizCraft</h2>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/quiz/create">Create Quiz</Link>
                    </li>
                    <li>
                        <Link to="/quiz/play">Play Quiz</Link>
                    </li>
                    <li>
                        <Link to="/results">Results</Link>
                    </li>
                    <li>
                        <Link to="/profile">Profile</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;