"use client";

import { Variants, motion } from "framer-motion";
import { useTranslations } from "next-intl";
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

const FEATURES = [
  {
    icon: LuCalendarDays,
    iconClass: undefined,
    cardClass: "largeCard",
  },
  {
    icon: LuListTodo,
    iconClass: "blueIcon",
    cardClass: undefined,
  },
  {
    icon: LuHeartHandshake,
    iconClass: "greenIcon",
    cardClass: undefined,
  },
  {
    icon: LuWallet,
    iconClass: "yellowIcon",
    cardClass: "wideCard",
  },
];

export function FeaturesBento() {
  const t = useTranslations("landing.features");

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
          <span className={styles.badge}>{t("badge")}</span>
          <h2>{t("heading")}</h2>
          <p>{t("subtitle")}</p>
        </motion.div>

        <div className={styles.grid}>
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            const cardClassName = [
              styles.card,
              feature.cardClass ? styles[feature.cardClass] : "",
            ]
              .filter(Boolean)
              .join(" ");
            const iconClassName = [
              styles.iconWrapper,
              feature.iconClass ? styles[feature.iconClass] : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <motion.div
                key={i}
                className={cardClassName}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <div className={styles.cardHeader}>
                  <div className={iconClassName}>
                    <Icon size={24} />
                  </div>
                  <h3>{t(`items.${i}.title`)}</h3>
                </div>
                <p className={styles.cardBody}>{t(`items.${i}.body`)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
