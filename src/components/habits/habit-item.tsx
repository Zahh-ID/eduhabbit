"use client";
import { useTranslations } from "next-intl";
import styles from "./habit-item.module.css";

type HabitType = "exercise" | "work" | "fun" | "other";

export interface HabitWithStatus {
  id: string;
  userId: string;
  title: string;
  type: HabitType;
  active: boolean;
  createdAt: Date;
  completedToday: boolean;
}

interface HabitItemProps {
  habit: HabitWithStatus;
  onToggle: (id: string, completedToday: boolean) => void;
  onDeactivate: (id: string) => void;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
}

const TYPE_CLASS: Record<HabitType, string> = {
  exercise: styles.typeExercise,
  work: styles.typeWork,
  fun: styles.typeFun,
  other: styles.typeOther,
};

export function HabitItem({ habit, onToggle, onDeactivate, onActivate, onDelete }: HabitItemProps) {
  const t = useTranslations("habits");

  return (
    <div className={`${styles.item} glass ${!habit.active ? styles.inactive : ""}`}>
      <div className={styles.left}>
        {habit.active ? (
          <button
            className={`${styles.checkbox} ${habit.completedToday ? styles.checked : ""}`}
            onClick={() => onToggle(habit.id, habit.completedToday)}
            aria-label={habit.completedToday ? t("toast.unchecked") : t("toast.completed")}
          >
            {habit.completedToday && <span className={styles.checkmark}>✓</span>}
          </button>
        ) : (
          <div className={styles.inactiveDot} />
        )}
      </div>

      <div className={styles.content}>
        <span className={`${styles.title} ${habit.completedToday ? styles.titleDone : ""}`}>{habit.title}</span>
        <div className={styles.badges}>
          <span className={`${styles.typeBadge} ${TYPE_CLASS[habit.type]}`}>
            {t(`types.${habit.type}`)}
          </span>
          {!habit.active && (
            <span className={styles.inactiveBadge}>{t("status.inactive")}</span>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        {habit.active ? (
          <button
            className={styles.actionBtn}
            onClick={() => onDeactivate(habit.id)}
            title={t("deactivate")}
          >
            ⏸
          </button>
        ) : (
          <button
            className={`${styles.actionBtn} ${styles.activateBtn}`}
            onClick={() => onActivate(habit.id)}
            title={t("activate")}
          >
            ▶
          </button>
        )}
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={() => onDelete(habit.id)}
          title={t("deleteHabit")}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
