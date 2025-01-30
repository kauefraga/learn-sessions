import { boolean, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  displayName: varchar('display_name', { length: 255 }),
  name: varchar('name', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  keepSignedIn: boolean('keep_signed_in').notNull().default(false),
  startedAt: timestamp('started_at').notNull().defaultNow(),
});

export const passwordRecovery = pgTable('password_recovery', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  otp: varchar('otp', { length: 6 }).notNull(),
  registeredAt: timestamp('registered_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
});
