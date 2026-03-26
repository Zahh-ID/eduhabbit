import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
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

    const activeHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, session.user.id), eq(habits.active, true)));

    const todayLogs = await db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.date, today));

    const loggedHabitIds = new Set(todayLogs.map((log) => log.habitId));

    const habitsWithStatus = activeHabits.map((habit) => ({
      ...habit,
      completedToday: loggedHabitIds.has(habit.id),
    }));

    const completed = habitsWithStatus.filter((h) => h.completedToday).length;

    return NextResponse.json({
      habits: habitsWithStatus,
      summary: {
        total: habitsWithStatus.length,
        completed,
      },
    });
  } catch (error) {
    console.error("[GET /api/habits/today]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
