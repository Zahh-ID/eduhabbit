"use client";

import { motion } from "framer-motion";
import styles from "./TodosWidget.module.css";

interface TodoRow {
  id: string;
  title: string;
  dueDate: string | null;
}

interface Props {
  todos: TodoRow[];
  labels: {
    title: string;
    due: string;
    allDone: string;
  };
}

export function TodosWidget({ todos, labels }: Props) {
  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(59, 130, 246, 0.12), 0 4px 24px rgba(0,0,0,0.15)" }}
      transition={{ duration: 0.2 }}
    >
      <h2 className={styles.title}>{labels.title}</h2>
      {todos.length === 0 ? (
        <p className={styles.empty}>{labels.allDone}</p>
      ) : (
        <ul className={styles.list}>
          {todos.map((todo) => (
            <li key={todo.id} className={styles.item}>
              <span className={styles.todoTitle}>{todo.title}</span>
              {todo.dueDate && (
                <span className={styles.dueBadge}>
                  {labels.due}: {todo.dueDate}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
