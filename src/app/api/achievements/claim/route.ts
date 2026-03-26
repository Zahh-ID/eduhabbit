import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql, inArray } from "drizzle-orm";
import { z } from "zod";
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
import { BADGES } from "@/lib/achievements";

const claimSchema = z.object({
  badgeId: z.string().min(1),
});

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

async function getMaxHealthConsecutiveDays(userId: string): Promise<number> {
  const moodDates = await db.select({ date: moods.date }).from(moods).where(eq(moods.userId, userId));
  const sleepDates = await db.select({ date: sleepAnalyses.date }).from(sleepAnalyses).where(eq(sleepAnalyses.userId, userId));
  const nutritionDates = await db.select({ date: nutritionLogs.date }).from(nutritionLogs).where(eq(nutritionLogs.userId, userId));

  const moodSet = new Set(moodDates.map((r) => r.date));
  const sleepSet = new Set(sleepDates.map((r) => r.date));
  const nutritionSet = new Set(nutritionDates.map((r) => r.date));

  const allDates = [...new Set([...moodSet, ...sleepSet, ...nutritionSet])].sort();
  const allThreeDates = allDates.filter(
    (d) => moodSet.has(d) && sleepSet.has(d) && nutritionSet.has(d)
  );
  return getMaxConsecutiveDays(allThreeDates);
}

async function getMaxHabitConsecutiveDays(userId: string): Promise<number> {
  const userHabits = await db
    .select({ id: habits.id })
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.active, true)));

  if (userHabits.length === 0) return 0;
  const habitIds = userHabits.map((h) => h.id);

  const logs = await db
    .select({ habitId: habitLogs.habitId, date: habitLogs.date })
    .from(habitLogs)
    .where(and(inArray(habitLogs.habitId, habitIds), eq(habitLogs.completed, true)));

  const dateMap = new Map<string, Set<string>>();
  for (const log of logs) {
    if (!dateMap.has(log.date)) dateMap.set(log.date, new Set());
    dateMap.get(log.date)!.add(log.habitId);
  }

  const completeDates = [...dateMap.entries()]
    .filter(([, completedSet]) => habitIds.every((id) => completedSet.has(id)))
    .map(([date]) => date)
    .sort();

  return getMaxConsecutiveDays(completeDates);
}

