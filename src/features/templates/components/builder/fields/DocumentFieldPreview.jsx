import { PenLine } from "lucide-react";
import { LogoMark } from "@/components/ui";
import { cn } from "@/utils/cn";
import { FIELD_TYPES } from "../../../templateConstants";
import {
  getFillerLabel,
  getRole,
  getRoleFields,
  getSenderSideFields,
} from "../../../templateSelectors";

const SHORT_FIELD_TYPES = ["date", "number", "checkbox"];

function FieldBox({
  field,
  template,
  isSelected,
  onSelect,
  className,
  children,
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(field.id)}
      aria-pressed={isSelected}
      className={cn(
        "relative rounded-[2px] border px-2.5 py-1.5 text-left transition-colors",
        isSelected
          ? "border-primary bg-primary-soft/40 ring-1 ring-primary"
          : "border-dashed border-ink-subtle hover:border-primary",
        className,
      )}
    >
      {children ?? (
        <>
          <span className="block text-[13px] text-ink">
            {FIELD_TYPES[field.type].label} ·{" "}
            {field.filledBy === "hrSystem"
              ? "Pre-filled"
              : getFillerLabel(field.filledBy, template)}
          </span>
          <span className="block truncate font-mono text-[11px] text-ink-muted">
            {field.dataKey || "no data key"}
          </span>
        </>
      )}
      {isSelected && (
        <>
          {/* Resize handles, as in the design */}
          {[
            "-top-1 -left-1",
            "-top-1 -right-1",
            "-bottom-1 -left-1",
            "-bottom-1 -right-1",
          ].map((position) => (
            <span
              key={position}
              aria-hidden
              className={cn(
                "absolute size-2 border border-primary bg-surface",
                position,
              )}
            />
          ))}
        </>
      )}
    </button>
  );
}

/** The document page with every field drawn where it will appear. */
export function DocumentFieldPreview({ template, selectedId, onSelect }) {
  const boxProps = { template, onSelect };

  return (
    <article className="mx-auto w-full max-w-[640px] bg-surface p-6 shadow-[0_24px_48px_-28px_rgb(0_0_0/0.25)] sm:p-12">
      <div className="flex items-start justify-between">
        <LogoMark className="h-5 w-6 text-[10px]" />
        <span className="font-mono text-[11px] text-ink-muted">
          {template.docPrefix || "PREFIX"}-2026-····
        </span>
      </div>
      <h3 className="mt-8 font-serif text-2xl text-ink">{template.name}</h3>
      {template.intro && (
        <p className="mt-3 font-serif text-[15px] text-ink">{template.intro}</p>
      )}

      <dl className="mt-5 divide-y divide-line border-b border-line">
        {getSenderSideFields(template).map((field) => (
          <div
            key={field.id}
            className="grid grid-cols-[1fr_1.4fr] items-center gap-4 py-1.5"
          >
            <dt className="font-serif text-[15px] text-ink-muted">
              {field.label}
            </dt>
            <dd>
              <FieldBox
                field={field}
                isSelected={field.id === selectedId}
                className={
                  SHORT_FIELD_TYPES.includes(field.type) ? "w-3/5" : "w-full"
                }
                {...boxProps}
              />
            </dd>
          </div>
        ))}
      </dl>

      {template.outro && (
        <p className="mt-5 font-serif text-[15px] text-ink">{template.outro}</p>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {template.roles.map((roleStep) => {
          const fields = getRoleFields(template, roleStep.id);
          const role = getRole(roleStep);
          const anchor =
            fields.find((field) => field.type === "signature") ?? fields[0];
          return (
            <div key={roleStep.id}>
              <p className="mb-1.5 text-[13px] font-medium text-ink">
                {role.name}
              </p>
              {anchor ? (
                <FieldBox
                  field={anchor}
                  isSelected={fields.some((field) => field.id === selectedId)}
                  className="w-full py-3"
                  {...boxProps}
                >
                  <span className="flex items-center gap-1.5 text-[13px] text-ink">
                    <PenLine className="size-3.5" aria-hidden />
                    {role.name} signs here
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-ink-muted">
                    {fields
                      .map((field) =>
                        FIELD_TYPES[field.type].label.toLowerCase(),
                      )
                      .join(" · ")}
                  </span>
                </FieldBox>
              ) : (
                <p className="rounded-[2px] border border-dashed border-danger px-2.5 py-3 text-[13px] text-danger">
                  No signing fields yet
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-right font-mono text-[11px] text-ink-muted">
        Page 1 of 1
      </p>
    </article>
  );
}
