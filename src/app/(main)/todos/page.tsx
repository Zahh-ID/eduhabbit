import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { TodoList } from "@/components/todos/todo-list";
import styles from "./page.module.css";

export default async function TodosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const t = await getTranslations("todos");

  const userTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, session.user.id))
    .orderBy(desc(todos.createdAt));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>
      <TodoList initialTodos={userTodos} />
    </div>
  );
}
