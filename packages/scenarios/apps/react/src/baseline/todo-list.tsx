import { useState } from 'react';
interface Todo {
  id: string;
  title: string;
}
export function DraftTodos({ todos }: { todos: Todo[] }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        // expect: error react(no-array-index-key) -- Removing a task reuses the wrong row.
        <li key={index}>{todo.title}</li>
      ))}
    </ul>
  );
}
export function TodoList({ todos, visible }: { todos: Todo[]; visible: boolean }) {
  if (visible) {
    // expect: error react-hooks(rules-of-hooks) -- Toggling visibility changes the hook order.
    const [heading] = useState('Tasks');
    return (
      <section>
        <h2>{heading}</h2>
        <img src="/tasks.png" alt="" />
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      </section>
    );
  }
  return null;
}
