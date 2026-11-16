/** Heading row for an Admin section: title + description + actions. */
export function AdminSectionHeader({ title, description, actions }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="font-serif text-2xl text-ink">{title}</h2>
        {description && (
          <p className="mt-1 text-[15px] text-ink-muted">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>
      )}
    </div>
  );
}
