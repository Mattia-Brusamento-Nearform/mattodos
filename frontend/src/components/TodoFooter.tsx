type TodoFooterProps = {
  remaining: number;
  total: number;
};

export function TodoFooter({ remaining, total }: TodoFooterProps) {
  return (
    <footer
      className="flex justify-between px-4 py-3 border-t border-stone-100"
      aria-live="polite"
    >
      <span className="text-sm text-stone-500">{remaining} remaining</span>
      <span className="text-sm text-stone-400">{total} total</span>
    </footer>
  );
}
