"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./savings-form.module.css";

interface SavingsFormProps {
  onSubmit: (data: { purpose: string; targetAmount: number; dueDate?: string }) => Promise<void>;
  onClose: () => void;
}

export function SavingsForm({ onSubmit, onClose }: SavingsFormProps) {
  const t = useTranslations("finance");
  const tCommon = useTranslations("common");
  const [purpose, setPurpose] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) {
      setError(t("purpose") + " is required");
      return;
    }
    const amount = parseFloat(targetAmount);
    if (!targetAmount || isNaN(amount) || amount <= 0) {
      setError(t("errors.invalidAmount"));
      return;
    }
    setLoading(true);
    await onSubmit({
      purpose: purpose.trim(),
      targetAmount: amount,
      dueDate: dueDate || undefined,
    });
    setLoading(false);
  };

  return (
    <div className={`${styles.form} glass`}>
      <h2 className={styles.heading}>{t("createTarget")}</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>{t("purpose")}</label>
          <input
            className={styles.input}
            value={purpose}
            onChange={e => { setPurpose(e.target.value); setError(""); }}
            placeholder={t("purposePlaceholder")}
            autoFocus
          />
          {error && <span className={styles.error}>{error}</span>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("targetAmount")}</label>
          <input
            type="number"
            min="1"
            className={styles.input}
            value={targetAmount}
            onChange={e => { setTargetAmount(e.target.value); setError(""); }}
            placeholder={t("amountPlaceholder")}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("dueDate")}</label>
          <input
            type="date"
            className={styles.input}
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
        <div className={styles.buttons}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            {tCommon("cancel")}
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "..." : tCommon("save")}
          </button>
        </div>
      </form>
    </div>
  );
}
