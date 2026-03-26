import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { HabitList } from "@/components/habits/habit-list";
import styles from "./page.module.css";

export default async function HabitsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const t = await getTranslations("habits");
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>
      <HabitList />
    </div>
  );
}
