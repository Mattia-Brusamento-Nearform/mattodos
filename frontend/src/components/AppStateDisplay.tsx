import type { ReactNode } from 'react';
import type { AppState } from '../types/todo';

type AppStateDisplayProps = {
  state: AppState;
  onRetry: () => void;
  children: ReactNode;
};

function LoadingSkeleton() {
  return (
    <div aria-busy="true" className="py-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="mx-4 my-3 h-12 bg-stone-100 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <p className="text-stone-400 text-sm">No todos yet</p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="py-12 text-center">
      <p className="text-stone-500 text-sm mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm
                   hover:bg-stone-800 transition-colors focus:outline-none
                   focus:ring-2 focus:ring-stone-600 focus:ring-offset-2"
      >
        Retry
      </button>
    </div>
  );
}

export function AppStateDisplay({
  state,
  onRetry,
  children,
}: AppStateDisplayProps) {
  if (state.loading) {
    return <LoadingSkeleton />;
  }

  if (state.error) {
    return <ErrorState message={state.error} onRetry={onRetry} />;
  }

  if (state.todos.length === 0) {
    return <EmptyState />;
  }

  return <div aria-busy="false">{children}</div>;
}
