import { useId } from "react";

/** Vertical list of radio buttons. options: [{ value, label }] */
export function RadioGroup({ legend, options, value, onChange, name }) {
  const generatedName = useId();

  return (
    <fieldset>
      {legend && (
        <legend className="mb-2 text-sm font-medium text-ink">{legend}</legend>
      )}
      <div className="space-y-2.5">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2.5 text-[15px] text-ink"
          >
            <input
              type="radio"
              name={name ?? generatedName}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="size-[18px] accent-primary"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
