import bcrypt from 'bcryptjs';
import { db } from './index.js';
import { users, categories, subcategories } from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Seeding database...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@quizcraft.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  try {
    await db.insert(users).values({
      email: adminEmail,
      passwordHash,
      role: 'admin',
    }).onConflictDoNothing();
    console.log(`✅ Admin user created: ${adminEmail}`);
  } catch (e) {
    console.log('Admin user already exists');
  }

  const categoryData = [
    {
      name: 'Sports', slug: 'sports', icon: '⚽', color: '#22c55e',
      subs: [
        { name: 'Football (Soccer)', slug: 'football', icon: '⚽' },
        { name: 'Basketball', slug: 'basketball', icon: '🏀' },
        { name: 'Tennis', slug: 'tennis', icon: '🎾' },
        { name: 'American Football', slug: 'american-football', icon: '🏈' },
        { name: 'Formula 1', slug: 'f1', icon: '🏎️' },
        { name: 'Golf', slug: 'golf', icon: '⛳' },
        { name: 'Boxing & MMA', slug: 'boxing-mma', icon: '🥊' },
        { name: 'Olympics', slug: 'olympics', icon: '🏅' },
        { name: 'Cricket', slug: 'cricket', icon: '🏏' },
      ],
    },
    {
      name: 'Entertainment', slug: 'entertainment', icon: '🎬', color: '#8b5cf6',
      subs: [
        { name: 'Movies', slug: 'movies', icon: '🎬' },
        { name: 'TV Shows', slug: 'tv-shows', icon: '📺' },
        { name: 'Music', slug: 'music', icon: '🎵' },
        { name: 'Celebrities', slug: 'celebrities', icon: '⭐' },
        { name: 'Anime & Manga', slug: 'anime-manga', icon: '🎌' },
        { name: 'K-Pop', slug: 'kpop', icon: '🎤' },
        { name: 'Video Games', slug: 'video-games', icon: '🎮' },
      ],
    },
    {
      name: 'Science', slug: 'science', icon: '🔬', color: '#06b6d4',
      subs: [
        { name: 'Physics', slug: 'physics', icon: '⚛️' },
        { name: 'Chemistry', slug: 'chemistry', icon: '🧪' },
        { name: 'Biology', slug: 'biology', icon: '🧬' },
        { name: 'Astronomy', slug: 'astronomy', icon: '🔭' },
        { name: 'Medicine', slug: 'medicine', icon: '🩺' },
        { name: 'Mathematics', slug: 'mathematics', icon: '📐' },
      ],
    },
    {
      name: 'History', slug: 'history', icon: '📜', color: '#f59e0b',
      subs: [
        { name: 'Ancient History', slug: 'ancient', icon: '🏛️' },
        { name: 'Medieval History', slug: 'medieval', icon: '⚔️' },
        { name: 'Modern History', slug: 'modern', icon: '📰' },
        { name: 'World Wars', slug: 'world-wars', icon: '🎖️' },
        { name: 'American History', slug: 'american', icon: '🗽' },
      ],
    },
    {
      name: 'Geography', slug: 'geography', icon: '🌍', color: '#10b981',
      subs: [
        { name: 'World Capitals', slug: 'capitals', icon: '🏛️' },
        { name: 'Countries & Flags', slug: 'countries-flags', icon: '🏳️' },
        { name: 'Mountains & Rivers', slug: 'mountains-rivers', icon: '🏔️' },
        { name: 'Famous Landmarks', slug: 'landmarks', icon: '🗼' },
      ],
    },
    {
      name: 'Technology', slug: 'technology', icon: '💻', color: '#3b82f6',
      subs: [
        { name: 'Artificial Intelligence', slug: 'ai', icon: '🤖' },
        { name: 'Programming', slug: 'programming', icon: '👨‍💻' },
        { name: 'Gadgets & Devices', slug: 'gadgets', icon: '📱' },
        { name: 'Cybersecurity', slug: 'cybersecurity', icon: '🔐' },
        { name: 'Tech Companies', slug: 'tech-companies', icon: '🏢' },
      ],
    },
    {
      name: 'Gaming', slug: 'gaming', icon: '🎮', color: '#ec4899',
      subs: [
        { name: 'Classic Games', slug: 'classic', icon: '👾' },
        { name: 'Modern AAA Games', slug: 'aaa', icon: '🎯' },
        { name: 'Nintendo', slug: 'nintendo', icon: '🍄' },
        { name: 'PlayStation', slug: 'playstation', icon: '🎮' },
        { name: 'Esports', slug: 'esports', icon: '🏆' },
      ],
    },
    {
      name: 'Food & Drink', slug: 'food-drink', icon: '🍕', color: '#f97316',
      subs: [
        { name: 'World Cuisines', slug: 'cuisines', icon: '🍽️' },
        { name: 'Cooking & Recipes', slug: 'cooking', icon: '👨‍🍳' },
        { name: 'Wines & Spirits', slug: 'wines', icon: '🍷' },
        { name: 'Coffee & Tea', slug: 'coffee-tea', icon: '☕' },
        { name: 'Desserts', slug: 'desserts', icon: '🍰' },
      ],
    },
    {
      name: 'Nature & Animals', slug: 'nature-animals', icon: '🦁', color: '#84cc16',
      subs: [
        { name: 'Wild Animals', slug: 'wild-animals', icon: '🦁' },
        { name: 'Marine Life', slug: 'marine-life', icon: '🐋' },
        { name: 'Birds', slug: 'birds', icon: '🦅' },
        { name: 'Dinosaurs', slug: 'dinosaurs', icon: '🦖' },
      ],
    },
  ];

  console.log(`📦 Inserting ${categoryData.length} categories...`);
  
  for (const cat of categoryData) {
    console.log(`  Processing: ${cat.name}`);
    try {
      const result = await db.insert(categories).values({
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        color: cat.color,
      }).returning();
      
      const insertedCat = result[0];

      if (insertedCat) {
        for (const sub of cat.subs) {
          await db.insert(subcategories).values({
            categoryId: insertedCat.id,
            name: sub.name,
            slug: sub.slug,
            icon: sub.icon,
          }).onConflictDoNothing();
        }
        console.log(`✅ ${cat.name}: ${cat.subs.length} subcategories`);
      }
    } catch (e) {
      console.log(`Category ${cat.name} exists`);
    }
  }

  console.log('🎉 Seeding complete!');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
