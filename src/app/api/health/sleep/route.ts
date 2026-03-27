import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { sleepAnalyses, pointsHistory } from "@/db/schema";
import { getGeminiModel } from "@/lib/gemini";

const sleepSchema = z.object({
  sleepStart: z.string().min(1),
  sleepEnd: z.string().min(1),
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
      .from(sleepAnalyses)
      .where(
        and(eq(sleepAnalyses.userId, session.user.id), eq(sleepAnalyses.date, today))
      );

    return NextResponse.json(record ?? null);
  } catch (error) {
    console.error("[GET /api/health/sleep]", error);
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
      .from(sleepAnalyses)
      .where(
        and(eq(sleepAnalyses.userId, session.user.id), eq(sleepAnalyses.date, today))
      );

    if (existing) {
      return NextResponse.json({ error: "Already submitted today" }, { status: 409 });
    }

    const body = await request.json();
    const parsed = sleepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { sleepStart, sleepEnd } = parsed.data;
    const hours = (
      (new Date(sleepEnd).getTime() - new Date(sleepStart).getTime()) /
      (1000 * 60 * 60)
    ).toFixed(1);

    const prompt = `You are a sleep health expert. The user slept from ${sleepStart} to ${sleepEnd} (${hours} hours). Analyze the sleep duration, provide quality assessment, and give 3 actionable tips for better sleep (~150 words).`;

    let analysis: string;
    try {
      const model = getGeminiModel("gemini-2.5-flash-lite");
      const result = await model.generateContent(prompt);
      analysis = result.response.text();
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
      .insert(sleepAnalyses)
      .values({
        userId: session.user.id,
        sleepStart,
        sleepEnd,
        analysis,
        date: today,
        pointsAwarded: 25,
      })
      .returning();

    await db.insert(pointsHistory).values({
      userId: session.user.id,
      action: "sleep_analysis",
      points: 25,
      description: `Used Sleep Analysis (${hours} hours of sleep)`,
    });

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    console.error("[POST /api/health/sleep]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
