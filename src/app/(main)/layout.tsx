import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { MainLayoutClient } from "./layout-client";

interface MainLayoutProps {
  children: ReactNode;
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <MainLayoutClient>{children}</MainLayoutClient>;
}
