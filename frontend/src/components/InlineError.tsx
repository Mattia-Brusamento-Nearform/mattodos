import { useEffect, useState } from 'react';

type InlineErrorProps = {
  message: string;
  onDismiss: () => void;
};

export function InlineError({ message, onDismiss }: InlineErrorProps) {
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    // Start fade-out at 4800ms (200ms before actual dismiss at 5000ms)
    const fadeOutTimer = setTimeout(() => setDismissing(true), 4800);
    
    // Actually dismiss after fade completes at 5000ms
    const dismissTimer = setTimeout(onDismiss, 5000);
    
    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(dismissTimer);
    };
  }, [onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2 mt-1 ${
        dismissing
          ? 'motion-safe:animate-fade-out'
          : 'motion-safe:animate-fade-in'
      }`}
    >
      {message}
    </div>
  );
}
