import { useState } from 'react';
import type { Todo } from '../types/todo';
import { TodoCheckbox } from './TodoCheckbox';
import { DeleteButton } from './DeleteButton';
import { ConfirmDialog } from './ConfirmDialog';
import { InlineError } from './InlineError';

type TodoItemProps = {
  todo: Todo;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClearError?: (id: string) => void;
};

export function TodoItem({ todo, onToggle, onDelete, onClearError }: TodoItemProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const formattedDate = new Date(todo.createdAt).toLocaleDateString();

  const handleConfirmDelete = () => {
    setShowConfirm(false);
    onDelete?.(todo.id);
  };

  return (
    <li
      className={`group px-4 py-3 flex items-center gap-3 motion-safe:animate-fade-in
                  ${todo.optimistic ? 'opacity-70' : ''}`}
    >
      <TodoCheckbox
        checked={todo.completed}
        onToggle={() => onToggle?.(todo.id)}
        label={todo.description}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-stone-900 truncate ${
          todo.completed ? 'line-through opacity-40' : ''
        }`}>
          {todo.description}
        </p>
        <time className="text-xs text-stone-400" dateTime={todo.createdAt}>
          {formattedDate}
        </time>
      </div>
      <DeleteButton
        onDelete={() => setShowConfirm(true)}
        todoDescription={todo.description}
      />
      {todo.error && (
        <InlineError
          message={todo.error}
          onDismiss={() => onClearError?.(todo.id)}
        />
      )}
      <ConfirmDialog
        isOpen={showConfirm}
        title={`Delete '${todo.description}'?`}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
      />
    </li>
  );
}
