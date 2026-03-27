"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./CTASection.module.css";

export function CTASection({ hasSession }: { hasSession: boolean }) {
  return (
    <section className={styles.ctaContainer}>
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-150px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2>Ready to take control?</h2>
        <p>Join thousands of others who have transformed their chaotic routines into unstoppable momentum.</p>
        
        <div className={styles.btnWrapper}>
          {hasSession ? (
            <Link href="/dashboard" className={styles.primaryBtn}>
              Return to Dashboard
            </Link>
          ) : (
            <Link href="/register" className={styles.primaryBtn}>
              Start for Free
            </Link>
          )}
        </div>
      </motion.div>
      <div className={styles.footerGlow} />
    </section>
  );
}
