import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import {
  pointsHistory,
  userBadges,
  moods,
  sleepAnalyses,
  nutritionLogs,
  todos,
  savingsTargets,
  savingsTransactions,
  habits,
  habitLogs,
  loginStreaks,
  users,
} from "@/db/schema";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { BADGES, getLevelFromPoints, getProgressToNextLevel } from "@/lib/achievements";
import { LevelCard } from "@/components/achievements/LevelCard";
import { BadgeGrid } from "@/components/achievements/BadgeGrid";
import { PointsHistory } from "@/components/achievements/PointsHistory";
import styles from "./page.module.css";

// ─── Eligibility helpers ──────────────────────────────────────────

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

async function computeAllEligibility(userId: string): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {};

  const [moodCount] = await db.select({ count: sql<number>`count(*)` }).from(moods).where(eq(moods.userId, userId));
  const [sleepCount] = await db.select({ count: sql<number>`count(*)` }).from(sleepAnalyses).where(eq(sleepAnalyses.userId, userId));
  const [nutritionCount] = await db.select({ count: sql<number>`count(*)` }).from(nutritionLogs).where(eq(nutritionLogs.userId, userId));

  result["mood_beginner"] = moodCount.count >= 7;
  result["mood_master"] = moodCount.count >= 30;
  result["sleep_apprentice"] = sleepCount.count >= 7;
  result["sleep_guru"] = sleepCount.count >= 30;
  result["nutrition_rookie"] = nutritionCount.count >= 7;
  result["nutrition_expert"] = nutritionCount.count >= 30;

  // Health consecutive days
  const moodDates = await db.select({ date: moods.date }).from(moods).where(eq(moods.userId, userId));
  const sleepDates = await db.select({ date: sleepAnalyses.date }).from(sleepAnalyses).where(eq(sleepAnalyses.userId, userId));
  const nutritionDates = await db.select({ date: nutritionLogs.date }).from(nutritionLogs).where(eq(nutritionLogs.userId, userId));
  const moodSet = new Set(moodDates.map((r) => r.date));
  const sleepSet = new Set(sleepDates.map((r) => r.date));
  const nutritionSet = new Set(nutritionDates.map((r) => r.date));
  const allHealthDates = [...new Set([...moodSet, ...sleepSet, ...nutritionSet])].sort();
  const allThreeDates = allHealthDates.filter((d) => moodSet.has(d) && sleepSet.has(d) && nutritionSet.has(d));
  const maxHealthConsecutive = getMaxConsecutiveDays(allThreeDates);
  result["healthy_care_master"] = maxHealthConsecutive >= 14;
  result["wellness_champion"] = maxHealthConsecutive >= 30;

  // Finance
  const userTargets = await db.select({ id: savingsTargets.id, status: savingsTargets.status }).from(savingsTargets).where(eq(savingsTargets.userId, userId));
  const targetIds = userTargets.map((t) => t.id);
  const completedTargets = userTargets.filter((t) => t.status === "completed");
  let transactionCount = 0;
  let totalSaved = 0;
  if (targetIds.length > 0) {
    const [txCount] = await db.select({ count: sql<number>`count(*)` }).from(savingsTransactions).where(inArray(savingsTransactions.targetId, targetIds));
    transactionCount = txCount.count;
    const [txSum] = await db.select({ total: sql<number>`coalesce(sum(amount), 0)` }).from(savingsTransactions).where(inArray(savingsTransactions.targetId, targetIds));
    totalSaved = txSum.total;
  }
  result["first_saver"] = transactionCount >= 1;
  result["junior_accountant"] = completedTargets.length >= 1;
  result["senior_accountant"] = completedTargets.length >= 3;
  result["financial_wizard"] = completedTargets.length >= 5;
  result["big_saver"] = totalSaved >= 1000000;

  // Todo
  const [doneTodoCount] = await db.select({ count: sql<number>`count(*)` }).from(todos).where(and(eq(todos.userId, userId), eq(todos.status, "done")));
  const [pendingTodoCount] = await db.select({ count: sql<number>`count(*)` }).from(todos).where(and(eq(todos.userId, userId), eq(todos.status, "pending")));
  result["task_starter"] = doneTodoCount.count >= 10;
  result["task_manager"] = doneTodoCount.count >= 50;
  result["productivity_king"] = doneTodoCount.count >= 100;
  result["zero_pending"] = doneTodoCount.count >= 5 && pendingTodoCount.count === 0;

  // Habits
  const userHabits = await db.select({ id: habits.id }).from(habits).where(and(eq(habits.userId, userId), eq(habits.active, true)));
  result["habit_collector"] = userHabits.length >= 10;

  let maxHabitConsecutive = 0;
  if (userHabits.length > 0) {
    const habitIds = userHabits.map((h) => h.id);
    const logs = await db.select({ habitId: habitLogs.habitId, date: habitLogs.date }).from(habitLogs).where(and(inArray(habitLogs.habitId, habitIds), eq(habitLogs.completed, true)));
    const dateMap = new Map<string, Set<string>>();
    for (const log of logs) {
      if (!dateMap.has(log.date)) dateMap.set(log.date, new Set());
      dateMap.get(log.date)!.add(log.habitId);
    }
    const completeDates = [...dateMap.entries()].filter(([, s]) => habitIds.every((id) => s.has(id))).map(([d]) => d).sort();
    maxHabitConsecutive = getMaxConsecutiveDays(completeDates);
  }
  result["habit_beginner"] = maxHabitConsecutive >= 7;
  result["habit_builder"] = maxHabitConsecutive >= 30;
  result["habit_legend"] = maxHabitConsecutive >= 100;

  // Streak
  const streakRow = await db.select({ longestStreak: loginStreaks.longestStreak }).from(loginStreaks).where(eq(loginStreaks.userId, userId)).then((r) => r[0]);
  const longestStreak = streakRow?.longestStreak ?? 0;
  result["week_warrior"] = longestStreak >= 7;
  result["monthly_devotee"] = longestStreak >= 30;
  result["century_club"] = longestStreak >= 100;
  result["year_of_commitment"] = longestStreak >= 365;

  // General
  const user = await db.select({ name: users.name, status: users.status, image: users.image }).from(users).where(eq(users.id, userId)).then((r) => r[0]);
  result["first_steps"] = !!user?.name && user.name.trim().length > 0 && !!user?.status && user.status.trim().length > 0 && !!user?.image && user.image.trim().length > 0;

  const allUserHabits = await db.select({ id: habits.id }).from(habits).where(eq(habits.userId, userId));
  let hlCount = 0;
  if (allUserHabits.length > 0) {
    const [hlR] = await db.select({ count: sql<number>`count(*)` }).from(habitLogs).where(inArray(habitLogs.habitId, allUserHabits.map((h) => h.id)));
    hlCount = hlR.count;
  }
  result["all_rounder"] = moodCount.count >= 1 && doneTodoCount.count >= 1 && transactionCount >= 1 && hlCount >= 1;

  // Points-based general badges — use totalPoints computed above
  const [ptSum] = await db.select({ total: sql<number>`coalesce(sum(points), 0)` }).from(pointsHistory).where(eq(pointsHistory.userId, userId));
  const tp = ptSum.total;
  result["rising_star"] = tp >= 5000;
  result["eduhabit_veteran"] = tp >= 30000;
  result["eduhabit_legend"] = tp >= 130000;
  result["nexus_master"] = tp >= 425000;

  return result;
}

