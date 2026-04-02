import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./layout.module.css";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        ← Back
      </Link>
      <div className={styles.card}>{children}</div>
    </div>
  );
}
