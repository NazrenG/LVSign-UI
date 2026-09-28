import { useId } from "react";
import { cn } from "@/utils/cn";
import { FormField } from "./FormField";
import { inputStyles } from "./Input";

export function Textarea({ label, hint, id, rows = 3, className, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FormField label={label} hint={hint} htmlFor={inputId}>
      <textarea
        id={inputId}
        rows={rows}
        className={cn(inputStyles, "h-auto resize-y py-2.5", className)}
        {...props}
      />
    </FormField>
  );
}
