import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { users, quizzes, questions, adminAuditLogs } from '../db/schema.js';
import { eq, like, desc, count } from 'drizzle-orm';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import bcrypt from 'bcryptjs';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    let query = db.select().from(users);
    
    if (search) {
      query = query.where(like(users.email, `%${search}%`)) as any;
    }

    const allUsers = await query.orderBy(desc(users.createdAt)).limit(limit).offset(offset);

    const userStats = await Promise.all(
      allUsers.map(async (user) => {
        const quizCount = await db
          .select({ count: count() })
          .from(quizzes)
          .where(eq(quizzes.userId, user.id));

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          totalQuizzes: quizCount[0]?.count || 0,
        };
      })
    );

    const totalUsers = await db.select({ count: count() }).from(users);

    await db.insert(adminAuditLogs).values({
      userId: req.user!.id,
      action: 'VIEW_USERS',
      details: `Viewed users list, page ${page}`,
    });

    return res.json({
      users: userStats,
      pagination: {
        page,
        limit,
        total: totalUsers[0]?.count || 0,
        totalPages: Math.ceil((totalUsers[0]?.count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/user/:userId/quizzes', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.userId, userId))
      .orderBy(desc(quizzes.startedAt))
      .limit(20);

    await db.insert(adminAuditLogs).values({
      userId: req.user!.id,
      action: 'VIEW_USER_QUIZZES',
      details: `Viewed quizzes for user ${userId}`,
    });

    return res.json({
      user: { id: user.id, email: user.email },
      quizzes: userQuizzes,
    });
  } catch (error) {
    console.error('Admin user quizzes fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch user quizzes' });
  }
});

// Get single user details (including password hash for display)
router.get('/user/:userId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.insert(adminAuditLogs).values({
      userId: req.user!.id,
      action: 'VIEW_USER_DETAILS',
      details: `Viewed details for user ${userId}`,
    });

    return res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    console.error('Admin user fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user role
router.patch('/user/:userId/role', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
    }

    // Prevent admin from changing their own role
    if (userId === req.user!.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.update(users).set({ role }).where(eq(users.id, userId));

    await db.insert(adminAuditLogs).values({
      userId: req.user!.id,
      action: 'UPDATE_USER_ROLE',
      details: `Changed role of user ${userId} from ${user.role} to ${role}`,
    });

    return res.json({ message: 'Role updated successfully', role });
  } catch (error) {
    console.error('Admin role update error:', error);
    return res.status(500).json({ error: 'Failed to update role' });
  }
});

// Update user email and/or password
router.patch('/user/:userId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { email, password } = req.body;

    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates: any = {};
    const changes: string[] = [];

    if (email && email !== user.email) {
      // Check if email is already in use
      const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      updates.email = email;
      changes.push(`email: ${user.email} -> ${email}`);
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.passwordHash = passwordHash;
      changes.push('password changed');
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No changes provided' });
    }

    await db.update(users).set(updates).where(eq(users.id, userId));

    await db.insert(adminAuditLogs).values({
      userId: req.user!.id,
      action: 'UPDATE_USER',
      details: `Updated user ${userId}: ${changes.join(', ')}`,
    });

    return res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Admin user update error:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/user/:userId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    // Prevent admin from deleting themselves
    if (userId === req.user!.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's quizzes and questions first
    const userQuizzes = await db.select().from(quizzes).where(eq(quizzes.userId, userId));
    for (const quiz of userQuizzes) {
      await db.delete(questions).where(eq(questions.quizId, quiz.id));
    }
    await db.delete(quizzes).where(eq(quizzes.userId, userId));
    
    // Delete the user
    await db.delete(users).where(eq(users.id, userId));

    await db.insert(adminAuditLogs).values({
      userId: req.user!.id,
      action: 'DELETE_USER',
      details: `Deleted user ${userId} (${user.email})`,
    });

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin user delete error:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
