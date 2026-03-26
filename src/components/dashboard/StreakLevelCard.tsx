import styles from "./StreakLevelCard.module.css";

interface Props {
  streakDays: number;
  level: number;
  levelTitle: string;
  totalXp: number;
  labels: {
    title: string;
    days: string;
    level: string;
    totalXp: string;
  };
}

export function StreakLevelCard({ streakDays, level, levelTitle, totalXp, labels }: Props) {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{labels.title}</h2>
      <div className={styles.grid}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{streakDays}</span>
          <span className={styles.statLabel}>{labels.days}</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {labels.level} {level}
          </span>
          <span className={styles.statLabel}>{levelTitle}</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{totalXp.toLocaleString()}</span>
          <span className={styles.statLabel}>{labels.totalXp}</span>
        </div>
      </div>
    </div>
  );
}
