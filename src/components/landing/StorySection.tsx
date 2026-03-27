"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import styles from "./StorySection.module.css";

export function StorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Text 1: 0 to 0.33
  const opacity1 = useTransform(scrollYProgress, [0, 0.15, 0.25, 0.33], [0, 1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.15, 0.25, 0.33], [50, 0, 0, -50]);

  // Text 2: 0.33 to 0.66
  const opacity2 = useTransform(scrollYProgress, [0.33, 0.48, 0.58, 0.66], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.33, 0.48, 0.58, 0.66], [50, 0, 0, -50]);

  // Text 3: 0.66 to 1
  const opacity3 = useTransform(scrollYProgress, [0.66, 0.81, 0.9, 1], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.66, 0.81, 0.9, 1], [50, 0, 0, -50]);

  return (
    <section ref={containerRef} className={styles.storyContainer}>
      <div className={styles.stickyWrapper}>
        <div className={styles.content}>
          <motion.div 
            className={styles.statement} 
            style={{ opacity: opacity1, y: y1 }}
          >
            <h2>You set goals. You make plans.</h2>
            <p>But life gets in the way. Focus drifts. Streaks break.</p>
          </motion.div>

          <motion.div 
            className={styles.statement} 
            style={{ opacity: opacity2, y: y2 }}
          >
            <h2>Disorganization drains your energy.</h2>
            <p>Juggling tasks, tracking health, and managing finances in different apps leads to burnout.</p>
          </motion.div>

          <motion.div 
            className={styles.statement} 
            style={{ opacity: opacity3, y: y3 }}
          >
            <h2>It doesn&apos;t have to be this hard.</h2>
            <p>Enter a unified ecosystem designed to build unstoppable momentum.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
