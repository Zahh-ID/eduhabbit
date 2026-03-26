import { NextRequest, NextResponse } from "next/server";
import { eq, and, gte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { habits, habitLogs } from "@/db/schema";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 364);
    const cutoffDate = cutoff.toISOString().slice(0, 10);

    // Get all habit IDs belonging to this user
    const userHabits = await db
      .select({ id: habits.id })
      .from(habits)
      .where(eq(habits.userId, session.user.id));

    const habitIds = userHabits.map((h) => h.id);

    if (habitIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Fetch completed logs within the date range for user's habits
    const logs = await db
      .select({ date: habitLogs.date })
      .from(habitLogs)
      .innerJoin(habits, eq(habitLogs.habitId, habits.id))
      .where(
        and(
          eq(habits.userId, session.user.id),
          eq(habitLogs.completed, true),
          gte(habitLogs.date, cutoffDate)
        )
      );

    // Group by date and count completions
    const countsByDate = new Map<string, number>();
    for (const log of logs) {
      countsByDate.set(log.date, (countsByDate.get(log.date) ?? 0) + 1);
    }

    const data = Array.from(countsByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/habits/graph]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
