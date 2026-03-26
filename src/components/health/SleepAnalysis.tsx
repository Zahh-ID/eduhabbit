"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { SleepAnalysis as SleepAnalysisType } from "@/db/schema";
import styles from "./SleepAnalysis.module.css";

interface SleepAnalysisProps {
  initialSleep: SleepAnalysisType | null;
  onSuccess: () => void;
}

export function SleepAnalysis({ initialSleep, onSuccess }: SleepAnalysisProps) {
  const t = useTranslations("health.sleep");
  const tErr = useTranslations("health.errors");

  const [result, setResult] = useState<SleepAnalysisType | null>(initialSleep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sleepStart, setSleepStart] = useState("");
  const [sleepEnd, setSleepEnd] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/health/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sleepStart, sleepEnd }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError(tErr("busy"));
        } else if (res.status === 503) {
          setError(tErr("unavailable"));
        } else {
          setError(data.error ?? tErr("failed"));
        }
        return;
      }

      setResult(data);
      onSuccess();
    } catch {
      setError(tErr("failed"));
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className={styles.resultCard}>
        <div className={styles.alreadyDone}>{t("alreadyDone")}</div>
        <h3 className={styles.resultTitle}>{t("result")}</h3>
        <p className={styles.advice}>{result.analysis}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>{t("sleepStart")}</label>
        <input
          type="datetime-local"
          className={styles.input}
          value={sleepStart}
          onChange={(e) => setSleepStart(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t("sleepEnd")}</label>
        <input
          type="datetime-local"
          className={styles.input}
          value={sleepEnd}
          onChange={(e) => setSleepEnd(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? <span className={styles.spinner} /> : null}
        {t("submit")}
      </button>
    </form>
  );
}
