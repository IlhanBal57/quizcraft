import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  lastLogin: text('last_login'),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon'),
  color: text('color'),
});

export const subcategories = sqliteTable('subcategories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  icon: text('icon'),
});

export const quizzes = sqliteTable('quizzes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').notNull().unique(),
  userId: integer('user_id').notNull().references(() => users.id),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  subcategoryId: integer('subcategory_id').notNull().references(() => subcategories.id),
  difficulty: text('difficulty', { enum: ['easy', 'medium', 'hard'] }).notNull(),
  questionCount: integer('question_count').notNull(),
  scoreCorrect: integer('score_correct'),
  scorePercentage: real('score_percentage'),
  durationSeconds: integer('duration_seconds'),
  status: text('status', { enum: ['in_progress', 'completed', 'abandoned'] }).notNull().default('in_progress'),
  startedAt: text('started_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  completedAt: text('completed_at'),
  computedRankAtSubmit: integer('computed_rank_at_submit'),
});

export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  quizId: integer('quiz_id').notNull().references(() => quizzes.id),
  questionIndex: integer('question_index').notNull(),
  prompt: text('prompt').notNull(),
  optionA: text('option_a').notNull(),
  optionB: text('option_b').notNull(),
  optionC: text('option_c').notNull(),
  optionD: text('option_d').notNull(),
  correctKey: text('correct_key', { enum: ['A', 'B', 'C', 'D'] }).notNull(),
  explanation: text('explanation'),
  imageUrl: text('image_url'),
  userAnswer: text('user_answer', { enum: ['A', 'B', 'C', 'D'] }),
  isCorrect: integer('is_correct'),
});

export const adminAuditLogs = sqliteTable('admin_audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  details: text('details'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Subcategory = typeof subcategories.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
