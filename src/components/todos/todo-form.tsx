"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { type Todo } from "@/db/schema";
import styles from "./todo-form.module.css";

interface TodoFormProps {
  todo?: Todo;
  onSubmit: (data: { title: string; description?: string; dueDate?: string }) => Promise<void>;
  onCancel: () => void;
}

export function TodoForm({ todo, onSubmit, onCancel }: TodoFormProps) {
  const t = useTranslations("todos");
  const [title, setTitle] = useState(todo?.title ?? "");
  const [description, setDescription] = useState(todo?.description ?? "");
  
  // Normalizes initial date values for the datetime-local input parser
  const normalizeDateForInput = (dateStr?: string | null) => {
    if (!dateStr) return "";
    if (dateStr.includes("T")) return dateStr.slice(0, 16);
    return `${dateStr}T00:00`;
  };
  
  const [dueDate, setDueDate] = useState(normalizeDateForInput(todo?.dueDate));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError(t("form.titleRequired")); return; }
    setLoading(true);
    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
    });
    setLoading(false);
  };

  return (
    <div className={`${styles.form} glass`}>
      <h2 className={styles.heading}>{todo ? t("editTask") : t("addTask")}</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>{t("form.title")}</label>
          <input
            className={styles.input}
            value={title}
            onChange={e => { setTitle(e.target.value); setError(""); }}
            placeholder={t("form.titlePlaceholder")}
            autoFocus
          />
          {error && <span className={styles.error}>{error}</span>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("form.description")}</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t("form.descriptionPlaceholder")}
            rows={3}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("form.dueDate")}</label>
          <input
            type="datetime-local"
            className={styles.input}
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
        <div className={styles.buttons}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={loading}>
            {t("form.cancel")}
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "..." : t("form.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
