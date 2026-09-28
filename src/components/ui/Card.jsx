import { cn } from "@/utils/cn";

export function Card({ as: Component = "div", className, children, ...props }) {
  return (
    <Component
      className={cn("rounded-md border border-line bg-surface", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Card title row: title + optional description on the left, action on the right. */
export function CardHeader({ title, description, action, className }) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {description && (
          <p className="mt-1 text-[13px] text-ink-muted">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
