import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { habits, habitLogs, pointsHistory } from "@/db/schema";
import { POINTS } from "@/lib/achievements";

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [habit] = await db.select().from(habits).where(eq(habits.id, id));
    if (!habit) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (habit.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = getTodayDate();

    const [existing] = await db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.habitId, id), eq(habitLogs.date, today)));

    if (existing) {
      return NextResponse.json({ error: "Already logged today" }, { status: 409 });
    }

    const [created] = await db
      .insert(habitLogs)
      .values({
        habitId: id,
        date: today,
        completed: true,
        pointsAwarded: POINTS.COMPLETE_HABIT,
      })
      .returning();

    await db.insert(pointsHistory).values({
      userId: session.user.id,
      action: "complete_habit",
      points: POINTS.COMPLETE_HABIT,
      description: `Completed habit: ${habit.title}`,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/habits/[id]/log]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [habit] = await db.select().from(habits).where(eq(habits.id, id));
    if (!habit) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (habit.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = getTodayDate();

    const [log] = await db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.habitId, id), eq(habitLogs.date, today)));

    if (!log) {
      return NextResponse.json({ error: "No log found for today" }, { status: 404 });
    }

    await db.delete(habitLogs).where(eq(habitLogs.id, log.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/habits/[id]/log]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
