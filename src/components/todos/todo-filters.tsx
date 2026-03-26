"use client";
import { useTranslations } from "next-intl";
import styles from "./todo-filters.module.css";

type Filter = "all" | "pending" | "done" | "cancelled";

interface TodoFiltersProps {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
}

const FILTERS: Filter[] = ["all", "pending", "done", "cancelled"];

export function TodoFilters({ filter, onFilterChange }: TodoFiltersProps) {
  const t = useTranslations("todos.filters");

  return (
    <div className={styles.filters}>
      {FILTERS.map(f => (
        <button
          key={f}
          className={`${styles.tab} ${filter === f ? styles.active : ""}`}
          onClick={() => onFilterChange(f)}
        >
          {t(f)}
        </button>
      ))}
    </div>
  );
}
