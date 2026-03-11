import { useState, useRef, useEffect, forwardRef } from 'react';

type TodoInputProps = {
  onSubmit: (text: string) => void;
  restoredText?: string | null;
  disabled?: boolean;
};

export const TodoInput = forwardRef<HTMLInputElement, TodoInputProps>(
  ({ onSubmit, restoredText, disabled }, ref) => {
    const [text, setText] = useState('');
    const internalRef = useRef<HTMLInputElement>(null);

    // Auto-focus on mount
    useEffect(() => {
      internalRef.current?.focus();
    }, []);

    // Restore text on failure
    useEffect(() => {
      if (restoredText) {
        setText(restoredText);
        internalRef.current?.focus();
      }
    }, [restoredText]);

    // Sync forwarded ref to internal ref
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(internalRef.current);
        } else {
          ref.current = internalRef.current;
        }
      }
    }, [ref]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const trimmed = text.trim();
        if (!trimmed) return;
        onSubmit(trimmed);
        setText('');
      }
    };

    return (
      <div className="border-b border-stone-100">
        <input
          ref={internalRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Todo limit reached" : "What's on your mind?"}
          disabled={disabled}
          className="w-full p-4 text-base text-stone-900 placeholder:text-stone-400 bg-transparent
                     focus:border-slate-600 focus:ring-4 focus:ring-slate-600/8 focus:outline-none
                     disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="New todo"
        />
      </div>
    );
  }
);
