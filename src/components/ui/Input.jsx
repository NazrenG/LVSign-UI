import { useId } from "react";
import { cn } from "@/utils/cn";
import { FormField } from "./FormField";

export const inputStyles =
  "h-11 w-full rounded-sm border border-line-strong bg-surface px-3.5 text-[15px] text-ink " +
  "placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 " +
  "[&[readonly]]:bg-canvas [&[readonly]]:text-ink-muted disabled:bg-canvas disabled:text-ink-muted";

/** Box styles for an input with a suffix: the border sits on the wrapper. */
const groupStyles =
  "flex h-11 w-full items-center gap-2 rounded-sm border border-line-strong bg-surface px-3.5 " +
  "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 " +
  "has-[input[readonly]]:bg-canvas";

/**
 * Text input with optional label, hint, leading icon and trailing suffix.
 * <Input label="Expires after" suffix="days after sending" type="number" />
 */
export function Input({
  label,
  hint,
  icon: Icon,
  suffix,
  id,
  className,
  wrapperClassName,
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const icon = Icon && (
    <Icon
      className={cn(
        "pointer-events-none size-4 shrink-0 text-ink-muted",
        !suffix && "absolute top-1/2 left-3.5 -translate-y-1/2",
      )}
      strokeWidth={1.5}
      aria-hidden
    />
  );

  return (
    <FormField
      label={label}
      hint={hint}
      htmlFor={inputId}
      className={wrapperClassName}
    >
      {suffix ? (
        // Flex group: the value and the suffix share the space, so neither is hidden.
        <div className={groupStyles}>
          {icon}
          <input
            id={inputId}
            className={cn(
              "h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink focus:outline-none read-only:text-ink-muted",
              className,
            )}
            {...props}
          />
          <span className="shrink-0 text-[15px] text-ink-muted">{suffix}</span>
        </div>
      ) : (
        <div className="relative">
          {icon}
          <input
            id={inputId}
            className={cn(inputStyles, Icon && "pl-10", className)}
            {...props}
          />
        </div>
      )}
    </FormField>
  );
}
