import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { authRoutes } from './routes/auth';
import { quizRoutes } from './routes/quiz';
import { questionRoutes } from './routes/question';
import { resultRoutes } from './routes/result';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

createConnection()
  .then(() => {
    console.log('Database connected successfully');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/quiz', quizRoutes);
    app.use('/api/question', questionRoutes);
    app.use('/api/result', resultRoutes);
    
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
  });