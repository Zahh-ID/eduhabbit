import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { habits, habitLogs } from "@/db/schema";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().slice(0, 10);

    const allHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, session.user.id));

    const habitIds = allHabits.map((h) => h.id);

    const todayLogs =
      habitIds.length > 0
        ? await db
            .select()
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
            )
        : [];

    const loggedHabitIds = new Set(todayLogs.map((log) => log.habitId));

    const habitsWithStatus = allHabits.map((habit) => ({
      ...habit,
      completedToday: loggedHabitIds.has(habit.id),
    }));

    const activeHabits = habitsWithStatus.filter((h) => h.active);
    const completed = activeHabits.filter((h) => h.completedToday).length;

    return NextResponse.json({
      habits: habitsWithStatus,
      summary: {
        total: activeHabits.length,
        completed,
      },
    });
  } catch (error) {
    console.error("[GET /api/habits/today]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
