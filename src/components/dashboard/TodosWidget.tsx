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
    <div className={styles.card}>
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
    </div>
  );
}
