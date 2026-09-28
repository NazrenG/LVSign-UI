import { cn } from "@/utils/cn";

/**
 * Row of separate bordered buttons, one selected:
 * [Staff] [HR] [Finance]  or  [👥 HR] [💳 Finance] …
 * options: ["A", "B"] or [{ value, label, icon? }]
 */
export function OptionButtons({ legend, options, value, onChange, className }) {
  const items = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );

  return (
    <fieldset>
      {legend && (
        <legend className="mb-1.5 text-sm font-medium text-ink">
          {legend}
        </legend>
      )}
      <div className={cn("flex flex-wrap gap-2", className)}>
        {items.map(({ value: optionValue, label, icon: Icon }) => {
          const isSelected = optionValue === value;
          return (
            <button
              key={optionValue}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(optionValue)}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-2 rounded-sm border px-4 text-[15px] font-medium transition-colors",
                isSelected
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-line-strong bg-surface text-ink hover:bg-canvas",
              )}
            >
              {Icon && (
                <Icon className="size-4" strokeWidth={1.5} aria-hidden />
              )}
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
