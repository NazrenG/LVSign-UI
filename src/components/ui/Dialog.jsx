import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { cn } from "@/utils/cn";

/**
 * Centered modal. Closes on Escape and backdrop click.
 * <Dialog isOpen title="…" onClose={…} footer={<Button …/>}>…</Dialog>
 */
export function Dialog({
  isOpen,
  title,
  description,
  onClose,
  footer,
  size = "md",
  children,
}) {
  const titleId = useId();
  const panelRef = useRef(null);
  // Latest onClose without re-running the open/focus effect on every render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previouslyFocused = document.activeElement;
    // Focus the first form control, or the panel itself.
    const target =
      panelRef.current?.querySelector("input, select, textarea") ??
      panelRef.current;
    target?.focus();
    const onKey = (event) => event.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-ink/30"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col rounded-t-md bg-surface shadow-xl focus:outline-none sm:rounded-md",
          size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg",
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="font-serif text-2xl text-ink">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[15px] text-ink-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-muted hover:bg-canvas"
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-5 py-4 sm:px-6">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
