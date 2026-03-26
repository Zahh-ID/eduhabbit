import { NextResponse } from "next/server";
import { eq, and, sql, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  moods,
  sleepAnalyses,
  nutritionLogs,
  todos,
  savingsTargets,
  savingsTransactions,
  habits,
  habitLogs,
  pointsHistory,
  userBadges,
  loginStreaks,
  users,
} from "@/db/schema";
import { BADGES, getLevelFromPoints, getProgressToNextLevel } from "@/lib/achievements";

// Helper: get max consecutive days where all 3 health features were used
async function getMaxHealthConsecutiveDays(userId: string): Promise<number> {
  // Get all dates where each feature was used
  const moodDates = await db
    .select({ date: moods.date })
    .from(moods)
    .where(eq(moods.userId, userId));
  const sleepDates = await db
    .select({ date: sleepAnalyses.date })
    .from(sleepAnalyses)
    .where(eq(sleepAnalyses.userId, userId));
  const nutritionDates = await db
    .select({ date: nutritionLogs.date })
    .from(nutritionLogs)
    .where(eq(nutritionLogs.userId, userId));

  const moodSet = new Set(moodDates.map((r) => r.date));
  const sleepSet = new Set(sleepDates.map((r) => r.date));
  const nutritionSet = new Set(nutritionDates.map((r) => r.date));

  // Find dates where all 3 were used
  const allDates = [...new Set([...moodSet, ...sleepSet, ...nutritionSet])].sort();
  const allThreeDates = allDates.filter(
    (d) => moodSet.has(d) && sleepSet.has(d) && nutritionSet.has(d)
  );

  return getMaxConsecutiveDays(allThreeDates);
}

function getMaxConsecutiveDays(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0;
  let max = 1;
  let current = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      if (current > max) max = current;
    } else if (diff > 1) {
      current = 1;
    }
  }
  return max;
}

// Helper: get max consecutive days where ALL active habits were completed
async function getMaxHabitConsecutiveDays(userId: string): Promise<number> {
  const userHabits = await db
    .select({ id: habits.id })
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.active, true)));

  if (userHabits.length === 0) return 0;

  const habitIds = userHabits.map((h) => h.id);

  // Get all habit logs grouped by date
  const logs = await db
    .select({ habitId: habitLogs.habitId, date: habitLogs.date, completed: habitLogs.completed })
    .from(habitLogs)
    .where(and(inArray(habitLogs.habitId, habitIds), eq(habitLogs.completed, true)));

  // Group by date: count completed
  const dateMap = new Map<string, Set<string>>();
  for (const log of logs) {
    if (!dateMap.has(log.date)) dateMap.set(log.date, new Set());
    dateMap.get(log.date)!.add(log.habitId);
  }

  // Find dates where all active habits completed
  const completeDates = [...dateMap.entries()]
    .filter(([, completedSet]) => habitIds.every((id) => completedSet.has(id)))
    .map(([date]) => date)
    .sort();

  return getMaxConsecutiveDays(completeDates);
}

