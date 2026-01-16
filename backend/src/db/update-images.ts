import { db } from './index';
import { questions } from './schema';
import { eq } from 'drizzle-orm';

// Function to generate image URL (same as in questionGenerator.ts)
function getImageForKeyword(keyword: string): string {
  const seed = keyword.toLowerCase().replace(/\s+/g, '-');
  const randomNum = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/${seed}-${randomNum}/800/400`;
}

async function updateQuestionImages() {
  console.log('🖼️  Updating question images...\n');

  const allQuestions = await db.select().from(questions);
  
  console.log(`Found ${allQuestions.length} questions to update\n`);

  for (const question of allQuestions) {
    // Extract keyword from question prompt
    const promptLower = question.prompt.toLowerCase();
    let keyword = 'quiz';
    
    // Try to extract a meaningful keyword from the prompt
    if (promptLower.includes('football') || promptLower.includes('soccer')) {
      keyword = 'soccer';
    } else if (promptLower.includes('basketball')) {
      keyword = 'basketball';
    } else if (promptLower.includes('tennis')) {
      keyword = 'tennis';
    } else if (promptLower.includes('science')) {
      keyword = 'science';
    } else if (promptLower.includes('history')) {
      keyword = 'history';
    } else if (promptLower.includes('geography')) {
      keyword = 'geography';
    } else if (promptLower.includes('technology')) {
      keyword = 'technology';
    } else if (promptLower.includes('movie') || promptLower.includes('film')) {
      keyword = 'movie';
    } else if (promptLower.includes('music')) {
      keyword = 'music';
    } else if (promptLower.includes('food')) {
      keyword = 'food';
    } else if (promptLower.includes('animal')) {
      keyword = 'animals';
    } else if (promptLower.includes('nature')) {
      keyword = 'nature';
    } else if (promptLower.includes('game') || promptLower.includes('gaming')) {
      keyword = 'gaming';
    } else {
      // Use a random category
      const keywords = ['education', 'quiz', 'question', 'knowledge', 'learning'];
      keyword = keywords[Math.floor(Math.random() * keywords.length)];
    }

    const imageUrl = getImageForKeyword(keyword);
    
    await db.update(questions)
      .set({ imageUrl })
      .where(eq(questions.id, question.id));

    console.log(`✅ Updated question ${question.id}: ${keyword} -> ${imageUrl}`);
  }

  console.log('\n✨ All questions updated with images!');
  process.exit(0);
}

updateQuestionImages().catch(console.error);
