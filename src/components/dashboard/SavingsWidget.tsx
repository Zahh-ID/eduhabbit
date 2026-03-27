"use client";

import { motion } from "framer-motion";
import styles from "./SavingsWidget.module.css";

interface SavingsData {
  purpose: string;
  currentAmount: number;
  targetAmount: number;
  dueDate: string | null;
}

interface Props {
  savings: SavingsData | null;
  labels: {
    title: string;
    progress: string;
    due: string;
    noTarget: string;
  };
}

export function SavingsWidget({ savings, labels }: Props) {
  const percent =
    savings && savings.targetAmount > 0
      ? Math.min(100, Math.floor((savings.currentAmount / savings.targetAmount) * 100))
      : 0;

  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(6, 182, 212, 0.12), 0 4px 24px rgba(0,0,0,0.15)" }}
      transition={{ duration: 0.2 }}
    >
      <h2 className={styles.title}>{labels.title}</h2>
      {!savings ? (
        <p className={styles.empty}>{labels.noTarget}</p>
      ) : (
        <>
          <p className={styles.purpose}>{savings.purpose}</p>
          <div className={styles.amounts}>
            <span className={styles.current}>
              {savings.currentAmount.toLocaleString()}
            </span>
            <span className={styles.separator}>/</span>
            <span className={styles.target}>
              {savings.targetAmount.toLocaleString()} {labels.progress}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${percent}%` }} />
          </div>
          <div className={styles.percentLabel}>{percent}%</div>
          {savings.dueDate && (
            <p className={styles.dueDate}>
              {labels.due}: {savings.dueDate}
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}
