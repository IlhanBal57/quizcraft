import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import quizRoutes from './routes/quiz.js';
import leaderboardRoutes from './routes/leaderboard.js';
import adminRoutes from './routes/admin.js';
import profileRoutes from './routes/profile.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173', 
    'http://localhost:5174', 
    'http://127.0.0.1:5174', 
    'http://localhost:3000',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://127.0.0.1:8081',
    'http://127.0.0.1:8082',
  ],
  credentials: true,
}));
app.use(express.json());

// Genel rate limiter - 15 dakikada 1000 istek
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Quiz rate limiter - 1 dakikada 30 quiz
const quizLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Quiz generation rate limit exceeded. Please wait.' },
});
app.use('/api/quiz/start', quizLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 QuizCraft API running on http://localhost:${PORT}`);
});

export default app;
