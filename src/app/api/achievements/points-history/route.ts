import { NextRequest, NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { pointsHistory } from "@/db/schema";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limitParam = parseInt(searchParams.get("limit") ?? "20", 10) || 20;
    const limit = Math.min(50, Math.max(1, limitParam));
    const offset = (page - 1) * limit;

    const [totalRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(pointsHistory)
      .where(eq(pointsHistory.userId, userId));

    const total = totalRow.count;

    const history = await db
      .select()
      .from(pointsHistory)
      .where(eq(pointsHistory.userId, userId))
      .orderBy(desc(pointsHistory.createdAt))
      .limit(limit)
      .offset(offset);

    const hasMore = offset + history.length < total;

    return NextResponse.json({ history, total, page, limit, hasMore });
  } catch (error) {
    console.error("GET /api/achievements/points-history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
