import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { todos, pointsHistory } from "@/db/schema";
import { POINTS } from "@/lib/achievements";

const updateTodoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  status: z.enum(["pending", "done", "cancelled"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [todo] = await db.select().from(todos).where(eq(todos.id, id));
    if (!todo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (todo.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateTodoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const updates = parsed.data;

    // Award points exactly once when transitioning to "done"
    if (
      updates.status === "done" &&
      todo.status !== "done" &&
      todo.pointsAwarded === 0
    ) {
      await db.insert(pointsHistory).values({
        userId: session.user.id,
        action: "complete_todo",
        points: POINTS.COMPLETE_TODO,
        description: `Completed todo: ${todo.title}`,
      });
      (updates as Record<string, unknown>).pointsAwarded = POINTS.COMPLETE_TODO;
    }

    await db.update(todos).set(updates).where(eq(todos.id, id));
    const [updated] = await db.select().from(todos).where(eq(todos.id, id));

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/todos/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [todo] = await db.select().from(todos).where(eq(todos.id, id));
    if (!todo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (todo.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(todos).where(eq(todos.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/todos/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
