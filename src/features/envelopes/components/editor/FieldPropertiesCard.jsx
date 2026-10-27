import { Copy, GripVertical, Plus, X } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  Input,
  Select,
  SettingRow,
  Toggle,
} from "@/components/ui";
import {
  FIELD_TYPE_OPTIONS,
  FIELD_TYPES,
  isFieldAllowedFor,
} from "../../models/fieldTypes";
import { RECIPIENT_TYPES } from "../../models/recipientTypes";
import { getDocument } from "../../utils/envelopeSelectors";
import { recipientName } from "./RecipientDot";

const percent = (value) => `${(value * 100).toFixed(1)}%`;

function OptionsEditor({ options, onChange }) {
  const setOption = (index, value) =>
    onChange(options.map((option, i) => (i === index ? value : option)));

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">Options</p>
      <ul className="divide-y divide-line rounded-sm border border-line-strong">
        {options.map((option, index) => (
          <li key={index} className="flex items-center gap-2 pr-1 pl-2.5">
            <GripVertical
              className="size-3.5 shrink-0 text-ink-subtle"
              aria-hidden
            />
            <input
              value={option}
              aria-label={`Option ${index + 1}`}
              onChange={(event) => setOption(index, event.target.value)}
              className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-ink focus:outline-none"
            />
            <button
              type="button"
              aria-label={`Remove ${option || "option"}`}
              disabled={options.length <= 1}
              onClick={() => onChange(options.filter((_, i) => i !== index))}
              className="rounded-sm p-1.5 text-ink-subtle hover:text-danger disabled:opacity-30"
            >
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <Button
        variant="ghost"
        icon={Plus}
        className="mt-1 -ml-3"
        onClick={() => onChange([...options, `Option ${options.length + 1}`])}
      >
        Add option
      </Button>
    </div>
  );
}

/** Right-panel editor for the selected field. */
export function FieldPropertiesCard({
  envelope,
  field,
  fieldOwners,
  actions,
  commands,
}) {
  const update = (patch, coalesceKey) =>
    commands.updateField(field.id, patch, { coalesceKey });

  const updateLocal = (patch, coalesceKey) =>
    actions.updateField(field.id, patch, { coalesceKey });
  const document = getDocument(envelope, field.documentId);
  const recipient = envelope.recipients.find(
    (item) => item.id === field.recipientId,
  );
  const definition = FIELD_TYPES[field.type];
  const isMisassigned =
    recipient && !isFieldAllowedFor(field.type, recipient.recipientType);

  const ownerOptions = [
    { value: "", label: "No recipient" },
    ...fieldOwners.map((owner) => ({
      value: owner.id,
      label: recipientName(owner),
    })),
  ];

  return (
    <Card className="border-primary p-5 ring-1 ring-primary">
      <CardHeader
        title="Selected field"
        className="mb-4 flex-row items-center justify-between"
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Copy}
              onClick={commands.duplicateSelectedField}
              aria-label="Duplicate field"
              title="Duplicate (⌘/Ctrl+D)"
            />
            <Button
              variant="danger"
              size="sm"
              onClick={commands.deleteSelectedField}
              title="Delete (Del)"
            >
              Remove
            </Button>
          </div>
        }
      />

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Type"
            options={FIELD_TYPE_OPTIONS}
            value={field.type}
            onChange={(event) => {
              const type = event.target.value;
              update({
                type,
                label:
                  field.label === definition.label
                    ? FIELD_TYPES[type].label
                    : field.label,
                ...(FIELD_TYPES[type].hasOptions &&
                  !field.options && { options: ["Option 1", "Option 2"] }),
              });
            }}
          />
          <Input
            label="Label"
            value={field.label}
            placeholder={definition.label}
            onChange={(event) =>
              update({ label: event.target.value }, `label:${field.id}`)
            }
          />
        </div>

        <Select
          label="Assigned to"
          options={ownerOptions}
          value={field.recipientId ?? ""}
          onChange={(event) =>
            update({ recipientId: event.target.value || null })
          }
          hint={
            !recipient
              ? "Choose who fills in this field."
              : isMisassigned
                ? `${definition.label} can’t be given to a ${RECIPIENT_TYPES[recipient.recipientType].label.toLowerCase()}.`
                : undefined
          }
        />

        {definition.hasOptions && (
          <OptionsEditor
            options={field.options ?? []}
            onChange={(options) => update({ options }, `options:${field.id}`)}
          />
        )}

        <SettingRow
          title="Required"
          description="The recipient can’t finish without filling it in."
          className="border-t border-line pt-4"
          control={
            <Toggle
              label="Required"
              checked={field.isRequired}
              onChange={(isRequired) => update({ isRequired })}
            />
          }
        />

        <div className="space-y-3 border-t border-line pt-4">
          <Select
            label="Page"
            options={(document?.pages ?? []).map((page) => ({
              value: page.pageNumber,
              label: `Page ${page.pageNumber} of ${document.pages.length}`,
            }))}
            value={field.pageNumber}
            onChange={(event) =>
              update({ pageNumber: Number(event.target.value) })
            }
            hint={document?.name}
          />
          <p className="font-mono text-[12px] text-ink-muted">
            Position {percent(field.x)}, {percent(field.y)} · size{" "}
            {percent(field.width)} × {percent(field.height)} of page
          </p>
          <p className="text-[12px] text-ink-subtle">
            Arrow keys nudge the field · Shift for larger steps
          </p>
        </div>
      </div>
    </Card>
  );
}
