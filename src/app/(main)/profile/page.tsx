import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, userBadges } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ProfileDashboard } from "@/components/profile/ProfileDashboard";
import styles from "./page.module.css";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const t = await getTranslations("pages.profile");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) redirect("/login");

  const claimedBadge = await db
    .select()
    .from(userBadges)
    .where(eq(userBadges.userId, session.user.id))
    .then((rows) => rows.find((r) => r.badgeId === "first_steps"));

  const firstStepsBadgeClaimed = Boolean(claimedBadge);
  const firstStepsBadgeEligible =
    !firstStepsBadgeClaimed &&
    Boolean(user.name?.trim()) &&
    Boolean(user.status?.trim()) &&
    Boolean(user.image);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>
      <ProfileDashboard
        initialProfile={{
          name: user.name ?? null,
          status: user.status ?? null,
          image: user.image ?? null,
          email: user.email,
          firstStepsBadgeEligible,
          firstStepsBadgeClaimed,
        }}
      />
    </div>
  );
}
