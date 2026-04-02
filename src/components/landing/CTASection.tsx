"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import styles from "./CTASection.module.css";

export function CTASection({ hasSession }: { hasSession: boolean }) {
  const t = useTranslations("landing.cta");

  return (
    <section className={styles.ctaContainer}>
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-150px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2>{t("heading")}</h2>
        <p>{t("body")}</p>
        
        <div className={styles.btnWrapper}>
          {hasSession ? (
            <Link href="/dashboard" className={styles.primaryBtn}>
              {t("ctaDashboard")}
            </Link>
          ) : (
            <Link href="/register" className={styles.primaryBtn}>
              {t("ctaStart")}
            </Link>
          )}
        </div>
      </motion.div>
      <div className={styles.footerGlow} />
    </section>
  );
}
