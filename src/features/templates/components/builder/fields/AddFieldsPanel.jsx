import { useState } from "react";
import { GripVertical } from "lucide-react";
import { Card, CardHeader, SegmentedControl } from "@/components/ui";
import { cn } from "@/utils/cn";
import { FIELD_PALETTE, FIELD_TYPES, FILLER } from "../../../templateConstants";
import { getRole } from "../../../templateSelectors";

/** Palette of field types; clicking one adds it for the chosen filler. */
export function AddFieldsPanel({ template, onAdd }) {
  const [assignee, setAssignee] = useState(FILLER.SENDER);

  const assignees = [
    { value: FILLER.SENDER, label: "Sender" },
    ...template.roles.map((roleStep) => {
      const role = getRole(roleStep);
      return { value: roleStep.id, label: role.shortName ?? role.name };
    }),
  ];

  const isSender = assignee === FILLER.SENDER;

  return (
    <Card className="p-5">
      <CardHeader title="Add fields" className="mb-3" />
      <p className="mb-1.5 text-[13px] text-ink-muted">Assign new fields to</p>
      <SegmentedControl
        label="Assign new fields to"
        options={assignees}
        value={assignee}
        onChange={setAssignee}
        className="mb-4 overflow-x-auto *:px-2 *:text-sm"
      />

      <div className="grid grid-cols-2 gap-2">
        {FIELD_PALETTE.map((type) => {
          const { label, icon: Icon, signing } = FIELD_TYPES[type];
          const isDisabled = signing && isSender;
          return (
            <button
              key={type}
              type="button"
              disabled={isDisabled}
              title={
                isDisabled
                  ? "Only signer roles can sign"
                  : `Add ${label.toLowerCase()} field`
              }
              onClick={() => onAdd(type, assignee)}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-sm border border-line-strong bg-surface px-2.5 py-1.5 text-left text-[15px] leading-tight text-ink transition-colors",
                "hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40",
              )}
            >
              <GripVertical
                className="size-3.5 shrink-0 text-ink-subtle"
                aria-hidden
              />
              <Icon className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
