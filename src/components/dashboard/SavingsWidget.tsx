import styles from "./SavingsWidget.module.css";

interface SavingsData {
  purpose: string;
  currentAmount: number;
  targetAmount: number;
  dueDate: string | null;
}

interface Props {
  savings: SavingsData | null;
  labels: {
    title: string;
    progress: string;
    due: string;
    noTarget: string;
  };
}

export function SavingsWidget({ savings, labels }: Props) {
  const percent =
    savings && savings.targetAmount > 0
      ? Math.min(100, Math.floor((savings.currentAmount / savings.targetAmount) * 100))
      : 0;

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{labels.title}</h2>
      {!savings ? (
        <p className={styles.empty}>{labels.noTarget}</p>
      ) : (
        <>
          <p className={styles.purpose}>{savings.purpose}</p>
          <div className={styles.amounts}>
            <span className={styles.current}>
              {savings.currentAmount.toLocaleString()}
            </span>
            <span className={styles.separator}>/</span>
            <span className={styles.target}>
              {savings.targetAmount.toLocaleString()} {labels.progress}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${percent}%` }} />
          </div>
          <div className={styles.percentLabel}>{percent}%</div>
          {savings.dueDate && (
            <p className={styles.dueDate}>
              {labels.due}: {savings.dueDate}
            </p>
          )}
        </>
      )}
    </div>
  );
}
