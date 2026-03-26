"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { type SavingsTarget, type SavingsTransaction } from "@/db/schema";
import { SavingsProgress } from "./savings-progress";
import { SavingsForm } from "./savings-form";
import { TransactionForm } from "./transaction-form";
import { TransactionList } from "./transaction-list";
import { PastTargets } from "./past-targets";
import { FinanceBadges } from "./finance-badges";
import styles from "./savings-dashboard.module.css";

type BadgeStatus = { id: string; name: string; eligible: boolean; claimed: boolean };

interface SavingsDashboardProps {
  initialTarget: SavingsTarget | null;
  initialTransactions: SavingsTransaction[];
  initialPastTargets: SavingsTarget[];
  initialBadgeStatus: BadgeStatus[];
}

export function SavingsDashboard({
  initialTarget,
  initialTransactions,
  initialPastTargets,
  initialBadgeStatus,
}: SavingsDashboardProps) {
  const t = useTranslations("finance");
  const [target, setTarget] = useState<SavingsTarget | null>(initialTarget);
  const [transactions, setTransactions] = useState<SavingsTransaction[]>(initialTransactions);
  const [pastTargets, setPastTargets] = useState<SavingsTarget[]>(initialPastTargets);
  const [badgeStatus, setBadgeStatus] = useState<BadgeStatus[]>(initialBadgeStatus);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddMoneyForm, setShowAddMoneyForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBadgeStatus = async () => {
    const res = await fetch("/api/finance/badge-status");
    if (res.ok) {
      const data = await res.json();
      setBadgeStatus(data);
    }
  };

  useEffect(() => {
    fetchBadgeStatus();
  }, []);

  const handleCreateTarget = async (data: { purpose: string; targetAmount: number; dueDate?: string }) => {
    const res = await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const newTarget = await res.json();
      setTarget(newTarget);
      setTransactions([]);
      setShowCreateForm(false);
      showToast(t("toasts.targetCreated"));
    }
  };

  const handleAddMoney = async (amount: number) => {
    if (!target) return;
    const res = await fetch(`/api/finance/${target.id}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    if (res.ok) {
      const result = await res.json();
      setTarget(result.target);
      setTransactions(prev => [result.transaction, ...prev]);
      setShowAddMoneyForm(false);
      showToast(t("toasts.moneyAdded"));
      fetchBadgeStatus();
    }
  };

  const handleComplete = async () => {
    if (!target) return;
    if (!confirm(t("confirmComplete"))) return;
    const res = await fetch(`/api/finance/${target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPastTargets(prev => [updated, ...prev]);
      setTarget(null);
      setTransactions([]);
      showToast(t("toasts.targetCompleted"));
      fetchBadgeStatus();
    }
  };

  const handleCancel = async () => {
    if (!target) return;
    if (!confirm(t("confirmCancel"))) return;
    const res = await fetch(`/api/finance/${target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPastTargets(prev => [updated, ...prev]);
      setTarget(null);
      setTransactions([]);
      showToast(t("toasts.targetCancelled"));
    }
  };

  return (
    <div className={styles.wrapper}>
      {toast && <div className={styles.toast}>{toast}</div>}

      {target && target.status === "active" ? (
        <SavingsProgress
          target={target}
          onAddMoney={() => setShowAddMoneyForm(true)}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      ) : (
        <div className={`${styles.emptyState} glass`}>
          <p className={styles.emptyText}>{t("noActiveTarget")}</p>
          <button className={styles.emptyButton} onClick={() => setShowCreateForm(true)}>
            {t("createFirst")}
          </button>
        </div>
      )}

      {showCreateForm && (
        <div className={styles.formOverlay} onClick={() => setShowCreateForm(false)}>
          <div onClick={e => e.stopPropagation()}>
            <SavingsForm onSubmit={handleCreateTarget} onClose={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}

      {showAddMoneyForm && target && (
        <div className={styles.formOverlay} onClick={() => setShowAddMoneyForm(false)}>
          <div onClick={e => e.stopPropagation()}>
            <TransactionForm
              target={target}
              onSubmit={handleAddMoney}
              onClose={() => setShowAddMoneyForm(false)}
            />
          </div>
        </div>
      )}

      <TransactionList transactions={transactions} />
      <PastTargets targets={pastTargets} />
      <FinanceBadges badges={badgeStatus} />
    </div>
  );
}
