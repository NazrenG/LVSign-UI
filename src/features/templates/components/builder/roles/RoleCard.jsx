import { GripVertical } from "lucide-react";

import { Card, Input, Menu, Select, SettingRow, Toggle } from "@/components/ui";

const RECIPIENT_TYPES = [
  {
    value: 1,
    label: "Signer",
  },
  {
    value: 2,
    label: "Approver",
  },
  {
    value: 3,
    label: "Viewer",
  },
  {
    value: 4,
    label: "Copy recipient",
  },
];

function getRecipientTypeLabel(type) {
  switch (Number(type)) {
    case 2:
      return "Approver";

    case 3:
      return "Viewer";

    case 4:
      return "Copy recipient";

    default:
      return "Signer";
  }
}

export function RoleCard({
  roleStep,
  index,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <GripVertical
              className="mt-1 size-4 shrink-0 text-ink-subtle"
              aria-hidden
            />

            <div className="min-w-0">
              <p className="text-[13px] text-ink-muted">
                Step {index + 1} · Routing order {roleStep.routingOrder}
              </p>

              <h3 className="truncate text-base font-semibold text-ink">
                {roleStep.name || "Unnamed recipient"}
              </h3>

              <p className="mt-0.5 text-[13px] text-ink-muted">
                {getRecipientTypeLabel(roleStep.recipientType)}
              </p>
            </div>
          </div>

          <Menu
            label={`${roleStep.name || "Recipient"} actions`}
            items={[
              {
                label: "Move up",
                onSelect: onMoveUp,
                disabled: index === 0,
              },
              {
                label: "Move down",
                onSelect: onMoveDown,
                disabled: index === total - 1,
              },
              {
                label: "Remove role",
                onSelect: onDelete,
                tone: "danger",
              },
            ]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Role name"
            value={roleStep.name ?? ""}
            onChange={(event) =>
              onChange({
                name: event.target.value,
              })
            }
            placeholder="e.g. Department manager"
          />

          <Select
            label="Recipient type"
            options={RECIPIENT_TYPES}
            value={roleStep.recipientType}
            onChange={(event) =>
              onChange({
                recipientType: Number(event.target.value),
              })
            }
          />
        </div>

        <div className="border-t border-line pt-4">
          <SettingRow
            title="Required recipient"
            description="This recipient must participate in the envelope workflow."
            control={
              <Toggle
                label="Required recipient"
                checked={roleStep.isRequired}
                onChange={(isRequired) =>
                  onChange({
                    isRequired,
                  })
                }
              />
            }
          />
        </div>

        <div className="space-y-4 border-t border-line pt-4">
          <p className="text-[13px] font-medium text-ink-muted">
            Sender permissions
          </p>

          <SettingRow
            title="Can edit recipient"
            description={
              roleStep.defaultUserId
                ? "The sender may replace or edit this recipient before sending."
                : "A default user must be selected before this recipient can be locked."
            }
            control={
              <Toggle
                label="Sender can edit recipient"
                checked={roleStep.allowSenderEditRecipient}
                disabled={!roleStep.defaultUserId}
                onChange={(value) =>
                  onChange({
                    allowSenderEditRecipient: value,
                  })
                }
              />
            }
          />

          <SettingRow
            title="Can delete recipient"
            description="The sender may remove this recipient before sending."
            control={
              <Toggle
                label="Sender can delete recipient"
                checked={roleStep.allowSenderDeleteRecipient}
                onChange={(value) =>
                  onChange({
                    allowSenderDeleteRecipient: value,
                  })
                }
              />
            }
          />

          <SettingRow
            title="Can change routing order"
            description="The sender may change when this recipient receives the document."
            control={
              <Toggle
                label="Sender can change routing order"
                checked={roleStep.allowSenderChangeRoutingOrder}
                onChange={(value) =>
                  onChange({
                    allowSenderChangeRoutingOrder: value,
                  })
                }
              />
            }
          />
        </div>
      </div>
    </Card>
  );
}
