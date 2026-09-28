import { cn } from "@/utils/cn";

/** Muted side card with a bullet list ("Before you continue", "How roles resolve"). */
export function NoteCard({ title, items, className }) {
  return (
    <aside
      className={cn(
        "rounded-md border border-line bg-canvas-muted/60 p-5",
        className,
      )}
    >
      <h3 className="mb-3 text-base font-semibold text-ink">{title}</h3>
      <ul className="list-disc space-y-2 pl-5 text-[15px] text-ink-muted marker:text-ink-subtle">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  );
}
