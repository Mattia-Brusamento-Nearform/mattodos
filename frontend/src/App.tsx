import { useEffect, useState } from 'react';
import { useTodos } from './hooks/useTodos';
import { TodoInput } from './components/TodoInput';
import { TodoItem } from './components/TodoItem';
import { AppStateDisplay } from './components/AppStateDisplay';

function App() {
  const { state, loadTodos, createTodo, clearError } = useTodos();
  const [restoredText, setRestoredText] = useState<string | null>(null);

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
          <TodoInput onSubmit={handleCreateTodo} restoredText={restoredText} />
          <AppStateDisplay state={state} onRetry={loadTodos}>
            <ul role="list" className="divide-y divide-stone-100">
              {state.todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onClearError={clearError}
                />
              ))}
            </ul>
          </AppStateDisplay>
        </div>
      </main>
    </div>
  );
}

export default App;
