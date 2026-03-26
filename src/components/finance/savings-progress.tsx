"use client";
import { useTranslations } from "next-intl";
import { type SavingsTarget } from "@/db/schema";
import styles from "./savings-progress.module.css";

interface SavingsProgressProps {
  target: SavingsTarget;
  onAddMoney: () => void;
  onComplete: () => void;
  onCancel: () => void;
}

export function SavingsProgress({ target, onAddMoney, onComplete, onCancel }: SavingsProgressProps) {
  const t = useTranslations("finance");

  const percentage = Math.min((target.currentAmount / target.targetAmount) * 100, 100);
  const percentageDisplay = percentage.toFixed(1);

  const formatAmount = (amount: number) =>
    amount.toLocaleString();

  return (
    <div className={`${styles.card} glass`}>
      <p className={styles.purpose}>{target.purpose}</p>

      <div className={styles.percentageRow}>
        <span className={styles.percentage}>{percentageDisplay}%</span>
        <span className={styles.label}>{t("progress")}</span>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
      </div>

      <div className={styles.amounts}>
        <span>{t("currentAmount")}: <strong>{formatAmount(target.currentAmount)}</strong></span>
        <span>{t("targetAmount")}: <strong>{formatAmount(target.targetAmount)}</strong></span>
      </div>

      {target.dueDate && (
        <p className={styles.dueDate}>{t("dueDate")}: {target.dueDate}</p>
      )}

      <div className={styles.actions}>
        <button className={styles.addButton} onClick={onAddMoney}>
          {t("addMoney")}
        </button>
        <button className={styles.completeButton} onClick={onComplete}>
          {t("completeTarget")}
        </button>
        <button className={styles.cancelButton} onClick={onCancel}>
          {t("cancelTarget")}
        </button>
      </div>
    </div>
  );
}
