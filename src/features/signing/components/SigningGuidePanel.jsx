import { Check, CircleDot } from "lucide-react";
import { FIELD_TYPES } from "@/features/envelopes/models/fieldTypes";
import { cn } from "@/utils/cn";
import { formatDayMonthYear } from "@/utils/formatters";
import { isAutoField, isFieldComplete } from "../utils/fieldValues";

/** Optional right column: the sender's note and a checklist of your fields. */
export function SigningGuidePanel({
  session,
  myFields,
  values,
  activeFieldId,
  onSelectField,
}) {
  const actionable = myFields.filter((field) => !isAutoField(field));

  return (
    <div className="space-y-7">
      {session.message && (
        <section>
          <h2 className="mb-2 text-[13px] font-medium tracking-wide text-ink-muted uppercase">
            Message from {session.sender.name}
          </h2>
          <p className="border-l-2 border-line-strong pl-3 text-[15px] text-ink">
            {session.message}
          </p>
        </section>
      )}

      {session.expiresAt && (
        <p className="text-[13px] text-ink-muted">
          Please complete by{" "}
          <span className="font-medium text-ink">
            {formatDayMonthYear(session.expiresAt)}
          </span>
        </p>
      )}

      <section>
        <h2 className="mb-2 text-[13px] font-medium tracking-wide text-ink-muted uppercase">
          Your fields
        </h2>
        <ol className="-mx-2 space-y-0.5">
          {actionable.map((field) => {
            const done = isFieldComplete(field, values[field.id]);
            const Icon = FIELD_TYPES[field.fieldType]?.icon ?? CircleDot;
            return (
              <li key={field.id}>
                <button
                  type="button"
                  onClick={() => onSelectField(field)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[14px] transition-colors hover:bg-canvas-muted",
                    field.id === activeFieldId && "bg-canvas-muted",
                  )}
                >
                  <Icon
                    className="size-4 shrink-0 text-ink-muted"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate",
                      done ? "text-ink-muted" : "text-ink",
                    )}
                  >
                    {field.label}
                  </span>
                  {done ? (
                    <Check
                      className="size-4 shrink-0 text-success"
                      strokeWidth={2.5}
                      aria-label="Completed"
                    />
                  ) : (
                    <span
                      className={cn(
                        "shrink-0 text-[12px]",
                        field.isRequired ? "text-primary" : "text-ink-subtle",
                      )}
                    >
                      {field.isRequired ? "Required" : "Optional"}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