// ─── Page ─────────────────────────────────────────────────────────

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const t = await getTranslations("achievements");
  const tPages = await getTranslations("pages.achievements");

  const userId = session.user.id;

  // Total points & level
  const [pointsSum] = await db.select({ total: sql<number>`coalesce(sum(points), 0)` }).from(pointsHistory).where(eq(pointsHistory.userId, userId));
  const totalPoints = pointsSum.total;
  const levelData = getLevelFromPoints(totalPoints);
  const progressData = getProgressToNextLevel(totalPoints);

  // Badges
  const claimedRows = await db.select({ badgeId: userBadges.badgeId }).from(userBadges).where(eq(userBadges.userId, userId));
  const claimedSet = new Set(claimedRows.map((r) => r.badgeId));
  const eligibility = await computeAllEligibility(userId);
  const badges = BADGES.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    category: b.category,
    eligible: eligibility[b.id] ?? false,
    claimed: claimedSet.has(b.id),
  }));

  // Points history first page
  const LIMIT = 20;
  const historyRows = await db.select().from(pointsHistory).where(eq(pointsHistory.userId, userId)).orderBy(desc(pointsHistory.createdAt)).limit(LIMIT);
  const [totalHistoryRow] = await db.select({ count: sql<number>`count(*)` }).from(pointsHistory).where(eq(pointsHistory.userId, userId));
  const totalHistory = totalHistoryRow.count;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{tPages("title")}</h1>
        <p className={styles.subtitle}>{tPages("subtitle")}</p>
      </div>

      <LevelCard
        level={levelData.level}
        title={levelData.title}
        totalPoints={totalPoints}
        progress={progressData.next ? progressData : null}
      />

      <section>
        <h2 className={styles.sectionTitle}>{t("badges")}</h2>
        <BadgeGrid badges={badges} />
      </section>

      <section>
        <PointsHistory
          initialHistory={historyRows.map((r) => ({
            ...r,
            createdAt: (r.createdAt ?? new Date()).toISOString(),
          }))}
          initialTotal={totalHistory}
        />
      </section>
    </div>
  );
}
