"use client";

import { motion, Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import styles from "./StorySection.module.css";

const STATEMENTS_COUNT = 3;

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export function StorySection() {
  const t = useTranslations("landing.story");

  return (
    <section className={styles.storyContainer}>
      <motion.div
        className={styles.statementsWrapper}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {Array.from({ length: STATEMENTS_COUNT }, (_, i) => (
          <motion.div key={i} className={styles.statement} variants={fadeUp}>
            <span className={styles.stepNumber}>0{i + 1}</span>
            <h2>{t(`items.${i}.heading`)}</h2>
            <p>{t(`items.${i}.body`)}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
