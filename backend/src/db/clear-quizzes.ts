import { db } from './index';
import { questions, quizzes } from './schema';

async function clearQuizzes() {
  console.log('🗑️  Clearing all quizzes and questions...\n');

  // Delete all questions first (foreign key)
  await db.delete(questions);
  console.log('✅ All questions deleted');

  // Delete all quizzes
  await db.delete(quizzes);
  console.log('✅ All quizzes deleted');

  console.log('\n✨ Database cleared! New quizzes will get fresh questions.');
  process.exit(0);
}

clearQuizzes().catch(console.error);
