"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import styles from "./HeroSection.module.css";

export function HeroSection({ hasSession }: { hasSession: boolean }) {
  const t = useTranslations("landing.hero" as any); // fallback if not in i18n
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacityImage = useTransform(scrollYProgress, [0, 1], [0.8, 0]);

  return (
    <section ref={containerRef} className={styles.hero}>
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

      <motion.div 
        className={styles.content}
        style={{ y: yText, opacity: opacityText }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className={styles.badge}
        >
          Your Life. Optimized.
        </motion.div>

        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Master your <span className={styles.highlight}>Habits</span>.<br />
          Conquer your goals.
        </motion.h1>

        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          EduHabit brings clarity to your chaos. Track tasks, nurture your health,
          manage your finances, and build streak-driven routines—all in one beautiful place.
        </motion.p>

        <motion.div 
          className={styles.ctaGroup}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {hasSession ? (
            <Link href="/dashboard" className={styles.primaryBtn}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/register" className={styles.primaryBtn}>
                Start Your Journey
              </Link>
              <Link href="/login" className={styles.secondaryBtn}>
                Sign In
              </Link>
            </>
          )}
        </motion.div>
      </motion.div>
      
      <div className={styles.overlayBottom} />
    </section>
  );
}
