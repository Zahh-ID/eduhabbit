"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import styles from "./finance-badges.module.css";

type BadgeStatus = { id: string; name: string; eligible: boolean; claimed: boolean };


interface FinanceBadgesProps {
  badges: BadgeStatus[];
}

export function FinanceBadges({ badges }: FinanceBadgesProps) {
  const t = useTranslations("finance");

  const getStatusLabel = (badge: BadgeStatus) => {
    if (badge.claimed) return t("badgeEarned");
    if (badge.eligible) return t("badgeEligible");
    return t("badgeLocked");
  };

  const getStatusClass = (badge: BadgeStatus) => {
    if (badge.claimed) return styles.earned;
    if (badge.eligible) return styles.eligible;
    return styles.locked;
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{t("badges")}</h2>
      <div className={styles.grid}>
        {badges.map(badge => (
          <div key={badge.id} className={`${styles.badge} glass`}>
            <p className={styles.badgeName}>{badge.name}</p>
            <p className={styles.badgeDesc}>{t(`badgeDesc.${badge.id}`)}</p>
            <span className={`${styles.statusChip} ${getStatusClass(badge)}`}>
              {getStatusLabel(badge)}
            </span>
            {badge.eligible && !badge.claimed && (
              <Link href="/achievements" className={styles.claimBtn}>
                {t("claim")}
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
