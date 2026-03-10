import type { Todo } from '../types/todo';
import { InlineError } from './InlineError';

type TodoItemProps = {
  todo: Todo;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClearError?: (id: string) => void;
};

export function TodoItem({ todo, onClearError }: TodoItemProps) {
  const formattedDate = new Date(todo.createdAt).toLocaleDateString();

  return (
    <li
      className={`px-4 py-3 flex items-center gap-3 motion-safe:animate-fade-in
                  ${todo.optimistic ? 'opacity-70' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-stone-900 truncate">{todo.description}</p>
        <time className="text-xs text-stone-400" dateTime={todo.createdAt}>
          {formattedDate}
        </time>
      </div>
      {todo.error && (
        <InlineError
          message={todo.error}
          onDismiss={() => onClearError?.(todo.id)}
        />
      )}
    </li>
  );
}
