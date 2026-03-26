import { NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { todos, userBadges } from "@/db/schema";

interface BadgeStatus {
  id: string;
  eligible: boolean;
  earned: boolean;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Count completed todos
    const [completedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(todos)
      .where(and(eq(todos.userId, userId), eq(todos.status, "done")));

    // Count pending todos
    const [pendingResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(todos)
      .where(and(eq(todos.userId, userId), eq(todos.status, "pending")));

    const completedCount = completedResult?.count ?? 0;
    const pendingCount = pendingResult?.count ?? 0;

    // Fetch already-claimed todo badges for this user
    const todoBadgeIds = [
      "task_starter",
      "task_manager",
      "productivity_king",
      "zero_pending",
    ];

    const claimedBadges = await db
      .select({ badgeId: userBadges.badgeId })
      .from(userBadges)
      .where(
        and(
          eq(userBadges.userId, userId),
          sql`${userBadges.badgeId} IN (${sql.join(
            todoBadgeIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        )
      );

    const claimedSet = new Set(claimedBadges.map((b) => b.badgeId));

    const badges: BadgeStatus[] = [
      {
        id: "task_starter",
        eligible: completedCount >= 10,
        earned: claimedSet.has("task_starter"),
      },
      {
        id: "task_manager",
        eligible: completedCount >= 50,
        earned: claimedSet.has("task_manager"),
      },
      {
        id: "productivity_king",
        eligible: completedCount >= 100,
        earned: claimedSet.has("productivity_king"),
      },
      {
        id: "zero_pending",
        eligible: completedCount >= 5 && pendingCount === 0,
        earned: claimedSet.has("zero_pending"),
      },
    ];

    return NextResponse.json({
      completedCount,
      pendingCount,
      badges,
    });
  } catch (error) {
    console.error("[GET /api/todos/badge-status]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
