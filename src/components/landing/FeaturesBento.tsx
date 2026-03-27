"use client";

import { Variants, motion } from "framer-motion";
import { LuListTodo, LuHeartHandshake, LuWallet, LuCalendarDays } from "react-icons/lu";
import styles from "./FeaturesBento.module.css";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.8,
      ease: "easeOut",
    },
  }),
};

export function FeaturesBento() {
  return (
    <section className={styles.bentoSection}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className={styles.badge}>Features</span>
          <h2>Everything you need. Nothing you don't.</h2>
          <p>A unified suite of tools designed to work together seamlessly.</p>
        </motion.div>

        <div className={styles.grid}>
          {/* Main Habit Tracking Card */}
          <motion.div 
            className={`${styles.card} ${styles.largeCard}`}
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}><LuCalendarDays size={24} /></div>
              <h3>Habit Tracking</h3>
            </div>
            <p className={styles.cardBody}>
              Build consistent routines with our powerful streak system. Visualize your progress through interactive heatmaps and never break the chain.
            </p>
          </motion.div>

          {/* Todo Card */}
          <motion.div 
            className={styles.card}
            custom={1}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className={styles.cardHeader}>
              <div className={`${styles.iconWrapper} ${styles.blueIcon}`}><LuListTodo size={24} /></div>
              <h3>Smart Todos</h3>
            </div>
            <p className={styles.cardBody}>
              Organize your day. Prioritize tasks and clear your mind.
            </p>
          </motion.div>

          {/* Health Card */}
          <motion.div 
            className={styles.card}
            custom={2}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className={styles.cardHeader}>
              <div className={`${styles.iconWrapper} ${styles.greenIcon}`}><LuHeartHandshake size={24} /></div>
              <h3>Health Intelligence</h3>
            </div>
            <p className={styles.cardBody}>
              AI-driven insights analyzing your sleep, mood, and nutrition.
            </p>
          </motion.div>

          {/* Finance Card */}
          <motion.div 
            className={`${styles.card} ${styles.wideCard}`}
            custom={3}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className={styles.cardHeader}>
              <div className={`${styles.iconWrapper} ${styles.yellowIcon}`}><LuWallet size={24} /></div>
              <h3>Financial Goals</h3>
            </div>
            <p className={styles.cardBody}>
              Track your savings targets with extreme precision. Visualize your journey toward financial freedom directly alongside your personal habits.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
