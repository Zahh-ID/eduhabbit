"use client";
import { useTranslations } from "next-intl";
import { type SavingsTransaction } from "@/db/schema";
import styles from "./transaction-list.module.css";

interface TransactionListProps {
  transactions: SavingsTransaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const t = useTranslations("finance");

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{t("transactionHistory")}</h2>
      {transactions.length === 0 ? (
        <p className={styles.empty}>{t("noTransactions")}</p>
      ) : (
        <ul className={styles.list}>
          {transactions.map(tx => (
            <li key={tx.id} className={`${styles.item} glass`}>
              <span className={styles.amount}>+{tx.amount.toLocaleString()}</span>
              <span className={styles.date}>{tx.date}</span>
              {tx.pointsAwarded > 0 && (
                <span className={styles.pointsBadge}>+{tx.pointsAwarded} pts</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
