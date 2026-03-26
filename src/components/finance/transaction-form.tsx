"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { type SavingsTarget } from "@/db/schema";
import styles from "./transaction-form.module.css";

interface TransactionFormProps {
  target: SavingsTarget;
  onSubmit: (amount: number) => Promise<void>;
  onClose: () => void;
}

export function TransactionForm({ target, onSubmit, onClose }: TransactionFormProps) {
  const t = useTranslations("finance");
  const tCommon = useTranslations("common");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const remaining = target.targetAmount - target.currentAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError(t("errors.invalidAmount"));
      return;
    }
    setLoading(true);
    await onSubmit(parsed);
    setLoading(false);
  };

  return (
    <div className={`${styles.form} glass`}>
      <h2 className={styles.heading}>{t("addMoneyTitle")}</h2>
      <p className={styles.targetName}>{target.purpose}</p>
      <p className={styles.remaining}>
        {t("currentAmount")}: <strong>{target.currentAmount.toLocaleString()}</strong>
        {" / "}
        {t("targetAmount")}: <strong>{target.targetAmount.toLocaleString()}</strong>
      </p>
      {remaining > 0 && (
        <p className={styles.remainingHint}>
          {t("remaining")} <strong>{remaining.toLocaleString()}</strong>
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>{t("amount")}</label>
          <input
            type="number"
            min="1"
            className={styles.input}
            value={amount}
            onChange={e => { setAmount(e.target.value); setError(""); }}
            placeholder={t("amountPlaceholder")}
            autoFocus
          />
          {error && <span className={styles.error}>{error}</span>}
        </div>
        <div className={styles.buttons}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            {tCommon("cancel")}
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "..." : t("addMoney")}
          </button>
        </div>
      </form>
    </div>
  );
}
