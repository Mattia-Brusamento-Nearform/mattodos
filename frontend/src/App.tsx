import { useEffect, useState, useRef, useCallback } from 'react';
import { useTodos } from './hooks/useTodos';
import { TodoInput } from './components/TodoInput';
import { TodoItem } from './components/TodoItem';
import { AppStateDisplay } from './components/AppStateDisplay';
import { TodoFooter } from './components/TodoFooter';
import { LiveRegion } from './components/LiveRegion';

function App() {
  const { state, loadTodos, createTodo, clearError, toggleTodo, deleteTodo } = useTodos();
  const [restoredText, setRestoredText] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const todoRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  // Compute limit state
  const total = state.todos.length;
  const remaining = state.todos.filter(t => !t.completed).length;
  const isAtLimit = total >= 50;

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleCreateTodo = useCallback(async (description: string) => {
    setRestoredText(null);
    const failedText = await createTodo(description);
    if (failedText) {
      setRestoredText(failedText);
    } else {
      setAnnouncement(`Todo added: ${description}`);
      // Focus input after success
      inputRef.current?.focus();
    }
  }, [createTodo]);

  const handleDeleteTodo = useCallback((id: string) => {
    const todoToDelete = state.todos.find(t => t.id === id);
    if (todoToDelete) {
      const index = state.todos.findIndex(t => t.id === id);
      deleteTodo(id);
      
      // Announce deletion
      setAnnouncement(`Todo deleted: ${todoToDelete.description}`);
      
      // Focus management after delete
      setTimeout(() => {
        const remaining = state.todos.filter((_, i) => {
          if (index < i) return true; // Next item
          return false;
        })[0];
        
        if (remaining) {
          const checkboxEl = todoRefs.current.get(remaining.id)?.querySelector('button[role="checkbox"]') as HTMLElement | null;
          checkboxEl?.focus();
        } else if (state.todos.length > 0 && index > 0) {
          // Focus previous item if deleted was last
          const prevTodo = state.todos[index - 1];
          if (prevTodo) {
            const checkboxEl = todoRefs.current.get(prevTodo.id)?.querySelector('button[role="checkbox"]') as HTMLElement | null;
            checkboxEl?.focus();
          }
        } else {
          // Focus input if list is empty
          inputRef.current?.focus();
        }
      }, 0);
    }
  }, [state.todos, deleteTodo]);

  return (
    <div className="bg-stone-50 min-h-screen">
      <LiveRegion message={announcement} />
      <main className="max-w-[560px] mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-stone-900">mattodos</h1>
          <p className="text-sm text-stone-500">Your tasks, your pace.</p>
        </header>
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(28,25,23,0.06)] overflow-hidden">
          <TodoInput ref={inputRef} onSubmit={handleCreateTodo} restoredText={restoredText} disabled={isAtLimit} />
          {isAtLimit && (
            <p className="px-4 py-2 text-sm text-stone-500 border-b border-stone-100">
              Todo limit reached. Complete or delete some to add more.
            </p>
          )}
          <AppStateDisplay state={state} onRetry={loadTodos}>
            <ul role="list" aria-label="Todo list" className="divide-y divide-stone-100">
              {state.todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  ref={(el) => {
                    if (el) todoRefs.current.set(todo.id, el);
                  }}
                  onToggle={toggleTodo}
                  onDelete={() => handleDeleteTodo(todo.id)}
                  onClearError={clearError}
                />
              ))}
            </ul>
          </AppStateDisplay>
          {total > 0 && <TodoFooter remaining={remaining} total={total} />}
        </div>
      </main>
    </div>
  );
}

export default App;
