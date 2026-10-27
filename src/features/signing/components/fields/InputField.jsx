/** Text, full name, email and number: typed straight onto the page. */
export function InputField({ field, value, onChange, onFocus }) {
  const isNumber = field.fieldType === "number";
  return (
    <input
      type={field.fieldType === "email" ? "email" : "text"}
      inputMode={isNumber ? "decimal" : undefined}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      onFocus={onFocus}
      aria-label={field.label}
      aria-required={field.isRequired}
      placeholder={field.label}
      autoComplete="off"
      className="size-full min-w-0 bg-transparent px-1.5 text-ink placeholder:text-ink-subtle focus:outline-none"
    />
  );
}
