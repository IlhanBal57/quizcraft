import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { categories, subcategories } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', async (req, res: Response) => {
  try {
    const allCategories = await db.select().from(categories);
    const allSubcategories = await db.select().from(subcategories);

    const result = allCategories.map(cat => ({
      ...cat,
      subcategories: allSubcategories.filter(sub => sub.categoryId === cat.id),
    }));

    return res.json(result);
  } catch (error) {
    console.error('Categories fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', async (req, res: Response) => {
  try {
    const categoryId = parseInt(req.params.id);
    const category = await db.select().from(categories).where(eq(categories.id, categoryId)).get();
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const subs = await db.select().from(subcategories).where(eq(subcategories.categoryId, categoryId));

    return res.json({ ...category, subcategories: subs });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch category' });
  }
});

export default router;
