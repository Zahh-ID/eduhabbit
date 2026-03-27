"use client";

import { useState, useEffect, useCallback } from "react";
import { LuCheck, LuX, LuCircle } from "react-icons/lu";
import styles from "./ActivityCalendar.module.css";

interface DayData {
  habits: { completed: number; total: number } | null;
  todos: { id: string; title: string; status: string }[];
  health: { mood: boolean; sleep: boolean; nutrition: boolean };
}

interface CalendarData {
  days: Record<string, DayData>;
}

interface Props {
  labels: {
    title: string;
    today: string;
    habits: string;
    todos: string;
    health: string;
    mood: string;
    sleep: string;
    nutrition: string;
    noActivity: string;
    completed: string;
    pending: string;
    done: string;
    cancelled: string;
    weekDays: string[];
    months: string[];
  };
}

function getDayStatus(day: DayData | undefined): "full" | "partial" | "missed" | "empty" {
  if (!day) return "empty";

  let totalActivities = 0;
  let completedActivities = 0;

  if (day.habits && day.habits.total > 0) {
    totalActivities++;
    if (day.habits.completed === day.habits.total) completedActivities++;
  }

  const todosCount = day.todos.length;
  if (todosCount > 0) {
    totalActivities++;
    if (day.todos.every((t) => t.status === "done")) completedActivities++;
  }

  const healthCount = [day.health.mood, day.health.sleep, day.health.nutrition].filter(Boolean).length;
  if (healthCount > 0) {
    totalActivities++;
    if (healthCount === 3) completedActivities++;
  }

  if (totalActivities === 0) return "empty";
  if (completedActivities === totalActivities) return "full";
  if (completedActivities > 0 || healthCount > 0 || (day.habits && day.habits.completed > 0))
    return "partial";
  return "missed";
}

export function ActivityCalendar({ labels }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<CalendarData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/calendar?year=${year}&month=${month}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setSelectedDate(todayStr);
  };

  const selectedDayData = selectedDate && data?.days ? data.days[selectedDate] : null;

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => (
    <div key={`blank-${i}`} className={styles.dayBlank} />
  ));

  const dayElements = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayData = data?.days?.[dateStr];
    const status = getDayStatus(dayData);
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const isFuture = dateStr > todayStr;

    const hasTodos = (dayData?.todos.length ?? 0) > 0;
    const hasHealth =
      dayData?.health.mood || dayData?.health.sleep || dayData?.health.nutrition;
    const hasHabits = dayData?.habits && dayData.habits.completed > 0;

    return (
      <button
        key={dateStr}
        className={`${styles.dayCell} ${isToday ? styles.today : ""} ${isSelected ? styles.selected : ""} ${isFuture ? styles.future : ""} ${styles[`status_${status}`]}`}
        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
        type="button"
      >
        <span className={styles.dayNumber}>{d}</span>
        {!isFuture && (hasTodos || hasHealth || hasHabits) && (
          <div className={styles.dots}>
            {hasHabits && <span className={styles.dotHabit} />}
            {hasTodos && <span className={styles.dotTodo} />}
            {hasHealth && <span className={styles.dotHealth} />}
          </div>
        )}
      </button>
    );
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.calendarCard}>
        <div className={styles.calendarHeader}>
          <h3 className={styles.calendarTitle}>{labels.title}</h3>
          <div className={styles.navRow}>
            <button className={styles.navBtn} onClick={prevMonth} type="button">
              &larr;
            </button>
            <span className={styles.monthLabel}>
              {labels.months[month - 1]} {year}
            </span>
            <button className={styles.navBtn} onClick={nextMonth} type="button">
              &rarr;
            </button>
            <button className={styles.todayBtn} onClick={goToToday} type="button">
              {labels.today}
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : (
          <>
            <div className={styles.weekRow}>
              {labels.weekDays.map((d) => (
                <div key={d} className={styles.weekDay}>
                  {d}
                </div>
              ))}
            </div>
            <div className={styles.grid}>
              {blanks}
              {dayElements}
            </div>
            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendFull}`} /> {labels.completed}
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendPartial}`} /> Partial
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendMissed}`} /> {labels.pending}
              </span>
            </div>
          </>
        )}
      </div>

      {selectedDate && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <h4 className={styles.detailDate}>
              {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h4>
            <button
              className={styles.closeBtn}
              onClick={() => setSelectedDate(null)}
              type="button"
            >
              &times;
            </button>
          </div>

          {!selectedDayData ||
          ((!selectedDayData.habits || selectedDayData.habits.total === 0) &&
            selectedDayData.todos.length === 0 &&
            !selectedDayData.health.mood &&
            !selectedDayData.health.sleep &&
            !selectedDayData.health.nutrition) ? (
            <p className={styles.noActivity}>{labels.noActivity}</p>
          ) : (
            <div className={styles.detailSections}>
              {/* Habits */}
              {selectedDayData.habits && selectedDayData.habits.total > 0 && (
                <div className={styles.detailSection}>
                  <h5 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>&#9679;</span>
                    {labels.habits}
                  </h5>
                  <div className={styles.habitBar}>
                    <div
                      className={styles.habitFill}
                      style={{
                        width: `${(selectedDayData.habits.completed / selectedDayData.habits.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className={styles.habitCount}>
                    {selectedDayData.habits.completed} / {selectedDayData.habits.total}
                  </span>
                </div>
              )}

              {/* Todos */}
              {selectedDayData.todos.length > 0 && (
                <div className={styles.detailSection}>
                  <h5 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>&#9679;</span>
                    {labels.todos}
                  </h5>
                  <ul className={styles.todoList}>
                    {selectedDayData.todos.map((todo) => (
                      <li
                        key={todo.id}
                        className={`${styles.todoItem} ${todo.status === "done" ? styles.todoDone : ""} ${todo.status === "cancelled" ? styles.todoCancelled : ""}`}
                      >
                        <span className={styles.todoCheck}>
                          {todo.status === "done"
                            ? <LuCheck size={14} />
                            : todo.status === "cancelled"
                              ? <LuX size={14} />
                              : <LuCircle size={14} />}
                        </span>
                        <span className={styles.todoTitle}>{todo.title}</span>
                        <span className={styles.todoBadge}>
                          {todo.status === "done"
                            ? labels.done
                            : todo.status === "cancelled"
                              ? labels.cancelled
                              : labels.pending}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Health */}
              {(selectedDayData.health.mood ||
                selectedDayData.health.sleep ||
                selectedDayData.health.nutrition) && (
                <div className={styles.detailSection}>
                  <h5 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>&#9679;</span>
                    {labels.health}
                  </h5>
                  <div className={styles.healthTags}>
                    {selectedDayData.health.mood && (
                      <span className={`${styles.healthTag} ${styles.tagMood}`}>
                        {labels.mood}
                      </span>
                    )}
                    {selectedDayData.health.sleep && (
                      <span className={`${styles.healthTag} ${styles.tagSleep}`}>
                        {labels.sleep}
                      </span>
                    )}
                    {selectedDayData.health.nutrition && (
                      <span className={`${styles.healthTag} ${styles.tagNutrition}`}>
                        {labels.nutrition}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
