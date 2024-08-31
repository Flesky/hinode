import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Lucia schema

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  passwordHash: text('password_hash').notNull(),

  email: text('email').notNull().unique(),
  isEmailVerified: integer('is_email_verified', { mode: 'boolean' }).notNull().default(false),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull(),
})

export const emailVerificationCodes = sqliteTable('email_verification_codes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  expiresAt: integer('expires_at').notNull(),
})

// App schema

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})
