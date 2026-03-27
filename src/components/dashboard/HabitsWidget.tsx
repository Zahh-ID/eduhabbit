"use client";

import { motion } from "framer-motion";
import styles from "./HabitsWidget.module.css";

interface HabitRow {
  id: string;
  title: string;
  completed: boolean;
}

interface Props {
  habits: HabitRow[];
  labels: {
    title: string;
    completed: string;
    noHabits: string;
  };
}

export function HabitsWidget({ habits, labels }: Props) {
  const completedCount = habits.filter((h) => h.completed).length;
  const total = habits.length;

  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(34, 197, 94, 0.12), 0 4px 24px rgba(0,0,0,0.15)" }}
      transition={{ duration: 0.2 }}
    >
      <h2 className={styles.title}>{labels.title}</h2>
      {total === 0 ? (
        <p className={styles.empty}>{labels.noHabits}</p>
      ) : (
        <>
          <p className={styles.counter}>
            {completedCount} / {total} {labels.completed}
          </p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${total > 0 ? (completedCount / total) * 100 : 0}%` }}
            />
          </div>
          <ul className={styles.list}>
            {habits.map((habit) => (
              <li key={habit.id} className={styles.item}>
                <span className={habit.completed ? styles.checkDone : styles.checkOpen}>
                  {habit.completed ? "✓" : "○"}
                </span>
                <span className={habit.completed ? styles.habitTitleDone : styles.habitTitle}>
                  {habit.title}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </motion.div>
  );
}
