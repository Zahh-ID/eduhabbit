import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { todos } from "@/db/schema";

const createTodoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
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
      | "pending"
      | "done"
      | "cancelled"
      | null;

    const conditions = [eq(todos.userId, session.user.id)];
    if (status && ["pending", "done", "cancelled"].includes(status)) {
      conditions.push(eq(todos.status, status));
    }

    const result = await db
      .select()
      .from(todos)
      .where(and(...conditions))
      .orderBy(desc(todos.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/todos]", error);
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
    const parsed = createTodoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { title, description, dueDate } = parsed.data;

    const [created] = await db
      .insert(todos)
      .values({
        userId: session.user.id,
        title,
        description: description ?? null,
        dueDate: dueDate ?? null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/todos]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
