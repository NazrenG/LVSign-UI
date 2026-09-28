import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { FormField } from "./FormField";
import { inputStyles } from "./Input";

const toOption = (option) =>
  typeof option === "string" ? { value: option, label: option } : option;

/**
 * Native <select> styled like the design.
 * options: ["A", "B"] or [{ value, label }]
 */
export function Select({
  label,
  hint,
  options,
  id,
  className,
  wrapperClassName,
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FormField
      label={label}
      hint={hint}
      htmlFor={inputId}
      className={wrapperClassName}
    >
      <div className="relative">
        <select
          id={inputId}
          className={cn(inputStyles, "appearance-none pr-10", className)}
          {...props}
        >
          {options.map(toOption).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-muted"
          aria-hidden
        />
      </div>
    </FormField>
  );
}
