import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { savingsTargets, savingsTransactions } from "@/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { SavingsDashboard } from "@/components/finance/savings-dashboard";
import styles from "./page.module.css";

export default async function FinancePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const t = await getTranslations("pages.finance");

  // Fetch active target
  const [activeTarget] = await db
    .select()
    .from(savingsTargets)
    .where(and(eq(savingsTargets.userId, session.user.id), eq(savingsTargets.status, "active")))
    .limit(1);

  // Fetch transactions for active target (empty if no active target)
  const transactions = activeTarget
    ? await db
        .select()
        .from(savingsTransactions)
        .where(eq(savingsTransactions.targetId, activeTarget.id))
        .orderBy(desc(savingsTransactions.createdAt))
    : [];

  // Fetch past targets (completed + cancelled)
  const pastTargets = await db
    .select()
    .from(savingsTargets)
    .where(
      and(
        eq(savingsTargets.userId, session.user.id),
        inArray(savingsTargets.status, ["completed", "cancelled"])
      )
    )
    .orderBy(desc(savingsTargets.createdAt));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>
      <SavingsDashboard
        initialTarget={activeTarget ?? null}
        initialTransactions={transactions}
        initialPastTargets={pastTargets}
        initialBadgeStatus={[]}
      />
    </div>
  );
}
