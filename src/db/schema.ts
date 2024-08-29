import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Lucia schema

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull(),
})

// App schema

export const posts = sqliteTable('posts', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})
