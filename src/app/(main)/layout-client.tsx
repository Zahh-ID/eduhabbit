"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import styles from "./layout.module.css";

interface MainLayoutClientProps {
  children: ReactNode;
}

export function MainLayoutClient({ children }: MainLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.content}>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
