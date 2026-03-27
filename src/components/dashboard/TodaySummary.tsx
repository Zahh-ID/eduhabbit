"use client";

import styles from "./TodaySummary.module.css";

interface Props {
  greeting: string;
  userName: string;
  stats: {
    habitsCompleted: number;
    habitsTotal: number;
    todosPending: number;
    healthCheckins: number;
    streakDays: number;
  };
  labels: {
    habits: string;
    todosPending: string;
    healthToday: string;
    streak: string;
    dayStreak: string;
  };
}

export function TodaySummary({ greeting, userName, stats, labels }: Props) {
  const habitPercent =
    stats.habitsTotal > 0
      ? Math.round((stats.habitsCompleted / stats.habitsTotal) * 100)
      : 0;

  return (
    <div className={styles.card}>
      <div className={styles.greetingRow}>
        <h2 className={styles.greeting}>
          {greeting}, <span className={styles.name}>{userName || "User"}</span>
        </h2>
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <div className={`${styles.statIcon} ${styles.iconHabits}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {stats.habitsCompleted}/{stats.habitsTotal}
            </span>
            <span className={styles.statLabel}>{labels.habits}</span>
          </div>
          <div className={styles.miniBar}>
            <div className={styles.miniFill} style={{ width: `${habitPercent}%` }} />
          </div>
        </div>

        <div className={styles.statItem}>
          <div className={`${styles.statIcon} ${styles.iconTodos}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.todosPending}</span>
            <span className={styles.statLabel}>{labels.todosPending}</span>
          </div>
        </div>

        <div className={styles.statItem}>
          <div className={`${styles.statIcon} ${styles.iconHealth}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.healthCheckins}/3</span>
            <span className={styles.statLabel}>{labels.healthToday}</span>
          </div>
        </div>

        <div className={styles.statItem}>
          <div className={`${styles.statIcon} ${styles.iconStreak}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.streakDays}</span>
            <span className={styles.statLabel}>{labels.dayStreak}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
