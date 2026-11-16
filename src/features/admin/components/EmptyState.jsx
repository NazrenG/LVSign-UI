/** Quiet empty-state row for filtered lists. */
export function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <p className="text-[15px] font-medium text-ink">{title}</p>
      {message && <p className="text-[14px] text-ink-muted">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
