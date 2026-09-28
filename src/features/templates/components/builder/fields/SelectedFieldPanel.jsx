import { Database, GripVertical, Plus, X } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  Input,
  Select,
  SettingRow,
  Toggle,
} from "@/components/ui";
import { FIELD_TYPES, FILLER } from "../../../templateConstants";
import { getRole, isSigningField } from "../../../templateSelectors";

const TYPE_OPTIONS = Object.entries(FIELD_TYPES).map(([value, { label }]) => ({
  value,
  label,
}));

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
              aria-label={`Remove ${option}`}
              disabled={options.length === 1}
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
        className="-ml-3 mt-1"
        onClick={() => onChange([...options, `Option ${options.length + 1}`])}
      >
        Add option
      </Button>
    </div>
  );
}

export function SelectedFieldPanel({ field, template, actions }) {
  if (!field) {
    return (
      <Card className="p-5 text-[15px] text-ink-muted">
        Select a field on the page to edit it.
      </Card>
    );
  }

  const update = (patch) => actions.updateField(field.id, patch);
  const isSigning = isSigningField(field);

  const fillerOptions = [
    ...(isSigning
      ? []
      : [
          { value: FILLER.SENDER, label: "Sender (before sending)" },
          { value: FILLER.HR_SYSTEM, label: "HR system" },
          { value: FILLER.CALCULATED, label: "Calculated" },
        ]),
    ...template.roles.map((roleStep) => ({
      value: roleStep.id,
      label: getRole(roleStep).name,
    })),
  ];

  return (
    <Card className="border-primary p-5 ring-1 ring-primary">
      <CardHeader
        title="Selected field"
        className="mb-4 flex-row items-center justify-between"
        action={
          <Button
            variant="danger"
            size="sm"
            onClick={() => actions.removeField(field.id)}
          >
            Remove
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Label"
            value={field.label}
            onChange={(event) => update({ label: event.target.value })}
          />
          <Select
            label="Type"
            options={TYPE_OPTIONS}
            value={field.type}
            onChange={(event) => {
              const type = event.target.value;
              update({
                type,
                ...(type === "dropdown" &&
                  !field.options && { options: ["Option 1"] }),
              });
            }}
          />
        </div>
        <Select
          label="Filled by"
          options={fillerOptions}
          value={field.filledBy}
          onChange={(event) => update({ filledBy: event.target.value })}
        />
        <Input
          label="Data key"
          icon={Database}
          value={field.dataKey}
          placeholder="e.g. leave.type"
          onChange={(event) => update({ dataKey: event.target.value.trim() })}
          className="font-mono text-sm"
          hint={
            field.apiField
              ? `Maps to ${field.apiField} in the .NET API.`
              : "Key used when the document data is sent to the API."
          }
        />

        {field.type === "dropdown" && (
          <OptionsEditor
            options={field.options ?? []}
            onChange={(options) => update({ options })}
          />
        )}

        <SettingRow
          title="Required"
          className="border-t border-line pt-4"
          control={
            <Toggle
              label="Required"
              checked={field.required}
              onChange={(required) => update({ required })}
            />
          }
        />
        {!isSigning && (
          <SettingRow
            title="Pre-fill from HR system"
            description="Use the employee’s record instead of asking the sender."
            control={
              <Toggle
                label="Pre-fill from HR system"
                checked={field.filledBy === FILLER.HR_SYSTEM}
                onChange={(prefill) =>
                  update({
                    filledBy: prefill ? FILLER.HR_SYSTEM : FILLER.SENDER,
                  })
                }
              />
            }
          />
        )}
      </div>
    </Card>
  );
}
