import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { moods, sleepAnalyses, nutritionLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { HealthDashboard } from "@/components/health/HealthDashboard";
import styles from "./page.module.css";

export default async function HealthPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const t = await getTranslations("pages.health");

  const today = new Date().toISOString().slice(0, 10);

  const [initialMood] = await db
    .select()
    .from(moods)
    .where(and(eq(moods.userId, session.user.id), eq(moods.date, today)))
    .limit(1);

  const [initialSleep] = await db
    .select()
    .from(sleepAnalyses)
    .where(
      and(eq(sleepAnalyses.userId, session.user.id), eq(sleepAnalyses.date, today))
    )
    .limit(1);

  const [initialNutrition] = await db
    .select()
    .from(nutritionLogs)
    .where(
      and(eq(nutritionLogs.userId, session.user.id), eq(nutritionLogs.date, today))
    )
    .limit(1);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>
      <HealthDashboard
        initialMood={initialMood ?? null}
        initialSleep={initialSleep ?? null}
        initialNutrition={initialNutrition ?? null}
      />
    </div>
  );
}
