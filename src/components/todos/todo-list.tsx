"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { type Todo } from "@/db/schema";
import { TodoItem } from "./todo-item";
import { TodoForm } from "./todo-form";
import { TodoFilters } from "./todo-filters";
import styles from "./todo-list.module.css";

type Filter = "all" | "pending" | "done" | "cancelled";

interface TodoListProps {
  initialTodos: Todo[];
}

export function TodoList({ initialTodos }: TodoListProps) {
  const t = useTranslations("todos");
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [filter, setFilter] = useState<Filter>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredTodos = filter === "all" ? todos : todos.filter(item => item.status === filter);

  const handleAdd = async (data: { title: string; description?: string; dueDate?: string }) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const newTodo = await res.json();
      setTodos(prev => [newTodo, ...prev]);
      showToast(t("toast.added"));
      setShowForm(false);
    }
  };

  const handleEdit = async (id: string, data: { title: string; description?: string; dueDate?: string }) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos(prev => prev.map(item => item.id === id ? updated : item));
      showToast(t("toast.updated"));
      setEditingTodo(null);
    }
  };

  const handleComplete = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos(prev => prev.map(item => item.id === id ? updated : item));
      showToast(t("toast.completed"));
    }
  };

  const handleCancel = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos(prev => prev.map(item => item.id === id ? updated : item));
      showToast(t("toast.cancelled"));
    }
  };

  const handleRestore = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "pending" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos(prev => prev.map(item => item.id === id ? updated : item));
      showToast(t("toast.restored"));
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTodos(prev => prev.filter(item => item.id !== id));
      showToast(t("toast.deleted"));
    }
  };

  return (
    <div className={styles.wrapper}>
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.topBar}>
        <TodoFilters filter={filter} onFilterChange={setFilter} />
        <button className={styles.addButton} onClick={() => setShowForm(true)}>
          + {t("addTask")}
        </button>
      </div>

      {(showForm || editingTodo) && (
        <div className={styles.formOverlay} onClick={() => { setShowForm(false); setEditingTodo(null); }}>
          <div onClick={e => e.stopPropagation()}>
            <TodoForm
              todo={editingTodo ?? undefined}
              onSubmit={editingTodo
                ? (data) => handleEdit(editingTodo.id, data)
                : handleAdd
              }
              onCancel={() => { setShowForm(false); setEditingTodo(null); }}
            />
          </div>
        </div>
      )}

      <div className={styles.list}>
        {filteredTodos.length === 0 ? (
          <div className={styles.empty}>{t(`empty.${filter}`)}</div>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onComplete={handleComplete}
              onEdit={setEditingTodo}
              onCancel={handleCancel}
              onRestore={handleRestore}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
