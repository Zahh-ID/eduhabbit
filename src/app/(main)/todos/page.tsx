import { getTranslations } from "next-intl/server";
import styles from "./page.module.css";

export default async function TodosPage() {
  const t = await getTranslations("pages.todos");
  const tCommon = await getTranslations("common");

  return (
    <div className={styles.container}>
      <div className="glass">
        <div className={styles.cardContent}>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
          <span className={styles.comingSoon}>{tCommon("comingSoon")}</span>
        </div>
      </div>
    </div>
  );
}