async function computeBadgeEligibility(userId: string, badgeId: string): Promise<boolean> {
  switch (badgeId) {
    case "mood_beginner":
    case "mood_master": {
      const [r] = await db.select({ count: sql<number>`count(*)` }).from(moods).where(eq(moods.userId, userId));
      return badgeId === "mood_beginner" ? r.count >= 7 : r.count >= 30;
    }
    case "sleep_apprentice":
    case "sleep_guru": {
      const [r] = await db.select({ count: sql<number>`count(*)` }).from(sleepAnalyses).where(eq(sleepAnalyses.userId, userId));
      return badgeId === "sleep_apprentice" ? r.count >= 7 : r.count >= 30;
    }
    case "nutrition_rookie":
    case "nutrition_expert": {
      const [r] = await db.select({ count: sql<number>`count(*)` }).from(nutritionLogs).where(eq(nutritionLogs.userId, userId));
      return badgeId === "nutrition_rookie" ? r.count >= 7 : r.count >= 30;
    }
    case "healthy_care_master": {
      const days = await getMaxHealthConsecutiveDays(userId);
      return days >= 14;
    }
    case "wellness_champion": {
      const days = await getMaxHealthConsecutiveDays(userId);
      return days >= 30;
    }
    case "first_saver": {
      const targets = await db.select({ id: savingsTargets.id }).from(savingsTargets).where(eq(savingsTargets.userId, userId));
      if (targets.length === 0) return false;
      const [r] = await db.select({ count: sql<number>`count(*)` }).from(savingsTransactions).where(inArray(savingsTransactions.targetId, targets.map((t) => t.id)));
      return r.count >= 1;
    }
    case "junior_accountant":
    case "senior_accountant":
    case "financial_wizard": {
      const [r] = await db.select({ count: sql<number>`count(*)` }).from(savingsTargets).where(and(eq(savingsTargets.userId, userId), eq(savingsTargets.status, "completed")));
      const threshold = badgeId === "junior_accountant" ? 1 : badgeId === "senior_accountant" ? 3 : 5;
      return r.count >= threshold;
    }
    case "big_saver": {
      const targets = await db.select({ id: savingsTargets.id }).from(savingsTargets).where(eq(savingsTargets.userId, userId));
      if (targets.length === 0) return false;
      const [r] = await db.select({ total: sql<number>`coalesce(sum(amount), 0)` }).from(savingsTransactions).where(inArray(savingsTransactions.targetId, targets.map((t) => t.id)));
      return r.total >= 1000000;
    }
    case "task_starter":
    case "task_manager":
    case "productivity_king": {
      const [r] = await db.select({ count: sql<number>`count(*)` }).from(todos).where(and(eq(todos.userId, userId), eq(todos.status, "done")));
      const threshold = badgeId === "task_starter" ? 10 : badgeId === "task_manager" ? 50 : 100;
      return r.count >= threshold;
    }
    case "zero_pending": {
      const [done] = await db.select({ count: sql<number>`count(*)` }).from(todos).where(and(eq(todos.userId, userId), eq(todos.status, "done")));
      const [pending] = await db.select({ count: sql<number>`count(*)` }).from(todos).where(and(eq(todos.userId, userId), eq(todos.status, "pending")));
      return done.count >= 5 && pending.count === 0;
    }
    case "habit_beginner":
    case "habit_builder":
    case "habit_legend": {
      const days = await getMaxHabitConsecutiveDays(userId);
      const threshold = badgeId === "habit_beginner" ? 7 : badgeId === "habit_builder" ? 30 : 100;
      return days >= threshold;
    }
    case "habit_collector": {
      const [r] = await db.select({ count: sql<number>`count(*)` }).from(habits).where(and(eq(habits.userId, userId), eq(habits.active, true)));
      return r.count >= 10;
    }
    case "week_warrior":
    case "monthly_devotee":
    case "century_club":
    case "year_of_commitment": {
      const row = await db.select({ longestStreak: loginStreaks.longestStreak }).from(loginStreaks).where(eq(loginStreaks.userId, userId)).then((r) => r[0]);
      const longest = row?.longestStreak ?? 0;
      const threshold = badgeId === "week_warrior" ? 7 : badgeId === "monthly_devotee" ? 30 : badgeId === "century_club" ? 100 : 365;
      return longest >= threshold;
    }
    case "first_steps": {
      const user = await db.select({ name: users.name, status: users.status, image: users.image }).from(users).where(eq(users.id, userId)).then((r) => r[0]);
      return !!user?.name && user.name.trim().length > 0 && !!user?.status && user.status.trim().length > 0 && !!user?.image && user.image.trim().length > 0;
    }
    case "all_rounder": {
      const [moodR] = await db.select({ count: sql<number>`count(*)` }).from(moods).where(eq(moods.userId, userId));
      const [doneR] = await db.select({ count: sql<number>`count(*)` }).from(todos).where(and(eq(todos.userId, userId), eq(todos.status, "done")));
      const targets = await db.select({ id: savingsTargets.id }).from(savingsTargets).where(eq(savingsTargets.userId, userId));
      let txCount = 0;
      if (targets.length > 0) {
        const [txR] = await db.select({ count: sql<number>`count(*)` }).from(savingsTransactions).where(inArray(savingsTransactions.targetId, targets.map((t) => t.id)));
        txCount = txR.count;
      }
      const userHabits = await db.select({ id: habits.id }).from(habits).where(eq(habits.userId, userId));
      let hlCount = 0;
      if (userHabits.length > 0) {
        const [hlR] = await db.select({ count: sql<number>`count(*)` }).from(habitLogs).where(inArray(habitLogs.habitId, userHabits.map((h) => h.id)));
        hlCount = hlR.count;
      }
      return moodR.count >= 1 && doneR.count >= 1 && txCount >= 1 && hlCount >= 1;
    }
    case "rising_star":
    case "eduhabit_veteran":
    case "eduhabit_legend":
    case "nexus_master": {
      const [r] = await db.select({ total: sql<number>`coalesce(sum(points), 0)` }).from(pointsHistory).where(eq(pointsHistory.userId, userId));
      const threshold = badgeId === "rising_star" ? 5000 : badgeId === "eduhabit_veteran" ? 30000 : badgeId === "eduhabit_legend" ? 130000 : 425000;
      return r.total >= threshold;
    }
    default:
      return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const parsed = claimSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.errors }, { status: 400 });
    }

    const { badgeId } = parsed.data;

    // Verify badge exists
    const badge = BADGES.find((b) => b.id === badgeId);
    if (!badge) {
      return NextResponse.json({ error: "Badge not found" }, { status: 400 });
    }

    // Check already claimed
    const existing = await db
      .select({ id: userBadges.id })
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));

    if (existing.length > 0) {
      return NextResponse.json({ error: "Badge already claimed" }, { status: 409 });
    }

    // Check eligibility
    const eligible = await computeBadgeEligibility(userId, badgeId);
    if (!eligible) {
      return NextResponse.json({ error: "Not eligible for this badge" }, { status: 403 });
    }

    // Insert claim
    const claimedAt = new Date();
    await db.insert(userBadges).values({
      id: crypto.randomUUID(),
      userId,
      badgeId,
      claimedAt,
    });

    return NextResponse.json({
      badge: {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        category: badge.category,
      },
      claimedAt: claimedAt.toISOString(),
    });
  } catch (error) {
    console.error("POST /api/achievements/claim error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
