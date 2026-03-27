"use client";

import { useState, useEffect } from "react";
import styles from "./WeeklyChart.module.css";

interface DayData {
  habits: { completed: number; total: number } | null;
  todos: { id: string; title: string; status: string }[];
  health: { mood: boolean; sleep: boolean; nutrition: boolean };
}

interface Props {
  labels: {
    title: string;
    habits: string;
    todos: string;
    health: string;
    activities: string;
  };
}

function getWeekDates(): string[] {
  const today = new Date();
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function getShortDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

export function WeeklyChart({ labels }: Props) {
  const [data, setData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(true);
  const weekDates = getWeekDates();

  useEffect(() => {
    async function load() {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      // Might span two months, so fetch both if needed
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const firstDate = weekDates[0];
      const firstMonth = parseInt(firstDate.split("-")[1]);

      const fetches = [
        fetch(`/api/dashboard/calendar?year=${year}&month=${month}`).then((r) =>
          r.ok ? r.json() : { days: {} }
        ),
      ];

      if (firstMonth !== month) {
        fetches.push(
          fetch(`/api/dashboard/calendar?year=${prevYear}&month=${prevMonth}`).then((r) =>
            r.ok ? r.json() : { days: {} }
          )
        );
      }

      const results = await Promise.all(fetches);
      const merged: Record<string, DayData> = {};
      for (const res of results) {
        Object.assign(merged, res.days ?? {});
      }
      setData(merged);
      setLoading(false);
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate max score for scaling
  const scores = weekDates.map((date) => {
    const d = data[date];
    if (!d) return { habits: 0, todos: 0, health: 0 };
    const habitScore = d.habits ? d.habits.completed : 0;
    const todoScore = d.todos.filter((t) => t.status === "done").length;
    const healthScore = [d.health.mood, d.health.sleep, d.health.nutrition].filter(Boolean).length;
    return { habits: habitScore, todos: todoScore, health: healthScore };
  });

  const maxTotal = Math.max(1, ...scores.map((s) => s.habits + s.todos + s.health));

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{labels.title}</h2>
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      ) : (
        <>
          <div className={styles.chart}>
            {weekDates.map((date, i) => {
              const s = scores[i];
              const total = s.habits + s.todos + s.health;
              const heightPercent = (total / maxTotal) * 100;
              const habitPct = total > 0 ? (s.habits / total) * 100 : 0;
              const todoPct = total > 0 ? (s.todos / total) * 100 : 0;
              const isToday = i === 6;

              return (
                <div key={date} className={styles.barCol}>
                  <div className={styles.barWrapper}>
                    <div
                      className={`${styles.bar} ${isToday ? styles.barToday : ""}`}
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    >
                      <div
                        className={styles.segHealth}
                        style={{ height: `${100 - habitPct - todoPct}%` }}
                      />
                      <div
                        className={styles.segTodo}
                        style={{ height: `${todoPct}%` }}
                      />
                      <div
                        className={styles.segHabit}
                        style={{ height: `${habitPct}%` }}
                      />
                    </div>
                  </div>
                  <span className={`${styles.dayLabel} ${isToday ? styles.dayToday : ""}`}>
                    {getShortDay(date)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendHabit}`} />
              {labels.habits}
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendTodo}`} />
              {labels.todos}
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendHealth}`} />
              {labels.health}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
