import { db } from './index.js';
import { categories, subcategories, users, questions } from './schema.js';

async function check() {
  console.log('📊 Database status:');
  
  const allUsers = await db.select().from(users);
  console.log(`\nUsers: ${allUsers.length}`);
  allUsers.forEach(u => console.log(`  - ${u.email} (${u.role})`));
  
  const allCats = await db.select().from(categories);
  console.log(`\nCategories: ${allCats.length}`);
  allCats.forEach(c => console.log(`  - ${c.icon} ${c.name}`));
  
  const allSubs = await db.select().from(subcategories);
  console.log(`\nSubcategories: ${allSubs.length}`);

  // Check questions for imageUrl
  const allQuestions = await db.select().from(questions).limit(10);
  console.log(`\n📝 Son 10 Soru (ImageUrl kontrolü):`);
  allQuestions.forEach((q, i) => {
    console.log(`  ${i + 1}. ${q.prompt?.substring(0, 40)}...`);
    console.log(`     ImageUrl: ${q.imageUrl || '❌ YOK'}`);
  });
  
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
