import { useEffect, useState } from "react";
import { GripVertical } from "lucide-react";
import { FIELD_DRAG_TYPE } from "@/features/envelopes/components/editor/DocumentPage";
import { Card, CardHeader, Select } from "@/components/ui";
import { getRecipientColorMap } from "@/features/envelopes/utils/recipientColors";

import { cn } from "@/utils/cn";

import { FIELD_PALETTE, FIELD_TYPES } from "../../../templateConstants";

const SENDER_ID = "sender";

function canUseField(fieldType, assignee, roles) {
  const type = FIELD_TYPES[fieldType];

  if (!type) {
    return false;
  }

  /*
   * Sender signing field ala bilməz.
   */
  if (assignee === SENDER_ID) {
    return !type.signing;
  }

  const role = roles.find((item) => item.id === assignee);

  if (!role) {
    return false;
  }

  /*
   * Signer və Approver bütün uyğun
   * field-ləri ala bilər.
   */
  if ([1, 2].includes(Number(role.recipientType))) {
    return true;
  }

  /*
   * Viewer və Copy recipient
   * signature/initial/date/stamp
   * field almamalıdır.
   */
  return !type.signing;
}

export function AddFieldsPanel({ template, onAdd }) {
  const roles = template.roles ?? [];
  const sortedRoles = [...roles].sort(
    (a, b) => a.routingOrder - b.routingOrder || a.id.localeCompare(b.id),
  );

  const colorsByRoleId = getRecipientColorMap(sortedRoles);

  const recipientOptions = [
    {
      value: "sender",
      label: "Sender",
    },
    ...sortedRoles.map((role) => ({
      value: role.id,
      label: role.name || "Unnamed recipient",
    })),
  ];
  const [assignee, setAssignee] = useState(roles[0]?.id ?? SENDER_ID);

  useEffect(() => {
    if (assignee === SENDER_ID) {
      return;
    }

    const exists = roles.some((role) => role.id === assignee);

    if (!exists) {
      setAssignee(roles[0]?.id ?? SENDER_ID);
    }
  }, [assignee, roles]);

  const assignees = [
    {
      value: SENDER_ID,
      label: "Sender",
    },

    ...roles.map((role) => ({
      value: role.id,

      label: role.name || "Unnamed recipient",
    })),
  ];

  return (
    <Card className="p-5">
      <CardHeader title="Add fields" className="mb-3" />

     <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={`size-3 shrink-0 rounded-full ${
              colorsByRoleId[assignee]?.dot ?? "bg-ink-muted"
            }`}
            aria-hidden="true"
          />

          <div className="min-w-0 flex-1">
            <Select
              label="Placing fields for"
              options={recipientOptions}
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {FIELD_PALETTE.map((fieldType) => {
          const type = FIELD_TYPES[fieldType];

          if (!type) {
            return null;
          }

          const { label, icon: Icon } = type;

          const allowed = canUseField(fieldType, assignee, roles);

          return (
            <button
              key={fieldType}
              type="button"
              disabled={!allowed}
              draggable={allowed}
              onDragStart={(event) => {
                if (!allowed) {
                  event.preventDefault();
                  return;
                }

                event.dataTransfer.setData(
                  FIELD_DRAG_TYPE,
                  JSON.stringify({
                    fieldType,
                    filledBy: assignee,
                  }),
                );

                event.dataTransfer.effectAllowed = "copy";
              }}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-sm border border-line-strong bg-surface px-2.5 py-1.5 text-left text-[15px] text-ink",
                "cursor-grab hover:border-primary hover:text-primary active:cursor-grabbing",
                "disabled:pointer-events-none disabled:opacity-40",
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

      <p className="mt-3 text-[13px] text-ink-muted">
        Drag a field onto the PDF page.
      </p>
    </Card>
  );
}
