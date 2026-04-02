import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { savingsTargets } from "@/db/schema";

const createTargetSchema = z.object({
  purpose: z.string().min(1),
  targetAmount: z.number().positive(),
  dueDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as
      | "active"
      | "completed"
      | "cancelled"
      | null;

    const conditions = [eq(savingsTargets.userId, session.user.id)];
    if (status && ["active", "completed", "cancelled"].includes(status)) {
      conditions.push(eq(savingsTargets.status, status));
    }

    const result = await db
      .select()
      .from(savingsTargets)
      .where(and(...conditions))
      .orderBy(desc(savingsTargets.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/finance]", error);
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
    const parsed = createTargetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { purpose, targetAmount, dueDate } = parsed.data;

    const existing = await db
      .select()
      .from(savingsTargets)
      .where(
        and(
          eq(savingsTargets.userId, session.user.id),
          eq(savingsTargets.status, "active")
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "You already have an active savings target" },
        { status: 409 }
      );
    }

    const newId = crypto.randomUUID();
    await db.insert(savingsTargets).values({
      id: newId,
      userId: session.user.id,
      purpose,
      targetAmount,
      dueDate: dueDate ?? null,
    });
    const [created] = await db.select().from(savingsTargets).where(eq(savingsTargets.id, newId));

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/finance]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
