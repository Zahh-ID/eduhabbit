"use client";
import { useTranslations } from "next-intl";
import { type Todo } from "@/db/schema";
import styles from "./todo-item.module.css";

interface TodoItemProps {
  todo: Todo;
  onComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onCancel: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function isDueToday(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate).toDateString() === new Date().toDateString();
}

function formatDate(dueDate: string | null): string {
  if (!dueDate) return "";
  return new Date(dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function TodoItem({ todo, onComplete, onEdit, onCancel, onRestore, onDelete }: TodoItemProps) {
  const t = useTranslations("todos");
  const overdue = todo.status === "pending" && isOverdue(todo.dueDate);
  const dueToday = todo.status === "pending" && isDueToday(todo.dueDate);

  return (
    <div className={`${styles.item} glass ${todo.status === "done" ? styles.itemDone : ""} ${overdue ? styles.overdue : ""}`}>
      <div className={styles.left}>
        {todo.status === "pending" && (
          <button className={styles.checkBtn} onClick={() => onComplete(todo.id)} title={t("form.save")} />
        )}
        {todo.status === "done" && <span className={styles.checkDone}>✓</span>}
        {todo.status === "cancelled" && <span className={styles.checkCancelled}>✕</span>}
      </div>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{todo.title}</span>
          <span className={`${styles.badge} ${styles[todo.status]}`}>{t(`status.${todo.status}`)}</span>
        </div>
        {todo.description && (
          <p className={styles.description}>{todo.description}</p>
        )}
        {todo.dueDate && (
          <span className={`${styles.dueDate} ${overdue ? styles.overdueLabel : ""} ${dueToday ? styles.dueTodayLabel : ""}`}>
            {overdue ? `⚠ ${t("overdue")} · ` : dueToday ? `⏰ ${t("dueToday")} · ` : "📅 "}
            {formatDate(todo.dueDate)}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        {todo.status === "pending" && (
          <>
            <button className={styles.actionBtn} onClick={() => onEdit(todo)} title={t("editTask")}>✏️</button>
            <button className={styles.actionBtn} onClick={() => onCancel(todo.id)} title={t("cancelTask")}>🚫</button>
          </>
        )}
        {(todo.status === "done" || todo.status === "cancelled") && (
          <button className={styles.actionBtn} onClick={() => onRestore(todo.id)} title={t("restoreTask")}>↩️</button>
        )}
        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => onDelete(todo.id)} title={t("deleteTask")}>🗑️</button>
      </div>
    </div>
  );
}
