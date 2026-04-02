import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users, userBadges } from "@/db/schema"
import { eq, and } from "drizzle-orm"

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.string().max(200).optional(),
  locale: z.enum(["en", "id"]).optional(),
  theme: z.enum(["light", "dark"]).optional(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    const [user] = await db.select().from(users).where(eq(users.id, userId))
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const [badge] = await db
      .select()
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, "first_steps")))

    const firstStepsBadgeEligible = !!(user.name && user.status && user.image)
    const firstStepsBadgeClaimed = !!badge

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      status: user.status,
      locale: user.locale,
      theme: user.theme,
      firstStepsBadgeEligible,
      firstStepsBadgeClaimed,
    })
  } catch (error) {
    console.error("[GET /api/profile]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    const body = await request.json()
    const result = patchSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 400 })
    }

    const { name, status, locale, theme } = result.data
    const updateData: Record<string, string> = {}
    if (name !== undefined) updateData.name = name
    if (status !== undefined) updateData.status = status
    if (locale !== undefined) updateData.locale = locale
    if (theme !== undefined) updateData.theme = theme

    await db.update(users).set(updateData).where(eq(users.id, userId));
    const [updated] = await db.select().from(users).where(eq(users.id, userId));

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      image: updated.image,
      status: updated.status,
      locale: updated.locale,
      theme: updated.theme,
    })
  } catch (error) {
    console.error("[PATCH /api/profile]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
