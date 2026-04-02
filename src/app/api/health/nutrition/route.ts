import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { nutritionLogs, pointsHistory } from "@/db/schema";
import { getGeminiModel } from "@/lib/gemini";

const nutritionSchema = z.object({
  dietType: z.enum(["fasting", "diet", "normal"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  locale: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().slice(0, 10);

    const [record] = await db
      .select()
      .from(nutritionLogs)
      .where(
        and(eq(nutritionLogs.userId, session.user.id), eq(nutritionLogs.date, today))
      );

    return NextResponse.json(record ?? null);
  } catch (error) {
    console.error("[GET /api/health/nutrition]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
    }

    const today = new Date().toISOString().slice(0, 10);

    const [existing] = await db
      .select()
      .from(nutritionLogs)
      .where(
        and(eq(nutritionLogs.userId, session.user.id), eq(nutritionLogs.date, today))
      );

    if (existing) {
      return NextResponse.json({ error: "Already submitted today" }, { status: 409 });
    }

    const body = await request.json();
    const parsed = nutritionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { dietType, activityLevel, locale } = parsed.data;

    let prompt = `You are a nutrition expert. The user follows a ${dietType} diet with ${activityLevel} activity level. Create a practical daily nutrition plan with meal suggestions and key nutrients to focus on (~180 words).`;
    
    if (dietType === "fasting") {
      prompt += ` Since the user is fasting, tailor the plan explicitly for a fasting window (e.g., provide specific meals designed for pre-dawn/Suhoor and sunset/Iftar, or a strict Intermittent Fasting schedule that explicitly skips mid-day meals). NEVER recommend a mid-day meal or lunch.`;
    }

    if (locale === "id") {
      prompt += ` You MUST respond entirely in the Indonesian language.`;
    }

    let advice: string;
    try {
      const model = getGeminiModel("gemini-2.5-flash-lite");
      const result = await model.generateContent(prompt);
      advice = result.response.text();
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 429) {
        return NextResponse.json(
          { error: "AI service is busy, please try again" },
          { status: 429 }
        );
      }
      throw err;
    }

    const newId = crypto.randomUUID();
    await db.insert(nutritionLogs).values({
      id: newId,
      userId: session.user.id,
      dietType,
      activityLevel,
      advice,
      date: today,
      pointsAwarded: 25,
    });
    const [inserted] = await db.select().from(nutritionLogs).where(eq(nutritionLogs.id, newId));

    await db.insert(pointsHistory).values({
      userId: session.user.id,
      action: "nutrition_advisor",
      points: 25,
      description: `Used Nutrition Advisor (${dietType} diet, ${activityLevel} activity)`,
    });

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    console.error("[POST /api/health/nutrition]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
