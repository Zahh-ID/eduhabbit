"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { HabitItem, type HabitWithStatus } from "./habit-item";
import { HabitForm } from "./habit-form";
import { HabitGraph } from "./habit-graph";
import styles from "./habit-list.module.css";

type Filter = "active" | "all";

export function HabitList() {
  const t = useTranslations("habits");
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [summary, setSummary] = useState({ total: 0, completed: 0 });
  const [filter, setFilter] = useState<Filter>("active");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchHabits = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/habits/today");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setHabits(json.habits ?? []);
      setSummary(json.summary ?? { total: 0, completed: 0 });
    } catch {
      setError(t("empty.noHabits"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHabits(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFormSuccess = (newHabit: { id: string; title: string; type: "exercise" | "work" | "fun" | "other"; active: boolean; userId: string; createdAt: Date }) => {
    setHabits(prev => [{ ...newHabit, completedToday: false }, ...prev]);
    setSummary(prev => ({ ...prev, total: prev.total + 1 }));
    setShowForm(false);
    showToast(t("toast.added"));
  };

  const handleToggle = async (id: string, completedToday: boolean) => {
    if (completedToday) {
      const res = await fetch(`/api/habits/${id}/log`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setHabits(prev => prev.map(h => h.id === id ? { ...h, completedToday: false } : h));
        setSummary(prev => ({ ...prev, completed: Math.max(0, prev.completed - 1) }));
        showToast(t("toast.unchecked"));
      }
    } else {
      const res = await fetch(`/api/habits/${id}/log`, { method: "POST" });
      if (res.ok) {
        setHabits(prev => prev.map(h => h.id === id ? { ...h, completedToday: true } : h));
        setSummary(prev => ({ ...prev, completed: prev.completed + 1 }));
        showToast(t("toast.completed"));
      }
    }
  };

  const handleDeactivate = async (id: string) => {
    const res = await fetch(`/api/habits/${id}`, { method: "PATCH" });
    if (res.ok) {
      const updated = await res.json();
      setHabits(prev => prev.map(h => h.id === id ? { ...h, active: updated.active } : h));
      if (!updated.active) {
        setSummary(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      }
      showToast(t("toast.deactivated"));
    }
  };

  const handleActivate = async (id: string) => {
    const res = await fetch(`/api/habits/${id}`, { method: "PATCH" });
    if (res.ok) {
      const updated = await res.json();
      setHabits(prev => prev.map(h => h.id === id ? { ...h, active: updated.active } : h));
      if (updated.active) {
        setSummary(prev => ({ ...prev, total: prev.total + 1 }));
      }
      showToast(t("toast.activated"));
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      const habit = habits.find(h => h.id === id);
      setHabits(prev => prev.filter(h => h.id !== id));
      if (habit?.active) {
        setSummary(prev => ({
          total: Math.max(0, prev.total - 1),
          completed: habit.completedToday ? Math.max(0, prev.completed - 1) : prev.completed,
        }));
      }
      showToast(t("toast.deleted"));
    }
  };

  const filteredHabits = filter === "active"
    ? habits.filter(h => h.active)
    : habits;

  const progressPct = summary.total > 0
    ? Math.round((summary.completed / summary.total) * 100)
    : 0;

  return (
    <div className={styles.wrapper}>
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* Progress summary */}
      <div className={`${styles.progressCard} glass`}>
        <div className={styles.progressHeader}>
          <span className={styles.progressTitle}>{t("progress.title")}</span>
          <span className={styles.progressCounter}>
            {t("progress.counter", { completed: summary.completed, total: summary.total })}
          </span>
        </div>
        <div className={styles.progressBarBg}>
          <div className={styles.progressBarFill} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.filterGroup}>
          <button
            className={`${styles.filterBtn} ${filter === "active" ? styles.filterActive : ""}`}
            onClick={() => setFilter("active")}
          >
            {t("filters.active")}
          </button>
          <button
            className={`${styles.filterBtn} ${filter === "all" ? styles.filterActive : ""}`}
            onClick={() => setFilter("all")}
          >
            {t("filters.all")}
          </button>
        </div>
        <button className={styles.addButton} onClick={() => setShowForm(true)}>
          + {t("addHabit")}
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className={styles.formOverlay} onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()}>
            <HabitForm onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* List */}
      <div className={styles.list}>
        {loading ? (
          <div className={styles.empty}>{t("empty.noHabits")}</div>
        ) : error ? (
          <div className={styles.emptyError}>{error}</div>
        ) : filteredHabits.length === 0 ? (
          <div className={styles.empty}>
            {filter === "active" ? t("empty.noActive") : t("empty.noHabits")}
          </div>
        ) : (
          filteredHabits.map(habit => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onToggle={handleToggle}
              onDeactivate={handleDeactivate}
              onActivate={handleActivate}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Contribution graph */}
      <HabitGraph />
    </div>
  );
}
