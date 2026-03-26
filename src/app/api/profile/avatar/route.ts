import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
const MAX_SIZE = 2 * 1024 * 1024

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  }
  return map[mimeType] ?? "jpg"
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    const formData = await request.formData()
    const file = formData.get("avatar")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, GIF, or WebP images are allowed." }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size must be under 2MB." }, { status: 400 })
    }

    const ext = getExtension(file.type)
    const filename = `${userId}-${Date.now()}.${ext}`
    const uploadsDir = path.join(process.cwd(), "public", "uploads")

    fs.mkdirSync(uploadsDir, { recursive: true })
    fs.writeFileSync(path.join(uploadsDir, filename), Buffer.from(await file.arrayBuffer()))

    await db.update(users).set({ image: `/uploads/${filename}` }).where(eq(users.id, userId))

    return NextResponse.json({ image: `/uploads/${filename}` })
  } catch (error) {
    console.error("[POST /api/profile/avatar]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
