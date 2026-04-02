"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import styles from "./HeroSection.module.css";

export function HeroSection({ hasSession }: { hasSession: boolean }) {
  const t = useTranslations("landing.hero");

  return (
    <section className={styles.hero}>
      <div className={styles.backgroundElement}>
        <motion.div 
          className={styles.glowBlob1}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className={styles.glowBlob2}
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.div className={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className={styles.badge}
        >
          {t("badge")}
        </motion.div>

        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {t("title")} <span className={styles.highlight}>{t("titleHighlight")}</span>.
        </motion.h1>

        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {t("subtitle")}
        </motion.p>

        <motion.div 
          className={styles.ctaGroup}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {hasSession ? (
            <Link href="/dashboard" className={styles.primaryBtn}>
              {t("ctaDashboard")}
            </Link>
          ) : (
            <>
              <Link href="/register" className={styles.primaryBtn}>
                {t("ctaStart")}
              </Link>
              <Link href="/login" className={styles.secondaryBtn}>
                {t("ctaSignIn")}
              </Link>
            </>
          )}
        </motion.div>
      </motion.div>
      
      <div className={styles.overlayBottom} />
    </section>
  );
}
