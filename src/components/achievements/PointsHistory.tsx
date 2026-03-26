"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./PointsHistory.module.css";

export interface PointsEntry {
  id: string;
  userId: string;
  action: string;
  points: number;
  description: string | null;
  createdAt: string;
}

interface PointsHistoryProps {
  initialHistory: PointsEntry[];
  initialTotal: number;
}

export function PointsHistory({ initialHistory, initialTotal }: PointsHistoryProps) {
  const t = useTranslations("achievements");
  const [history, setHistory] = useState<PointsEntry[]>(initialHistory);
  const [total] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = history.length < total;

  const loadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/achievements/points-history?page=${nextPage}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setHistory((prev) => [...prev, ...data.history]);
        setPage(nextPage);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className={`glass ${styles.container}`}>
      <h2 className={styles.title}>{t("pointsHistory")}</h2>

      {history.length === 0 ? (
        <p className={styles.empty}>{t("noHistory")}</p>
      ) : (
        <ul className={styles.list}>
          {history.map((entry, idx) => (
            <li key={entry.id} className={`${styles.entry} ${idx % 2 === 1 ? styles.entryAlt : ""}`}>
              <div className={styles.entryLeft}>
                <span className={styles.action}>{entry.description ?? entry.action}</span>
              </div>
              <div className={styles.entryRight}>
                <span className={styles.points}>+{entry.points}</span>
                <span className={styles.date}>{formatDate(entry.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className={styles.loadMoreWrapper}>
          <button className={styles.loadMoreBtn} onClick={loadMore} disabled={loading}>
            {loading ? "..." : t("loadMore")}
          </button>
        </div>
      )}
    </div>
  );
}
