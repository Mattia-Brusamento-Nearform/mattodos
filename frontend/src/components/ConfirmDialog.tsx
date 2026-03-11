import { useEffect, useRef } from 'react';

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  isOpen,
  title,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = [
          cancelButtonRef.current,
          confirmButtonRef.current,
        ].filter(Boolean) as HTMLElement[];

        if (focusableElements.length === 0) return;

        const activeIndex = focusableElements.indexOf(
          document.activeElement as HTMLElement
        );
        let nextIndex = activeIndex + 1;

        if (e.shiftKey) {
          nextIndex = activeIndex - 1;
          if (nextIndex < 0) {
            nextIndex = focusableElements.length - 1;
          }
        } else {
          if (nextIndex >= focusableElements.length) {
            nextIndex = 0;
          }
        }

        e.preventDefault();
        focusableElements[nextIndex]?.focus();
      }
    };

    // Focus Cancel button on open
    cancelButtonRef.current?.focus();

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-50"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4"
      >
        <div className="bg-white w-full md:max-w-sm rounded-t-2xl md:rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-5 md:slide-in-from-center md:zoom-in duration-200">
          <div className="p-6">
            <h2
              id="confirm-title"
              className="text-lg font-semibold text-stone-900 mb-6"
            >
              {title}
            </h2>

            <div className="flex gap-3 flex-col-reverse md:flex-row md:justify-end">
              <button
                ref={cancelButtonRef}
                onClick={onCancel}
                className="px-4 py-2 min-h-[44px] rounded-lg text-stone-600 hover:bg-stone-100 transition-colors font-medium focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2"
              >
                Cancel
              </button>
              <button
                ref={confirmButtonRef}
                onClick={onConfirm}
                className="px-4 py-2 min-h-[44px] rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
