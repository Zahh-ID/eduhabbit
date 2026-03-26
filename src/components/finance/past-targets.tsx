"use client";
import { useTranslations } from "next-intl";
import { type SavingsTarget } from "@/db/schema";
import styles from "./past-targets.module.css";

interface PastTargetsProps {
  targets: SavingsTarget[];
}

export function PastTargets({ targets }: PastTargetsProps) {
  const t = useTranslations("finance");

  if (targets.length === 0) {
    return (
      <section className={styles.section}>
        <h2 className={styles.heading}>{t("pastTargets")}</h2>
        <p className={styles.empty}>{t("noPastTargets")}</p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{t("pastTargets")}</h2>
      <ul className={styles.list}>
        {targets.map(target => (
          <li key={target.id} className={`${styles.item} glass`}>
            <div className={styles.itemHeader}>
              <span className={styles.purpose}>{target.purpose}</span>
              <span className={`${styles.statusBadge} ${styles[target.status]}`}>
                {t(`status.${target.status}`)}
              </span>
            </div>
            <div className={styles.amounts}>
              <span>{target.currentAmount.toLocaleString()} / {target.targetAmount.toLocaleString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
