"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./habit-graph.module.css";

interface DayData {
  date: string;
  count: number;
}

function buildGrid(): { date: string; count: number }[] {
  const cells: { date: string; count: number }[] = [];
  const today = new Date();
  // Start from 364 days ago
  const start = new Date(today);
  start.setDate(start.getDate() - 363);
  // Rewind to the previous Sunday (or keep if Sunday)
  const dayOfWeek = start.getDay(); // 0=Sun
  start.setDate(start.getDate() - dayOfWeek);

  const current = new Date(start);
  while (current <= today) {
    cells.push({ date: current.toISOString().slice(0, 10), count: 0 });
    current.setDate(current.getDate() + 1);
  }
  return cells;
}

function getIntensityClass(count: number, maxCount: number): string {
  if (count === 0) return styles.c0;
  const ratio = count / Math.max(maxCount, 1);
  if (ratio <= 0.25) return styles.c1;
  if (ratio <= 0.5) return styles.c2;
  if (ratio <= 0.75) return styles.c3;
  return styles.c4;
}

function getMonthLabels(cells: { date: string }[]): { label: string; col: number }[] {
  const labels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  cells.forEach((cell, i) => {
    const d = new Date(cell.date + "T00:00:00");
    const month = d.getMonth();
    const col = Math.floor(i / 7);
    if (month !== lastMonth) {
      lastMonth = month;
      labels.push({
        label: d.toLocaleDateString(undefined, { month: "short" }),
        col,
      });
    }
  });
  return labels;
}

export function HabitGraph() {
  const t = useTranslations("habits");
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/habits/graph")
      .then(r => r.json())
      .then(json => {
        setData(json.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const grid = buildGrid();
  const countMap = new Map(data.map(d => [d.date, d.count]));
  const cells = grid.map(cell => ({ ...cell, count: countMap.get(cell.date) ?? 0 }));
  const maxCount = Math.max(...cells.map(c => c.count), 1);

  // Build 52 columns × 7 rows (Sunday first)
  const cols: { date: string; count: number }[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    cols.push(cells.slice(i, i + 7));
  }

  const monthLabels = getMonthLabels(cells);

  if (loading) {
    return (
      <div className={`${styles.wrapper} glass`}>
        <h3 className={styles.title}>{t("graph.title")}</h3>
        <div className={styles.loading}>...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.wrapper} glass`}>
      <h3 className={styles.title}>{t("graph.title")}</h3>
      <div className={styles.scrollArea}>
        <div className={styles.graphContainer}>
          {/* Month labels row */}
          <div className={styles.monthRow}>
            {monthLabels.map((ml, i) => (
              <span
                key={i}
                className={styles.monthLabel}
                style={{ gridColumn: ml.col + 1 }}
              >
                {ml.label}
              </span>
            ))}
          </div>
          {/* Grid */}
          <div className={styles.grid}>
            {cols.map((col, ci) =>
              col.map((cell, ri) => (
                <div
                  key={`${ci}-${ri}`}
                  className={`${styles.cell} ${getIntensityClass(cell.count, maxCount)}`}
                  title={cell.count > 0 ? `${cell.date}: ${cell.count}` : cell.date}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <div className={styles.legend}>
        <span className={styles.legendLabel}>{t("graph.less")}</span>
        <div className={`${styles.legendCell} ${styles.c0}`} />
        <div className={`${styles.legendCell} ${styles.c1}`} />
        <div className={`${styles.legendCell} ${styles.c2}`} />
        <div className={`${styles.legendCell} ${styles.c3}`} />
        <div className={`${styles.legendCell} ${styles.c4}`} />
        <span className={styles.legendLabel}>{t("graph.more")}</span>
      </div>
    </div>
  );
}
