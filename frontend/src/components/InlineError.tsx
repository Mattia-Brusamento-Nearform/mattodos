import { useEffect } from 'react';

type InlineErrorProps = {
  message: string;
  onDismiss: () => void;
};

export function InlineError({ message, onDismiss }: InlineErrorProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2 mt-1 motion-safe:animate-fade-in"
    >
      {message}
    </div>
  );
}
