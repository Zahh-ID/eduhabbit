import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { savingsTargets, savingsTransactions, pointsHistory } from "@/db/schema";
import { POINTS } from "@/lib/achievements";

const addTransactionSchema = z.object({
  amount: z.number().positive(),
  date: z.string(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [target] = await db
      .select()
      .from(savingsTargets)
      .where(eq(savingsTargets.id, id))
      .limit(1);

    if (!target) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }

    if (target.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const transactions = await db
      .select()
      .from(savingsTransactions)
      .where(eq(savingsTransactions.targetId, id))
      .orderBy(desc(savingsTransactions.createdAt));

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("[GET /api/finance/[id]/transactions]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const parsed = addTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { amount, date } = parsed.data;

    const [target] = await db
      .select()
      .from(savingsTargets)
      .where(eq(savingsTargets.id, id))
      .limit(1);

    if (!target) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }

    if (target.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (target.status !== "active") {
      return NextResponse.json({ error: "Target is not active" }, { status: 400 });
    }

    const [transaction] = await db
      .insert(savingsTransactions)
      .values({
        id: randomUUID(),
        targetId: id,
        amount,
        date,
        pointsAwarded: POINTS.ADD_SAVINGS,
      })
      .returning();

    await db.insert(pointsHistory).values({
      id: randomUUID(),
      userId: session.user.id,
      action: "add_savings",
      points: POINTS.ADD_SAVINGS,
      description: `Added ${amount} to "${target.purpose}"`,
    });

    const newCurrentAmount = target.currentAmount + amount;
    const newStatus =
      newCurrentAmount >= target.targetAmount ? "completed" : "active";

    const [updatedTarget] = await db
      .update(savingsTargets)
      .set({ currentAmount: newCurrentAmount, status: newStatus })
      .where(eq(savingsTargets.id, id))
      .returning();

    return NextResponse.json({ transaction, target: updatedTarget }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/finance/[id]/transactions]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
