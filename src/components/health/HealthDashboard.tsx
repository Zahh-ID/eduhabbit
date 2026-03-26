"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MoodChecker } from "./MoodChecker";
import { SleepAnalysis } from "./SleepAnalysis";
import { NutritionAdvisor } from "./NutritionAdvisor";
import styles from "./HealthDashboard.module.css";
import type { Mood, SleepAnalysis as SleepAnalysisType, NutritionLog } from "@/db/schema";

interface HealthDashboardProps {
  initialMood: Mood | null;
  initialSleep: SleepAnalysisType | null;
  initialNutrition: NutritionLog | null;
}

type Tab = "mood" | "sleep" | "nutrition";

export function HealthDashboard({
  initialMood,
  initialSleep,
  initialNutrition,
}: HealthDashboardProps) {
  const t = useTranslations("health");
  const [activeTab, setActiveTab] = useState<Tab>("mood");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = () => {
    setToast(t("points"));
    setTimeout(() => setToast(null), 3000);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "mood", label: t("mood.title") },
    { key: "sleep", label: t("sleep.title") },
    { key: "nutrition", label: t("nutrition.title") },
  ];

  return (
    <div className={styles.wrapper}>
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={`glass ${styles.card}`}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.panel}>
          {activeTab === "mood" && (
            <MoodChecker initialMood={initialMood} onSuccess={showToast} />
          )}
          {activeTab === "sleep" && (
            <SleepAnalysis initialSleep={initialSleep} onSuccess={showToast} />
          )}
          {activeTab === "nutrition" && (
            <NutritionAdvisor initialNutrition={initialNutrition} onSuccess={showToast} />
          )}
        </div>
      </div>
    </div>
  );
}
