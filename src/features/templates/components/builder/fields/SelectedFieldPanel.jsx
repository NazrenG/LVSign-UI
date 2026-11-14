import { useEffect, useState } from "react";
import { GripVertical, Plus, X, GitBranch } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  Input,
  Select,
  SettingRow,
  Toggle,
} from "@/components/ui";

import { FIELD_TYPES } from "../../../templateConstants";

const TYPE_OPTIONS = Object.entries(FIELD_TYPES).map(([value, { label }]) => ({
  value,
  label,
}));

const SENDER_ID = "sender";

function getFilledBy(field) {
  if (field.ownerType === "recipient") {
    return field.recipientRoleId ?? "";
  }

  return SENDER_ID;
}

function OptionsEditor({ options, onCommit }) {
  const [localOptions, setLocalOptions] = useState(
    options?.length ? options : ["Option 1"],
  );

  useEffect(() => {
    setLocalOptions(options?.length ? options : ["Option 1"]);
  }, [options]);

  const updateOption = (index, value) => {
    setLocalOptions((current) =>
      current.map((option, i) => (i === index ? value : option)),
    );
  };

  const removeOption = async (index) => {
    const next = localOptions.filter((_, i) => i !== index);

    setLocalOptions(next);

    await onCommit(next);
  };

  const addOption = async () => {
    const next = [...localOptions, `Option ${localOptions.length + 1}`];

    setLocalOptions(next);

    await onCommit(next);
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">Options</p>

      <ul className="divide-y divide-line rounded-sm border border-line-strong">
        {localOptions.map((option, index) => (
          <li key={index} className="flex items-center gap-2 pr-1 pl-2.5">
            <GripVertical
              className="size-3.5 shrink-0 text-ink-subtle"
              aria-hidden
            />

            <input
              value={option}
              aria-label={`Option ${index + 1}`}
              onChange={(event) => updateOption(index, event.target.value)}
              onBlur={() => onCommit(localOptions)}
              className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-ink focus:outline-none"
            />

            <button
              type="button"
              aria-label={`Remove ${option}`}
              disabled={localOptions.length === 1}
              onClick={() => removeOption(index)}
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
        onClick={addOption}
      >
        Add option
      </Button>
    </div>
  );
}

export function SelectedFieldPanel({
  field,
  template,
  onUpdate,
  onDelete,
  onConfigureRouting,
}) {
  const [labelDraft, setLabelDraft] = useState(field?.label ?? "");

  useEffect(() => {
    setLabelDraft(field?.label ?? "");
  }, [field?.id, field?.label]);

  if (!field) {
    return (
      <Card className="p-5 text-[15px] text-ink-muted">
        Select a field on the page to edit it.
      </Card>
    );
  }

  const filledBy = getFilledBy(field);

  const fillerOptions = [
    {
      value: SENDER_ID,
      label: "Sender",
    },

    ...template.roles.map((role) => ({
      value: role.id,

      label: role.name || "Unnamed recipient",
    })),
  ];

  const update = async (patch) => {
    await onUpdate(field.id, patch);
  };

  const handleFilledByChange = async (value) => {
    if (value === SENDER_ID) {
      await update({
        ownerType: "sender",

        recipientRoleId: null,
      });

      return;
    }

    await update({
      ownerType: "recipient",

      recipientRoleId: value,
    });
  };

  const handleTypeChange = async (type) => {
    const patch = {
      type,
    };

    if (type === "dropdown" && !field.options?.length) {
      patch.options = ["Option 1"];
    }

    /*
     * Dropdown-dan başqa
     * type seçilirsə options
     * artıq lazım deyil.
     */
    if (type !== "dropdown") {
      patch.options = null;
    }

    await update(patch);
  };

  return (
    <Card className="border-primary p-5 ring-1 ring-primary">
      <CardHeader
        title="Selected field"
        className="mb-4 flex-row items-center justify-between"
        action={
          <Button variant="danger" size="sm" onClick={() => onDelete(field.id)}>
            Remove
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Label"
            value={labelDraft}
            onChange={(event) => setLabelDraft(event.target.value)}
            onBlur={() => {
              if (labelDraft !== field.label) {
                update({
                  label: labelDraft,
                });
              }
            }}
          />

          <Select
            label="Type"
            options={TYPE_OPTIONS}
            value={field.type}
            onChange={(event) => handleTypeChange(event.target.value)}
          />
        </div>

        <Select
          label="Filled by"
          options={fillerOptions}
          value={filledBy}
          onChange={(event) => handleFilledByChange(event.target.value)}
        />

        {field.type === "dropdown" && (
          <OptionsEditor
            options={field.options}
            onCommit={(options) =>
              update({
                options,
              })
            }
          />
        )}

        <SettingRow
          title="Required"
          description="The recipient must complete this field before finishing."
          className="border-t border-line pt-4"
          control={
            <Toggle
              label="Required"
              checked={field.required}
              onChange={(required) =>
                update({
                  required,
                })
              }
            />
          }
        />

        {/* CONDITIONAL ROUTING */}
        <div className="mt-5 border-t border-line pt-4">
          <div className="mb-2 flex items-center gap-2">
            <GitBranch className="size-4 text-primary" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-ink">
              Conditional routing
            </h3>
          </div>

          <p className="mb-3 text-[13px] text-ink-muted">
            Use this field's value to determine who signs, approves, or receives
            a copy of the document.
          </p>

          <Button
            variant="secondary"
            icon={GitBranch}
            onClick={() => onConfigureRouting?.(field.id)}
          >
            Configure routing
          </Button>
        </div>
      </div>
    </Card>
  );
}
