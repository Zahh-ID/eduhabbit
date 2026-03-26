"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import styles from "./LevelCard.module.css";

interface ProgressInfo {
  current: { level: number; title: string; cumulativePoints: number };
  next: { level: number; title: string; cumulativePoints: number } | null;
  progress: number;
  pointsToNext: number;
}

interface LevelCardProps {
  level: number;
  title: string;
  totalPoints: number;
  progress: ProgressInfo | null;
}

export function LevelCard({ level, title, totalPoints, progress }: LevelCardProps) {
  const t = useTranslations("achievements");

  const isMaxLevel = level >= 20;
  const progressPercent = progress?.progress ?? 100;

  return (
    <div className={styles.card}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.levelSection}>
          <span className={styles.levelLabel}>{t("level")}</span>
          <span className={styles.levelNumber}>{level}</span>
          <span className={styles.levelTitle}>{title}</span>
        </div>

        <div className={styles.xpSection}>
          <div className={styles.xpRow}>
            <span className={styles.xpLabel}>{t("xp")}</span>
            <span className={styles.xpValue}>{totalPoints.toLocaleString()}</span>
          </div>

          {isMaxLevel ? (
            <div className={styles.maxLevel}>{t("maxLevel")}</div>
          ) : (
            <>
              <div className={styles.progressTrack}>
                <motion.div
                  className={styles.progressBar}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </div>
              <p className={styles.pointsToNext}>
                {t("pointsToNext", { points: (progress?.pointsToNext ?? 0).toLocaleString() })}
                {progress?.next && (
                  <span className={styles.nextLevelName}> — {progress.next.title}</span>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
