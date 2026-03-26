"use client";

import { useSession } from "next-auth/react";
import styles from "./navbar.module.css";

function HamburgerIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <header className={styles.navbar}>
      <button
        className={styles.menuBtn}
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <HamburgerIcon />
      </button>

      <span className={styles.title}>EduHabit</span>

      <div className={styles.userInfo}>
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name ?? "User avatar"}
            className={styles.avatar}
            width={32}
            height={32}
          />
        ) : (
          <div className={styles.avatarFallback} aria-hidden="true">
            {session?.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
        )}
        {session?.user?.name && (
          <span className={styles.userName}>{session.user.name}</span>
        )}
      </div>
    </header>
  );
}
