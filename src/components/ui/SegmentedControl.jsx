import { cn } from "@/utils/cn";

/**
 * Grey track with one raised option: [ In order | All at once ]
 * options: [{ value, label, icon? }]
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  label,
  className,
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex rounded-md bg-canvas-muted p-1", className)}
    >
      {options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => {
        const isActive = optionValue === value;
        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(optionValue)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-sm px-3 py-2 text-[15px] whitespace-nowrap transition-colors",
              isActive
                ? "bg-surface font-medium text-ink shadow-xs"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {Icon && <Icon className="size-4" strokeWidth={1.5} aria-hidden />}
            {optionLabel}
          </button>
        );
      })}
    </div>
  );
}
