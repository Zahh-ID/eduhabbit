import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { savingsTargets } from "@/db/schema";

const patchTargetSchema = z.object({
  action: z.enum(["complete", "cancel"]),
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

    const body = await request.json();
    const parsed = patchTargetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { action } = parsed.data;

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

    const newStatus = action === "complete" ? "completed" : "cancelled";

    const [updated] = await db
      .update(savingsTargets)
      .set({ status: newStatus })
      .where(eq(savingsTargets.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/finance/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
