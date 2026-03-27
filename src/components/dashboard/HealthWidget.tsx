"use client";

import { motion } from "framer-motion";
import styles from "./HealthWidget.module.css";

interface HealthData {
  type: "mood" | "sleep" | "nutrition";
  date: string;
  advice: string;
}

interface Props {
  lastCheckIn: HealthData | null;
  labels: {
    title: string;
    mood: string;
    sleep: string;
    nutrition: string;
    noCheckIn: string;
  };
}

const TYPE_LABELS = {
  mood: "mood",
  sleep: "sleep",
  nutrition: "nutrition",
} as const;

export function HealthWidget({ lastCheckIn, labels }: Props) {
  const typeLabel = lastCheckIn
    ? labels[TYPE_LABELS[lastCheckIn.type]]
    : null;

  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(168, 85, 247, 0.12), 0 4px 24px rgba(0,0,0,0.15)" }}
      transition={{ duration: 0.2 }}
    >
      <h2 className={styles.title}>{labels.title}</h2>
      {!lastCheckIn ? (
        <p className={styles.empty}>{labels.noCheckIn}</p>
      ) : (
        <>
          <div className={styles.meta}>
            <span className={styles.typeBadge}>{typeLabel}</span>
            <span className={styles.date}>{lastCheckIn.date}</span>
          </div>
          <p className={styles.advice}>
            {lastCheckIn.advice.length > 120
              ? lastCheckIn.advice.slice(0, 120) + "..."
              : lastCheckIn.advice}
          </p>
        </>
      )}
    </motion.div>
  );
}
