import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import {
  pointsHistory,
  loginStreaks,
  habits,
  habitLogs,
  savingsTargets,
  todos,
  moods,
  sleepAnalyses,
  nutritionLogs,
} from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { getLevelFromPoints } from "@/lib/achievements";
import { StreakLevelCard } from "@/components/dashboard/StreakLevelCard";
import { HabitsWidget } from "@/components/dashboard/HabitsWidget";
import { SavingsWidget } from "@/components/dashboard/SavingsWidget";
import { TodosWidget } from "@/components/dashboard/TodosWidget";
import { HealthWidget } from "@/components/dashboard/HealthWidget";
import styles from "./page.module.css";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const t = await getTranslations("dashboard");
  const tPages = await getTranslations("pages.dashboard");

  const userId = session.user.id;

  // ── Streak & Level ──────────────────────────────────────────────
  const streakRow = await db
    .select()
    .from(loginStreaks)
    .where(eq(loginStreaks.userId, userId))
    .then((r) => r[0] ?? null);

  const [pointsSum] = await db
    .select({ total: sql<number>`coalesce(sum(points), 0)` })
    .from(pointsHistory)
    .where(eq(pointsHistory.userId, userId));

  const totalXp = pointsSum.total;
  const levelData = getLevelFromPoints(totalXp);

  // ── Today's Habits ──────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);

  const activeHabits = await db
    .select({ id: habits.id, title: habits.title })
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.active, true)));

  const habitIds = activeHabits.map((h) => h.id);

  const completedHabitIds = new Set<string>();
  if (habitIds.length > 0) {
    const logs = await db
      .select({ habitId: habitLogs.habitId })
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.date, today),
          eq(habitLogs.completed, true),
          sql`${habitLogs.habitId} in (${sql.join(
            habitIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        )
      );
    for (const log of logs) completedHabitIds.add(log.habitId);
  }

  const habitsData = activeHabits.map((h) => ({
    id: h.id,
    title: h.title,
    completed: completedHabitIds.has(h.id),
  }));

  // ── Active Savings ──────────────────────────────────────────────
  const savingsRow = await db
    .select()
    .from(savingsTargets)
    .where(and(eq(savingsTargets.userId, userId), eq(savingsTargets.status, "active")))
    .orderBy(desc(savingsTargets.createdAt))
    .limit(1)
    .then((r) => r[0] ?? null);

  const savingsData = savingsRow
    ? {
        purpose: savingsRow.purpose,
        currentAmount: savingsRow.currentAmount,
        targetAmount: savingsRow.targetAmount,
        dueDate: savingsRow.dueDate ?? null,
      }
    : null;

  // ── Pending Todos ───────────────────────────────────────────────
  const pendingTodos = await db
    .select({ id: todos.id, title: todos.title, dueDate: todos.dueDate })
    .from(todos)
    .where(and(eq(todos.userId, userId), eq(todos.status, "pending")))
    .orderBy(desc(todos.createdAt))
    .limit(5);

  // ── Last Health Check-in ────────────────────────────────────────
  const [lastMood, lastSleep, lastNutrition] = await Promise.all([
    db
      .select({ date: moods.date, advice: moods.advice })
      .from(moods)
      .where(eq(moods.userId, userId))
      .orderBy(desc(moods.date))
      .limit(1)
      .then((r) => (r[0] ? { type: "mood" as const, date: r[0].date, advice: r[0].advice ?? "" } : null)),
    db
      .select({ date: sleepAnalyses.date, advice: sleepAnalyses.analysis })
      .from(sleepAnalyses)
      .where(eq(sleepAnalyses.userId, userId))
      .orderBy(desc(sleepAnalyses.date))
      .limit(1)
      .then((r) => (r[0] ? { type: "sleep" as const, date: r[0].date, advice: r[0].advice ?? "" } : null)),
    db
      .select({ date: nutritionLogs.date, advice: nutritionLogs.advice })
      .from(nutritionLogs)
      .where(eq(nutritionLogs.userId, userId))
      .orderBy(desc(nutritionLogs.date))
      .limit(1)
      .then((r) => (r[0] ? { type: "nutrition" as const, date: r[0].date, advice: r[0].advice ?? "" } : null)),
  ]);

  const healthCandidates = [lastMood, lastSleep, lastNutrition].filter(Boolean) as {
    type: "mood" | "sleep" | "nutrition";
    date: string;
    advice: string;
  }[];

  const lastCheckIn =
    healthCandidates.length > 0
      ? healthCandidates.sort((a, b) => (a.date > b.date ? -1 : 1))[0]
      : null;

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>{tPages("title")}</h1>
        <p className={styles.pageSubtitle}>{tPages("subtitle")}</p>
      </div>

      <StreakLevelCard
        streakDays={streakRow?.currentStreak ?? 0}
        level={levelData.level}
        levelTitle={levelData.title}
        totalXp={totalXp}
        labels={{
          title: t("streak.title"),
          days: t("streak.days"),
          level: t("streak.level"),
          totalXp: t("streak.totalXp"),
        }}
      />

      <div className={styles.grid}>
        <HabitsWidget
          habits={habitsData}
          labels={{
            title: t("habits.title"),
            completed: t("habits.completed"),
            noHabits: t("habits.noHabits"),
          }}
        />

        <SavingsWidget
          savings={savingsData}
          labels={{
            title: t("savings.title"),
            progress: t("savings.progress"),
            due: t("savings.due"),
            noTarget: t("savings.noTarget"),
          }}
        />

        <TodosWidget
          todos={pendingTodos.map((td) => ({
            id: td.id,
            title: td.title,
            dueDate: td.dueDate ?? null,
          }))}
          labels={{
            title: t("todos.title"),
            due: t("todos.due"),
            allDone: t("todos.allDone"),
          }}
        />

        <HealthWidget
          lastCheckIn={lastCheckIn}
          labels={{
            title: t("health.title"),
            mood: t("health.mood"),
            sleep: t("health.sleep"),
            nutrition: t("health.nutrition"),
            noCheckIn: t("health.noCheckIn"),
          }}
        />
      </div>
    </div>
  );
}
