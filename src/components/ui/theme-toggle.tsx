"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./theme-toggle.module.css";

export function ThemeToggle() {
  const t = useTranslations("theme");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const initial = saved ?? "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return (
    <button
      onClick={toggle}
      className={styles.toggle}
      aria-label={t("toggle")}
      title={t("toggle")}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
