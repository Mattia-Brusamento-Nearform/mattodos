import { useEffect, useState } from 'react';
import { useTodos } from './hooks/useTodos';
import { TodoInput } from './components/TodoInput';
import { TodoItem } from './components/TodoItem';
import { AppStateDisplay } from './components/AppStateDisplay';
import { TodoFooter } from './components/TodoFooter';

function App() {
  const { state, loadTodos, createTodo, clearError, toggleTodo, deleteTodo } = useTodos();
  const [restoredText, setRestoredText] = useState<string | null>(null);

  // Compute limit state
  const total = state.todos.length;
  const remaining = state.todos.filter(t => !t.completed).length;
  const isAtLimit = total >= 50;

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleCreateTodo = async (description: string) => {
    setRestoredText(null);
    const failedText = await createTodo(description);
    if (failedText) {
      setRestoredText(failedText);
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen">
      <main className="max-w-[560px] mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-stone-900">mattodos</h1>
          <p className="text-sm text-stone-500">Your tasks, your pace.</p>
        </header>
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(28,25,23,0.06)] overflow-hidden">
          <TodoInput onSubmit={handleCreateTodo} restoredText={restoredText} disabled={isAtLimit} />
          {isAtLimit && (
            <p className="px-4 py-2 text-sm text-stone-500 border-b border-stone-100">
              Todo limit reached. Complete or delete some to add more.
            </p>
          )}
          <AppStateDisplay state={state} onRetry={loadTodos}>
            <ul role="list" className="divide-y divide-stone-100">
              {state.todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
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
