import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  habits,
  habitLogs,
  todos,
  moods,
  sleepAnalyses,
  nutritionLogs,
} from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") ?? "");
    const month = parseInt(searchParams.get("month") ?? "");

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: "Invalid year or month" }, { status: 400 });
    }

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    // Fetch all active habits count for completion ratio
    const activeHabits = await db
      .select({ id: habits.id })
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.active, true)));

    const activeHabitCount = activeHabits.length;
    const activeHabitIds = activeHabits.map((h) => h.id);

    // Habit logs for the month
    let habitLogsByDate: Record<string, { completed: number; total: number }> = {};
    if (activeHabitIds.length > 0) {
      const logs = await db
        .select({
          date: habitLogs.date,
          count: sql<number>`count(*)`,
        })
        .from(habitLogs)
        .where(
          and(
            gte(habitLogs.date, startDate),
            lte(habitLogs.date, endDate),
            eq(habitLogs.completed, true),
            sql`${habitLogs.habitId} in (${sql.join(
              activeHabitIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
        )
        .groupBy(habitLogs.date);

      for (const log of logs) {
        habitLogsByDate[log.date] = {
          completed: log.count,
          total: activeHabitCount,
        };
      }
    }

    // Todos due in this month
    const todosInMonth = await db
      .select({
        id: todos.id,
        title: todos.title,
        dueDate: todos.dueDate,
        status: todos.status,
      })
      .from(todos)
      .where(
        and(
          eq(todos.userId, userId),
          gte(todos.dueDate, startDate),
          lte(todos.dueDate, endDate)
        )
      );

    const todosByDate: Record<string, { id: string; title: string; status: string }[]> = {};
    for (const todo of todosInMonth) {
      if (todo.dueDate) {
        if (!todosByDate[todo.dueDate]) todosByDate[todo.dueDate] = [];
        todosByDate[todo.dueDate].push({
          id: todo.id,
          title: todo.title,
          status: todo.status,
        });
      }
    }

    // Health check-ins for the month
    const [moodDates, sleepDates, nutritionDates] = await Promise.all([
      db
        .select({ date: moods.date })
        .from(moods)
        .where(
          and(eq(moods.userId, userId), gte(moods.date, startDate), lte(moods.date, endDate))
        ),
      db
        .select({ date: sleepAnalyses.date })
        .from(sleepAnalyses)
        .where(
          and(
            eq(sleepAnalyses.userId, userId),
            gte(sleepAnalyses.date, startDate),
            lte(sleepAnalyses.date, endDate)
          )
        ),
      db
        .select({ date: nutritionLogs.date })
        .from(nutritionLogs)
        .where(
          and(
            eq(nutritionLogs.userId, userId),
            gte(nutritionLogs.date, startDate),
            lte(nutritionLogs.date, endDate)
          )
        ),
    ]);

    const healthByDate: Record<string, { mood: boolean; sleep: boolean; nutrition: boolean }> = {};
    for (const m of moodDates) {
      if (!healthByDate[m.date]) healthByDate[m.date] = { mood: false, sleep: false, nutrition: false };
      healthByDate[m.date].mood = true;
    }
    for (const s of sleepDates) {
      if (!healthByDate[s.date]) healthByDate[s.date] = { mood: false, sleep: false, nutrition: false };
      healthByDate[s.date].sleep = true;
    }
    for (const n of nutritionDates) {
      if (!healthByDate[n.date]) healthByDate[n.date] = { mood: false, sleep: false, nutrition: false };
      healthByDate[n.date].nutrition = true;
    }

    // Build day-level data
    const days: Record<
      string,
      {
        habits: { completed: number; total: number } | null;
        todos: { id: string; title: string; status: string }[];
        health: { mood: boolean; sleep: boolean; nutrition: boolean };
      }
    > = {};

    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days[dateStr] = {
        habits: activeHabitCount > 0
          ? habitLogsByDate[dateStr] ?? { completed: 0, total: activeHabitCount }
          : null,
        todos: todosByDate[dateStr] ?? [],
        health: healthByDate[dateStr] ?? { mood: false, sleep: false, nutrition: false },
      };
    }

    return NextResponse.json({ days });
  } catch (error) {
    console.error("[GET /api/dashboard/calendar]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
