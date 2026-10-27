import { Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { TOUCH_TARGET } from "./fieldStyles";

export function CheckboxField({ field, value, onChange, onFocus }) {
  const checked = value === true;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={field.label}
      aria-required={field.isRequired}
      onClick={() => onChange(!checked)}
      onFocus={onFocus}
      className={cn(
        "relative flex size-full items-center justify-center focus:outline-none",
        TOUCH_TARGET,
      )}
    >
      {checked && (
        <Check className="size-[85%] text-ink" strokeWidth={3} aria-hidden />
      )}
    </button>
  );
}
