import { sql } from "drizzle-orm";
import {
  int,
  double,
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  mysqlEnum,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ─── NextAuth Core Tables ───────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified"),
  name: varchar("name", { length: 255 }),
  passwordHash: text("password_hash"),
  image: text("image"),
  status: varchar("status", { length: 255 }),
  locale: varchar("locale", { length: 10 }).notNull().default("en"),
  theme: varchar("theme", { length: 20 }).notNull().default("dark"),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});

export const accounts = mysqlTable(
  "accounts",
  {
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: int("expires_at"),
    tokenType: varchar("token_type", { length: 255 }),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: varchar("session_state", { length: 255 }),
  },
  (table) => ({
    providerUniqueIdx: uniqueIndex("accounts_provider_unique_idx").on(
      table.provider,
      table.providerAccountId
    ),
  })
);

export const sessions = mysqlTable("sessions", {
  sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = mysqlTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires").notNull(),
  },
  (table) => ({
    identifierTokenUniqueIdx: uniqueIndex(
      "verification_tokens_identifier_token_unique_idx"
    ).on(table.identifier, table.token),
  })
);

// ─── Health Insight Tables ───────────────────────────────────────────────────

export const moods = mysqlTable("moods", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  mood: varchar("mood", { length: 50 }).notNull(),
  stressSource: text("stress_source"),
  sleepQuality: varchar("sleep_quality", { length: 50 }),
  advice: text("advice"),
  date: varchar("date", { length: 30 }).notNull(),
  pointsAwarded: int("points_awarded").notNull().default(0),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});

export const sleepAnalyses = mysqlTable("sleep_analyses", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sleepStart: varchar("sleep_start", { length: 10 }).notNull(),
  sleepEnd: varchar("sleep_end", { length: 10 }).notNull(),
  analysis: text("analysis"),
  date: varchar("date", { length: 30 }).notNull(),
  pointsAwarded: int("points_awarded").notNull().default(0),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});

export const nutritionLogs = mysqlTable("nutrition_logs", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  dietType: varchar("diet_type", { length: 50 }).notNull(),
  activityLevel: varchar("activity_level", { length: 50 }).notNull(),
  advice: text("advice"),
  date: varchar("date", { length: 30 }).notNull(),
  pointsAwarded: int("points_awarded").notNull().default(0),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});

// ─── Todos ───────────────────────────────────────────────────────────────────

export const todos = mysqlTable("todos", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  dueDate: varchar("due_date", { length: 30 }),
  status: mysqlEnum("status", ["pending", "done", "cancelled"])
    .notNull()
    .default("pending"),
  pointsAwarded: int("points_awarded").notNull().default(0),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});

// ─── Finance / Savings ───────────────────────────────────────────────────────

export const savingsTargets = mysqlTable("savings_targets", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  purpose: varchar("purpose", { length: 500 }).notNull(),
  targetAmount: double("target_amount").notNull(),
  currentAmount: double("current_amount").notNull().default(0),
  dueDate: varchar("due_date", { length: 30 }),
  status: mysqlEnum("status", ["active", "completed", "cancelled"])
    .notNull()
    .default("active"),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});

export const savingsTransactions = mysqlTable("savings_transactions", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  targetId: varchar("target_id", { length: 36 })
    .notNull()
    .references(() => savingsTargets.id, { onDelete: "cascade" }),
  amount: double("amount").notNull(),
  date: varchar("date", { length: 30 }).notNull(),
  pointsAwarded: int("points_awarded").notNull().default(0),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});

// ─── Habits ──────────────────────────────────────────────────────────────────

export const habits = mysqlTable("habits", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  type: mysqlEnum("type", ["exercise", "work", "fun", "other"])
    .notNull()
    .default("other"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});

export const habitLogs = mysqlTable("habit_logs", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  habitId: varchar("habit_id", { length: 36 })
    .notNull()
    .references(() => habits.id, { onDelete: "cascade" }),
  date: varchar("date", { length: 30 }).notNull(),
  completed: boolean("completed").notNull().default(false),
  pointsAwarded: int("points_awarded").notNull().default(0),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});

// ─── Gamification ────────────────────────────────────────────────────────────

export const pointsHistory = mysqlTable("points_history", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 100 }).notNull(),
  points: int("points").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});

export const userBadges = mysqlTable("user_badges", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  badgeId: varchar("badge_id", { length: 100 }).notNull(),
  claimedAt: timestamp("claimed_at")
    .notNull()
    .defaultNow(),
});

export const loginStreaks = mysqlTable("login_streaks", {
  userId: varchar("user_id", { length: 36 })
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  currentStreak: int("current_streak").notNull().default(0),
  longestStreak: int("longest_streak").notNull().default(0),
  lastLoginDate: varchar("last_login_date", { length: 30 }),
  pointsAwardedToday: int("points_awarded_today").notNull().default(0),
});

// ─── TypeScript Inferred Types ────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Mood = typeof moods.$inferSelect;
export type NewMood = typeof moods.$inferInsert;

export type SleepAnalysis = typeof sleepAnalyses.$inferSelect;
export type NewSleepAnalysis = typeof sleepAnalyses.$inferInsert;

export type NutritionLog = typeof nutritionLogs.$inferSelect;
export type NewNutritionLog = typeof nutritionLogs.$inferInsert;

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;

export type SavingsTarget = typeof savingsTargets.$inferSelect;
export type NewSavingsTarget = typeof savingsTargets.$inferInsert;

export type SavingsTransaction = typeof savingsTransactions.$inferSelect;
export type NewSavingsTransaction = typeof savingsTransactions.$inferInsert;

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;

export type HabitLog = typeof habitLogs.$inferSelect;
export type NewHabitLog = typeof habitLogs.$inferInsert;

export type PointsHistory = typeof pointsHistory.$inferSelect;
export type NewPointsHistory = typeof pointsHistory.$inferInsert;

export type UserBadge = typeof userBadges.$inferSelect;
export type NewUserBadge = typeof userBadges.$inferInsert;

export type LoginStreak = typeof loginStreaks.$inferSelect;
export type NewLoginStreak = typeof loginStreaks.$inferInsert;
