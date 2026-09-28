import { cn } from "@/utils/cn";
import { STATUS_TABS } from "../agreementStatus";

export function StatusTabs({ value, counts, onChange }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div
        role="tablist"
        aria-label="Filter by status"
        className="flex min-w-max gap-6 border-b border-line"
      >
        {STATUS_TABS.map((tab) => {
          const isActive = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.value)}
              className={cn(
                "-mb-px border-b-2 pb-2.5 text-[15px] transition-colors",
                isActive
                  ? "border-ink font-semibold text-ink"
                  : "border-transparent text-ink-muted hover:text-ink",
              )}
            >
              {tab.label}{" "}
              <span className="ml-1 font-normal text-ink-muted">
                {counts[tab.value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