// Compute eligibility for all badges
async function computeAllEligibility(userId: string): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {};

  // --- Health ---
  const [moodCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(moods)
    .where(eq(moods.userId, userId));
  const [sleepCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sleepAnalyses)
    .where(eq(sleepAnalyses.userId, userId));
  const [nutritionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(nutritionLogs)
    .where(eq(nutritionLogs.userId, userId));

  result["mood_beginner"] = moodCount.count >= 7;
  result["mood_master"] = moodCount.count >= 30;
  result["sleep_apprentice"] = sleepCount.count >= 7;
  result["sleep_guru"] = sleepCount.count >= 30;
  result["nutrition_rookie"] = nutritionCount.count >= 7;
  result["nutrition_expert"] = nutritionCount.count >= 30;

  const maxHealthConsecutive = await getMaxHealthConsecutiveDays(userId);
  result["healthy_care_master"] = maxHealthConsecutive >= 14;
  result["wellness_champion"] = maxHealthConsecutive >= 30;

  // --- Finance ---
  const userTargets = await db
    .select({ id: savingsTargets.id, status: savingsTargets.status })
    .from(savingsTargets)
    .where(eq(savingsTargets.userId, userId));

  const targetIds = userTargets.map((t) => t.id);
  const completedTargets = userTargets.filter((t) => t.status === "completed");

  let transactionCount = 0;
  let totalSaved = 0;
  if (targetIds.length > 0) {
    const [txCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(savingsTransactions)
      .where(inArray(savingsTransactions.targetId, targetIds));
    transactionCount = txCount.count;

    const [txSum] = await db
      .select({ total: sql<number>`coalesce(sum(amount), 0)` })
      .from(savingsTransactions)
      .where(inArray(savingsTransactions.targetId, targetIds));
    totalSaved = txSum.total;
  }

  result["first_saver"] = transactionCount >= 1;
  result["junior_accountant"] = completedTargets.length >= 1;
  result["senior_accountant"] = completedTargets.length >= 3;
  result["financial_wizard"] = completedTargets.length >= 5;
  result["big_saver"] = totalSaved >= 1000000;

  // --- Todo ---
  const [doneTodoCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(todos)
    .where(and(eq(todos.userId, userId), eq(todos.status, "done")));
  const [pendingTodoCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(todos)
    .where(and(eq(todos.userId, userId), eq(todos.status, "pending")));

  result["task_starter"] = doneTodoCount.count >= 10;
  result["task_manager"] = doneTodoCount.count >= 50;
  result["productivity_king"] = doneTodoCount.count >= 100;
  result["zero_pending"] = doneTodoCount.count >= 5 && pendingTodoCount.count === 0;

  // --- Habits ---
  const [habitCollectorCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.active, true)));

  result["habit_collector"] = habitCollectorCount.count >= 10;

  const maxHabitConsecutive = await getMaxHabitConsecutiveDays(userId);
  result["habit_beginner"] = maxHabitConsecutive >= 7;
  result["habit_builder"] = maxHabitConsecutive >= 30;
  result["habit_legend"] = maxHabitConsecutive >= 100;

  // --- Streak ---
  const streak = await db
    .select({ longestStreak: loginStreaks.longestStreak })
    .from(loginStreaks)
    .where(eq(loginStreaks.userId, userId))
    .then((rows) => rows[0]);

  const longestStreak = streak?.longestStreak ?? 0;
  result["week_warrior"] = longestStreak >= 7;
  result["monthly_devotee"] = longestStreak >= 30;
  result["century_club"] = longestStreak >= 100;
  result["year_of_commitment"] = longestStreak >= 365;

  // --- General ---
  const user = await db
    .select({ name: users.name, status: users.status, image: users.image })
    .from(users)
    .where(eq(users.id, userId))
    .then((rows) => rows[0]);

  result["first_steps"] =
    !!user?.name &&
    user.name.trim().length > 0 &&
    !!user?.status &&
    user.status.trim().length > 0 &&
    !!user?.image &&
    user.image.trim().length > 0;

  // all_rounder: used all 4 main features at least once
  const [hlCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(habitLogs)
    .where(
      inArray(
        habitLogs.habitId,
        (
          await db
            .select({ id: habits.id })
            .from(habits)
            .where(eq(habits.userId, userId))
        ).map((h) => h.id)
      )
    );

  result["all_rounder"] =
    moodCount.count >= 1 &&
    doneTodoCount.count >= 1 &&
    transactionCount >= 1 &&
    hlCount.count >= 1;

  // Points-based general badges
  const [pointsSum] = await db
    .select({ total: sql<number>`coalesce(sum(points), 0)` })
    .from(pointsHistory)
    .where(eq(pointsHistory.userId, userId));

  const totalPoints = pointsSum.total;
  result["rising_star"] = totalPoints >= 5000;
  result["eduhabit_veteran"] = totalPoints >= 30000;
  result["eduhabit_legend"] = totalPoints >= 130000;
  result["nexus_master"] = totalPoints >= 425000;

  return result;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get total points
    const [pointsSum] = await db
      .select({ total: sql<number>`coalesce(sum(points), 0)` })
      .from(pointsHistory)
      .where(eq(pointsHistory.userId, userId));

    const totalPoints = pointsSum.total;
    const level = getLevelFromPoints(totalPoints);
    const progress = getProgressToNextLevel(totalPoints);

    // Get claimed badges
    const claimedBadges = await db
      .select({ badgeId: userBadges.badgeId })
      .from(userBadges)
      .where(eq(userBadges.userId, userId));
    const claimedSet = new Set(claimedBadges.map((b) => b.badgeId));

    // Compute eligibility
    const eligibility = await computeAllEligibility(userId);

    // Build response
    const badges = BADGES.map((badge) => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      category: badge.category,
      eligible: eligibility[badge.id] ?? false,
      claimed: claimedSet.has(badge.id),
    }));

    return NextResponse.json({ totalPoints, level, progress, badges });
  } catch (error) {
    console.error("GET /api/achievements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
