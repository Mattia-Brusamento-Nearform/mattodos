type TodoCheckboxProps = {
  checked: boolean;
  onToggle: () => void;
  label: string;
};

export function TodoCheckbox({ checked, onToggle, label }: TodoCheckboxProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? `Mark "${label}" as incomplete` : `Mark "${label}" as complete`}
      className="flex-shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full
        focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2"
    >
      <div className={`flex items-center justify-center w-6 h-6 border-2 rounded-full transition-colors
        ${checked 
          ? 'bg-green-600 border-green-600 motion-safe:animate-checkbox-pop' 
          : 'border-stone-300 hover:border-stone-400'
        }`}>
        {checked && (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </button>
  );
}
