import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { moods, pointsHistory } from "@/db/schema";
import { getGeminiModel } from "@/lib/gemini";

const moodSchema = z.object({
  mood: z.enum(["great", "good", "okay", "bad", "awful"]),
  stressSource: z.string().max(500).optional(),
  sleepQuality: z.number().int().min(1).max(10),
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
      .from(moods)
      .where(and(eq(moods.userId, session.user.id), eq(moods.date, today)));

    return NextResponse.json(record ?? null);
  } catch (error) {
    console.error("[GET /api/health/mood]", error);
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
      .from(moods)
      .where(and(eq(moods.userId, session.user.id), eq(moods.date, today)));

    if (existing) {
      return NextResponse.json({ error: "Already submitted today" }, { status: 409 });
    }

    const body = await request.json();
    const parsed = moodSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { mood, stressSource, sleepQuality, locale } = parsed.data;

    let prompt = `You are a supportive wellness coach. The user feels ${mood}, stress source: '${stressSource ?? "none"}', sleep quality: ${sleepQuality}/10. Give concise, empathetic, actionable advice in 2-3 short paragraphs (~150 words).`;

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

    const [inserted] = await db
      .insert(moods)
      .values({
        userId: session.user.id,
        mood,
        stressSource: stressSource ?? null,
        sleepQuality: String(sleepQuality),
        advice,
        date: today,
        pointsAwarded: 25,
      })
      .returning();

    await db.insert(pointsHistory).values({
      userId: session.user.id,
      action: "mood_checker",
      points: 25,
      description: `Used Mood Checker (feeling ${mood})`,
    });

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    console.error("[POST /api/health/mood]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
