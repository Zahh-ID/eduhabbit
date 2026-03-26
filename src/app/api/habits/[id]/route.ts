import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { habits } from "@/db/schema";

export async function PATCH(
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

    const [updated] = await db
      .update(habits)
      .set({ active: !habit.active })
      .where(eq(habits.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/habits/[id]]", error);
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

    await db.delete(habits).where(eq(habits.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/habits/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
