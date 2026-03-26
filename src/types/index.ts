import type { BadgeCategory } from "@/lib/achievements";

// ─── User Types ────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  status: string | null;
  locale: string;
  theme: string;
  createdAt: Date;
}

// ─── Badge Types ───────────────────────────────────────────────────────────

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  claimedAt: Date;
}

export interface BadgeWithStatus extends BadgeDefinition {
  earned: boolean;
  claimed: boolean;
  claimedAt?: Date;
}

// ─── Level Types ───────────────────────────────────────────────────────────

export interface LevelInfo {
  level: number;
  title: string;
  cumulativePoints: number;
  pointsRequired: number;
}

export interface UserLevelStatus {
  totalPoints: number;
  current: LevelInfo;
  next: LevelInfo | null;
  progress: number;
  pointsToNext: number;
}

// ─── Points History ────────────────────────────────────────────────────────

export type PointsAction =
  | "complete_todo"
  | "mood_checker"
  | "sleep_analysis"
  | "nutrition_advisor"
  | "add_savings"
  | "complete_habit"
  | "login_streak";

export interface PointsHistoryEntry {
  id: string;
  userId: string;
  action: PointsAction;
  points: number;
  description: string;
  createdAt: Date;
}

// ─── Health Types ──────────────────────────────────────────────────────────

export type MoodType = "great" | "good" | "okay" | "bad" | "terrible";

export interface MoodEntry {
  id: string;
  userId: string;
  mood: MoodType;
  stressSource: string | null;
  sleepQuality: number | null;
  advice: string | null;
  date: string;
  pointsAwarded: boolean;
}

export interface SleepAnalysis {
  id: string;
  userId: string;
  sleepStart: string;
  sleepEnd: string;
  analysis: string | null;
  date: string;
  pointsAwarded: boolean;
}

export interface NutritionLog {
  id: string;
  userId: string;
  dietType: string;
  activityLevel: string;
  advice: string | null;
  date: string;
  pointsAwarded: boolean;
}

// ─── Todo Types ────────────────────────────────────────────────────────────

export type TodoStatus = "pending" | "done" | "cancelled";

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: TodoStatus;
  createdAt: Date;
}

// ─── Finance Types ─────────────────────────────────────────────────────────

export type SavingsStatus = "active" | "completed" | "cancelled";

export interface SavingsTarget {
  id: string;
  userId: string;
  purpose: string;
  targetAmount: number;
  currentAmount: number;
  dueDate: string | null;
  status: SavingsStatus;
  createdAt: Date;
}

export interface SavingsTransaction {
  id: string;
  targetId: string;
  amount: number;
  date: string;
  pointsAwarded: boolean;
}

// ─── Habit Types ───────────────────────────────────────────────────────────

export type HabitType = "exercise" | "work" | "fun" | "other";

export interface Habit {
  id: string;
  userId: string;
  title: string;
  type: HabitType;
  active: boolean;
  createdAt: Date;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  pointsAwarded: boolean;
}

// ─── Login Streak Types ────────────────────────────────────────────────────

export interface LoginStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
  pointsAwardedToday: boolean;
}
