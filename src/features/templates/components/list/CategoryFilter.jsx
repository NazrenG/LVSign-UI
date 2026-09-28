import { cn } from "@/utils/cn";
import { TEMPLATE_CATEGORIES } from "../../templateConstants";

const OPTIONS = [{ value: "all", label: "All" }, ...TEMPLATE_CATEGORIES];

/** Pill tabs: (All 14) (HR 4) (Finance 3) … */
export function CategoryFilter({ value, counts, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Filter by category"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[15px] font-medium transition-colors",
              isActive
                ? "border-primary bg-primary-soft text-primary"
                : "border-line-strong bg-surface text-ink hover:bg-canvas",
            )}
          >
            {option.label}
            <span className={isActive ? "text-primary" : "text-ink-muted"}>
              {counts[option.value] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
