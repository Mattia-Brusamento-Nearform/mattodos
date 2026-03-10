type DeleteButtonProps = {
  onDelete: () => void;
  todoDescription: string;
};

export function DeleteButton({ onDelete, todoDescription }: DeleteButtonProps) {
  return (
    <button
      type="button"
      onClick={onDelete}
      aria-label={`Delete '${todoDescription}'`}
      className={`flex-shrink-0 w-7 h-7 flex items-center justify-center text-stone-400 hover:text-red-600 
        rounded-full hover:bg-red-50 transition-colors
        focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2
        motion-safe:transition-opacity duration-150
        opacity-0 group-hover:opacity-100 focus-visible:opacity-100
        @media (hover: none) { opacity: 1 }`}
    >
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      </svg>
    </button>
  );
}
