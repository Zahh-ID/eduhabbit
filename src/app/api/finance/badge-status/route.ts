import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { savingsTargets, savingsTransactions, userBadges } from "@/db/schema";
import { getBadgeById } from "@/lib/achievements";

const FINANCE_BADGE_IDS = [
  "first_saver",
  "junior_accountant",
  "senior_accountant",
  "financial_wizard",
  "big_saver",
] as const;

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Count of transactions across all user targets
    const [transactionCountRow] = await db
      .select({ count: sql<number>`count(${savingsTransactions.id})` })
      .from(savingsTransactions)
      .innerJoin(savingsTargets, eq(savingsTransactions.targetId, savingsTargets.id))
      .where(eq(savingsTargets.userId, userId));

    const transactionCount = transactionCountRow?.count ?? 0;

    // Count of completed targets
    const [completedCountRow] = await db
      .select({ count: sql<number>`count(${savingsTargets.id})` })
      .from(savingsTargets)
      .where(
        and(
          eq(savingsTargets.userId, userId),
          eq(savingsTargets.status, "completed")
        )
      );

    const completedCount = completedCountRow?.count ?? 0;

    // Sum of all transaction amounts across user's targets
    const [totalSavedRow] = await db
      .select({ total: sql<number>`coalesce(sum(${savingsTransactions.amount}), 0)` })
      .from(savingsTransactions)
      .innerJoin(savingsTargets, eq(savingsTransactions.targetId, savingsTargets.id))
      .where(eq(savingsTargets.userId, userId));

    const totalSaved = totalSavedRow?.total ?? 0;

    // Claimed badges for this user (finance badges only)
    const claimedBadges = await db
      .select({ badgeId: userBadges.badgeId })
      .from(userBadges)
      .where(eq(userBadges.userId, userId));

    const claimedSet = new Set(claimedBadges.map((b) => b.badgeId));

    const eligibility: Record<(typeof FINANCE_BADGE_IDS)[number], boolean> = {
      first_saver: transactionCount > 0,
      junior_accountant: completedCount >= 1,
      senior_accountant: completedCount >= 3,
      financial_wizard: completedCount >= 5,
      big_saver: totalSaved >= 1_000_000,
    };

    const result = FINANCE_BADGE_IDS.map((badgeId) => ({
      id: badgeId,
      name: getBadgeById(badgeId)?.name ?? badgeId,
      eligible: eligibility[badgeId],
      claimed: claimedSet.has(badgeId),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/finance/badge-status]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
