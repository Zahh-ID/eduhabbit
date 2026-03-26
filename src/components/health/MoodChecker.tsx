"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Mood } from "@/db/schema";
import styles from "./MoodChecker.module.css";

interface MoodCheckerProps {
  initialMood: Mood | null;
  onSuccess: () => void;
}

export function MoodChecker({ initialMood, onSuccess }: MoodCheckerProps) {
  const t = useTranslations("health.mood");
  const tErr = useTranslations("health.errors");

  const [result, setResult] = useState<Mood | null>(initialMood);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mood, setMood] = useState("great");
  const [stressSource, setStressSource] = useState("");
  const [sleepQuality, setSleepQuality] = useState(7);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/health/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, stressSource, sleepQuality }),
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
        <p className={styles.advice}>{result.advice}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>{t("label")}</label>
        <select
          className={styles.select}
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          disabled={loading}
        >
          {(["great", "good", "okay", "bad", "awful"] as const).map((opt) => (
            <option key={opt} value={opt}>
              {t(`options.${opt}`)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t("stressSource")}</label>
        <textarea
          className={styles.textarea}
          value={stressSource}
          onChange={(e) => setStressSource(e.target.value)}
          rows={3}
          disabled={loading}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t("sleepQuality")} — <strong>{sleepQuality}</strong>
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={sleepQuality}
          onChange={(e) => setSleepQuality(Number(e.target.value))}
          className={styles.range}
          disabled={loading}
        />
        <div className={styles.rangeLabels}>
          <span>1</span>
          <span>10</span>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? <span className={styles.spinner} /> : null}
        {t("submit")}
      </button>
    </form>
  );
}
