"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { LuCheck } from "react-icons/lu";
import { BadgeCategory } from "@/lib/achievements";
import styles from "./BadgeGrid.module.css";

export interface BadgeStatus {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  eligible: boolean;
  claimed: boolean;
}

interface BadgeGridProps {
  badges: BadgeStatus[];
}

const CATEGORY_ORDER: BadgeCategory[] = ["health", "finance", "todo", "habit", "streak", "general"];

function BadgeCard({ badge, onClaim }: { badge: BadgeStatus; onClaim: (id: string) => void }) {
  const t = useTranslations("achievements");
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    setClaiming(true);
    await onClaim(badge.id);
    setClaiming(false);
  };

  let stateClass = styles.locked;
  if (badge.claimed) stateClass = styles.claimed;
  else if (badge.eligible) stateClass = styles.earned;

  return (
    <motion.div
      layout
      className={`${styles.badgeCard} ${stateClass}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
    >
      {badge.claimed && (
        <span className={styles.checkmark} aria-label="claimed">
          <LuCheck size={18} />
        </span>
      )}
      <p className={styles.badgeName}>{badge.name}</p>
      <p className={styles.badgeDesc}>{badge.description}</p>
      <div className={styles.badgeFooter}>
        {badge.claimed ? (
          <span className={styles.statusLabel}>{t("claimed")}</span>
        ) : badge.eligible ? (
          <button
            className={styles.claimBtn}
            onClick={handleClaim}
            disabled={claiming}
          >
            {claiming ? "..." : t("claim")}
          </button>
        ) : (
          <span className={styles.statusLabelLocked}>{t("locked")}</span>
        )}
      </div>
    </motion.div>
  );
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  const t = useTranslations("achievements");
  const [localBadges, setLocalBadges] = useState<BadgeStatus[]>(badges);

  const handleClaim = async (badgeId: string) => {
    // Optimistic update
    setLocalBadges((prev) =>
      prev.map((b) => (b.id === badgeId ? { ...b, claimed: true } : b))
    );

    try {
      const res = await fetch("/api/achievements/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeId }),
      });
      if (!res.ok) {
        // Revert on error
        setLocalBadges((prev) =>
          prev.map((b) => (b.id === badgeId ? { ...b, claimed: false } : b))
        );
      }
    } catch {
      // Revert on error
      setLocalBadges((prev) =>
        prev.map((b) => (b.id === badgeId ? { ...b, claimed: false } : b))
      );
    }
  };

  const grouped = CATEGORY_ORDER.reduce<Record<string, BadgeStatus[]>>((acc, cat) => {
    acc[cat] = localBadges.filter((b) => b.category === cat);
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {CATEGORY_ORDER.map((cat) => {
          const catBadges = grouped[cat];
          if (!catBadges || catBadges.length === 0) return null;
          return (
            <section key={cat} className={styles.category}>
              <h2 className={styles.categoryTitle}>{t(`category.${cat}`)}</h2>
              <div className={styles.grid}>
                {catBadges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} onClaim={handleClaim} />
                ))}
              </div>
            </section>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
