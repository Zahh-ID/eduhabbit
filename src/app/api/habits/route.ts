import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { habits } from "@/db/schema";

const createHabitSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(["exercise", "work", "fun", "other"]),
});

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, session.user.id), eq(habits.active, true)))
      .orderBy(desc(habits.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/habits]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createHabitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { title, type } = parsed.data;

    const [created] = await db
      .insert(habits)
      .values({
        userId: session.user.id,
        title,
        type,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/habits]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
