"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import styles from "./ParallaxBackground.module.css";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function ParallaxBackground({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Different speeds for parallax layers
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 15]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -10]);

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Floating decorative elements */}
      <div className={styles.decorLayer}>
        {/* Top-right gradient orb */}
        <motion.div
          className={`${styles.orb} ${styles.orbBlue}`}
          style={{ y: y1, rotate: rotate1 }}
        />
        {/* Bottom-left gradient orb */}
        <motion.div
          className={`${styles.orb} ${styles.orbPurple}`}
          style={{ y: y2, rotate: rotate2 }}
        />
        {/* Mid-right small orb */}
        <motion.div
          className={`${styles.orb} ${styles.orbCyan}`}
          style={{ y: y3 }}
        />
        {/* Floating geometric shapes */}
        <motion.div
          className={`${styles.shape} ${styles.shape1}`}
          style={{ y: y2 }}
        />
        <motion.div
          className={`${styles.shape} ${styles.shape2}`}
          style={{ y: y1 }}
        />
        <motion.div
          className={`${styles.shape} ${styles.shape3}`}
          style={{ y: y3 }}
        />
      </div>

      {/* Content */}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
