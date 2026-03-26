"use client";

import { useLocale, useTranslations } from "next-intl";
import styles from "./locale-switcher.module.css";

export function LocaleSwitcher() {
  const t = useTranslations("locale");
  const locale = useLocale();

  const switchLocale = (next: string) => {
    document.cookie = `locale=${next}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <div className={styles.switcher} aria-label={t("switch")}>
      <button
        onClick={() => switchLocale("en")}
        className={`${styles.btn} ${locale === "en" ? styles.active : ""}`}
        aria-label={t("en")}
      >
        EN
      </button>
      <span className={styles.divider} aria-hidden="true">|</span>
      <button
        onClick={() => switchLocale("id")}
        className={`${styles.btn} ${locale === "id" ? styles.active : ""}`}
        aria-label={t("id")}
      >
        ID
      </button>
    </div>
  );
}
