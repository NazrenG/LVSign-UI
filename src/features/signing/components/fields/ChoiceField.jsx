import { useId } from "react";
import { ChevronDown } from "lucide-react";

/** Radio buttons laid out inside the field box. */
export function RadioField({ field, value, onChange, onFocus }) {
  const name = useId();
  return (
    <div
      role="radiogroup"
      aria-label={field.label}
      aria-required={field.isRequired}
      className="flex size-full flex-wrap content-center items-center gap-x-[1.2em] gap-y-[0.2em] px-1.5"
    >
      {field.options.map((option) => (
        <label
          key={option}
          className="inline-flex cursor-pointer items-center gap-[0.4em] text-ink"
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            onFocus={onFocus}
            className="size-[1.05em] accent-primary"
          />
          {option}
        </label>
      ))}
    </div>
  );
}

/** Native select (best on phones), styled to sit on the page. */
export function DropdownField({ field, value, onChange, onFocus }) {
  return (
    <div className="relative size-full">
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        aria-label={field.label}
        aria-required={field.isRequired}
        className="size-full appearance-none bg-transparent pr-[1.6em] pl-1.5 text-ink focus:outline-none"
      >
        <option value="" disabled>
          Choose…
        </option>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-[0.3em] size-[1em] -translate-y-1/2 text-ink-muted"
        aria-hidden
      />
    </div>
  );
}
