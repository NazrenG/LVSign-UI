import { cn } from "@/utils/cn";
import { pluralize } from "@/utils/formatters";
import { FIELD_TYPES } from "../../../templateConstants";
import {
  getFieldGroups,
  getRole,
  rolesWithoutSignature,
} from "../../../templateSelectors";

/** Left column: every field, grouped by who fills it. */
export function FieldGroupsList({ template, selectedId, onSelect }) {
  const missing = rolesWithoutSignature(template);

  return (
    <nav aria-label="Fields on this template">
      <h2 className="mb-4 text-base font-semibold text-ink">
        Fields on this template
      </h2>
      <div className="space-y-5">
        {getFieldGroups(template).map((group) => (
          <section key={group.key}>
            <h3 className="mb-1.5 flex justify-between text-[13px] font-medium text-ink">
              {group.title}
              <span className="font-normal text-ink-muted">
                {group.fields.length}
              </span>
            </h3>
            <ul className="border-l border-line">
              {group.fields.map((field) => (
                <li key={field.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(field.id)}
                    className={cn(
                      "-ml-px w-full border-l-2 py-1 pl-3 text-left text-[15px] transition-colors",
                      field.id === selectedId
                        ? "border-primary font-medium text-primary"
                        : "border-transparent text-ink-muted hover:text-ink",
                    )}
                  >
                    {field.filledBy === "calculated"
                      ? `${field.label} (calculated)`
                      : field.label || FIELD_TYPES[field.type].label}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p
        className={cn(
          "mt-5 text-[13px]",
          missing.length ? "text-danger" : "text-ink-muted",
        )}
      >
        {pluralize(template.fields.length, "field")} ·{" "}
        {missing.length
          ? `${missing.map((roleStep) => getRole(roleStep).name).join(", ")} still needs a signature field`
          : "every signer role has a signature field"}
      </p>
    </nav>
  );
}
