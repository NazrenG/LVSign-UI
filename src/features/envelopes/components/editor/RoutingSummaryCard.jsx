import { GitBranch } from "lucide-react";
import { VerticalSteps } from "@/components/shared";
import { pluralize } from "@/utils/formatters";
import { ROUTING_MODE } from "../../models/envelopeModel";
import { RECIPIENT_TYPES } from "../../models/recipientTypes";
import { getRoutingSteps } from "../../utils/envelopeSelectors";
import { recipientName } from "./RecipientDot";
import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardHeader,
  Dialog,
  Input,
  Select,
} from "@/components/ui";
const OPERATOR_LABELS = {
  1: "equals",
  2: "does not equal",
  3: "contains",
  4: "does not contain",
  5: "is empty",
  6: "is not empty",
  7: "is greater than",
  8: "is greater than or equal to",
  9: "is less than",
  10: "is less than or equal to",
};

const TEXT_OPERATORS = [
  { value: 1, label: "Equals" },
  { value: 2, label: "Does not equal" },
  { value: 3, label: "Contains" },
  { value: 4, label: "Does not contain" },
  { value: 5, label: "Is empty" },
  { value: 6, label: "Is not empty" },
];

const NUMBER_OPERATORS = [
  { value: 1, label: "Equals" },
  { value: 2, label: "Does not equal" },
  { value: 7, label: "Greater than" },
  {
    value: 8,
    label: "Greater than or equal",
  },
  { value: 9, label: "Less than" },
  {
    value: 10,
    label: "Less than or equal",
  },
];

const CHOICE_OPERATORS = [
  { value: 1, label: "Equals" },
  { value: 2, label: "Does not equal" },
  { value: 5, label: "Is empty" },
  { value: 6, label: "Is not empty" },
];

const VALUELESS_OPERATORS = new Set([5, 6]);

const CONDITION_FIELD_TYPES = new Set([
  "text",
  "fullName",
  "email",
  "number",
  "checkbox",
  "radio",
  "dropdown",
]);

export function RoutingSummaryCard({ envelope, commands }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    targetRecipientId: "",
    sourceFieldId: "",
    operator: 1,
    comparisonValue: "",
  });

  const [state, setState] = useState({
    isSaving: false,
    error: "",
  });

  const comparableFields = envelope.fields.filter(
    (field) => field.recipientId && CONDITION_FIELD_TYPES.has(field.type),
  );

  const targetRecipients = envelope.recipients.filter((target) =>
    comparableFields.some((field) => {
      const sourceRecipient = envelope.recipients.find(
        (recipient) => recipient.id === field.recipientId,
      );

      return (
        sourceRecipient && sourceRecipient.routingOrder < target.routingOrder
      );
    }),
  );

  const selectedTarget = envelope.recipients.find(
    (recipient) => recipient.id === form.targetRecipientId,
  );

  const sourceFields = selectedTarget
    ? comparableFields.filter((field) => {
        const sourceRecipient = envelope.recipients.find(
          (recipient) => recipient.id === field.recipientId,
        );

        return (
          sourceRecipient &&
          sourceRecipient.routingOrder < selectedTarget.routingOrder
        );
      })
    : [];

  const selectedField = envelope.fields.find(
    (field) => field.id === form.sourceFieldId,
  );

  const operatorOptions =
    selectedField?.type === "number"
      ? NUMBER_OPERATORS
      : selectedField?.type === "checkbox" ||
          selectedField?.type === "radio" ||
          selectedField?.type === "dropdown"
        ? CHOICE_OPERATORS
        : TEXT_OPERATORS;

  const openCreate = () => {
    setEditingRuleId(null);
    const target = targetRecipients[0];

    const sources = target
      ? comparableFields.filter((field) => {
          const recipient = envelope.recipients.find(
            (item) => item.id === field.recipientId,
          );

          return recipient && recipient.routingOrder < target.routingOrder;
        })
      : [];

    setForm({
      name: "",
      targetRecipientId: target?.id ?? "",

      sourceFieldId: sources[0]?.id ?? "",

      operator: 1,

      comparisonValue: "",
    });

    setState({
      isSaving: false,
      error: "",
    });

    setIsOpen(true);
  };

  const saveCondition = async () => {
    try {
      setState({
        isSaving: true,
        error: "",
      });

      const values = {
        name: form.name,

        targetRecipientId: form.targetRecipientId,

        sourceFieldId: form.sourceFieldId,

        operator: Number(form.operator),

        comparisonValue: VALUELESS_OPERATORS.has(Number(form.operator))
          ? null
          : form.comparisonValue,
      };
      if (editingRuleId) {
        const current = envelope.routingRules.find(
          (rule) => rule.id === editingRuleId,
        );

        await commands.updateRoutingRule(editingRuleId, {
          name: values.name,

          targetRecipientId: values.targetRecipientId,

          conditions: [
            {
              ...current.conditions[0],

              sourceFieldId: values.sourceFieldId,

              operator: values.operator,

              comparisonValue: values.comparisonValue,
            },
          ],
        });
      } else {
        await commands.createRoutingRule(values);
      }

      setIsOpen(false);
      setEditingRuleId(null);
    } catch (error) {
      setState({
        isSaving: false,

        error: error.message ?? "Condition could not be created.",
      });
    }
  };

  const steps = getRoutingSteps(envelope).map(({ order, recipients }) => ({
    key: String(order),
    title: recipients.map(recipientName).join(", "),
    subtitle:
      envelope.routingMode === ROUTING_MODE.PARALLEL
        ? "Everyone at once"
        : `Step ${order}${recipients.length > 1 ? " · at the same time" : ""}`,
    caption: [
      ...new Set(
        recipients.map(
          (recipient) => RECIPIENT_TYPES[recipient.recipientType].label,
        ),
      ),
    ].join(" · "),
    state: "pending",
  }));

  const getRecipientName = (recipientId) =>
    envelope.recipients.find((recipient) => recipient.id === recipientId)
      ?.displayName ?? "Unknown recipient";

  const getFieldLabel = (fieldId) =>
    envelope.fields.find((field) => field.id === fieldId)?.label ??
    "Unknown field";

  const removeRule = async (ruleId) => {
    try {
      setState({
        isSaving: true,
        error: "",
      });

      await commands.deleteRoutingRule(ruleId);

      setState({
        isSaving: false,
        error: "",
      });
    } catch (error) {
      setState({
        isSaving: false,

        error: error.message ?? "Routing rule could not be deleted.",
      });
    }
  };
  const openEdit = (rule) => {
    const condition = rule.conditions[0];

    setEditingRuleId(rule.id);

    setForm({
      name: rule.name ?? "",

      targetRecipientId: rule.targetRecipientId,

      sourceFieldId: condition.sourceFieldId,

      operator: Number(condition.operator),

      comparisonValue: condition.comparisonValue ?? "",
    });

    setState({
      isSaving: false,
      error: "",
    });

    setIsOpen(true);
  };

  return (
    <>
      <Card className="p-5">
        <CardHeader title="Signing order" className="mb-4" />
        {steps.length ? (
          <VerticalSteps steps={steps} />
        ) : (
          <p className="text-[15px] text-ink-muted">No recipients yet.</p>
        )}

        <div className="mt-4 border-t border-line pt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-[15px] font-medium text-ink">
              <GitBranch
                className="size-4 text-ink-muted"
                strokeWidth={1.5}
                aria-hidden
              />
              Conditions
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 -ml-3"
              disabled={!commands || targetRecipients.length === 0}
              onClick={openCreate}
            >
              Add condition
            </Button>
          </div>
          <p className="mt-1 text-[13px] text-ink-muted">
            Send to different people depending on a field value — for example,
            add Finance when the amount is over 5,000 AZN.
          </p>

          {envelope.routingRules.length > 0 && (
            <div className="mt-4 space-y-3">
              {envelope.routingRules.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-md border border-line p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-ink">
                        {rule.name || "Conditional route"}
                      </p>

                      <p className="mt-0.5 text-[13px] text-ink-muted">
                        Activate{" "}
                        <span className="font-medium text-ink">
                          {getRecipientName(rule.targetRecipientId)}
                        </span>
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={state.isSaving}
                      onClick={() => removeRule(rule.id)}
                    >
                      Delete
                    </Button>
                    {state.error && !isOpen && (
                      <p className="mt-2 text-[13px] text-danger">
                        {state.error}
                      </p>
                    )}
                    {commands && rule.conditions.length === 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(rule)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>

                  <div className="mt-2 space-y-1">
                    {rule.conditions.map((condition) => (
                      <p
                        key={condition.id}
                        className="text-[13px] text-ink-muted"
                      >
                        {getFieldLabel(condition.sourceFieldId)}{" "}
                        {OPERATOR_LABELS[condition.operator]}
                        {!VALUELESS_OPERATORS.has(Number(condition.operator)) &&
                          condition.comparisonValue && (
                            <>
                              {" "}
                              <span className="font-medium text-ink">
                                {condition.comparisonValue}
                              </span>
                            </>
                          )}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TODO(api): enable once EnvelopeRoutingRuleSet endpoints exist. */}
        </div>
      </Card>

      <Dialog
        isOpen={isOpen}
        title={
          editingRuleId ? "Edit routing condition" : "Add routing condition"
        }
        description="Activate a recipient depending on an earlier field value."

        onClose={() => !state.isSaving && setIsOpen(false)}
        footer={
          <>
            {state.error && (
              <p className="mr-auto text-[13px] text-danger">{state.error}</p>
            )}

            <Button
              variant="secondary"
              disabled={state.isSaving}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>

            <Button
              disabled={
                state.isSaving ||
                !form.targetRecipientId ||
                !form.sourceFieldId ||
                (!VALUELESS_OPERATORS.has(Number(form.operator)) &&
                  !form.comparisonValue.trim())
              }
              onClick={saveCondition}
            >
              {state.isSaving
                ? "Saving…"
                : editingRuleId
                  ? "Save changes"
                  : "Create condition"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Rule name (optional)"
            value={form.name}
            placeholder="e.g. High amount approval"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
          />
          <Select
            label="Activate recipient"
            value={form.targetRecipientId}
            options={targetRecipients.map((recipient) => ({
              value: recipient.id,
              label: recipient.displayName,
            }))}
            onChange={(event) => {
              const targetId = event.target.value;

              const target = envelope.recipients.find(
                (recipient) => recipient.id === targetId,
              );

              const fields = comparableFields.filter((field) => {
                const owner = envelope.recipients.find(
                  (recipient) => recipient.id === field.recipientId,
                );

                return (
                  owner && target && owner.routingOrder < target.routingOrder
                );
              });

              setForm((current) => ({
                ...current,
                targetRecipientId: targetId,
                sourceFieldId: fields[0]?.id ?? "",
                operator: 1,
                comparisonValue: "",
              }));
            }}
          />
          <Select
            label="When field"
            value={form.sourceFieldId}
            options={sourceFields.map((field) => {
              const owner = envelope.recipients.find(
                (recipient) => recipient.id === field.recipientId,
              );

              return {
                value: field.id,

                label: `${field.label} · ${owner?.displayName ?? "Unknown"}`,
              };
            })}
            onChange={(event) =>
              setForm((current) => ({
                ...current,

                sourceFieldId: event.target.value,

                operator: 1,

                comparisonValue: "",
              }))
            }
          />
          <Select
            label="Condition"
            value={form.operator}
            options={operatorOptions}
            onChange={(event) =>
              setForm((current) => ({
                ...current,

                operator: Number(event.target.value),

                comparisonValue: "",
              }))
            }
          />
          {!VALUELESS_OPERATORS.has(Number(form.operator)) &&
            (selectedField?.type === "dropdown" ||
            selectedField?.type === "radio" ? (
              <Select
                label="Value"
                value={form.comparisonValue}
                options={[
                  {
                    value: "",
                    label: "Select value",
                  },

                  ...(selectedField.options ?? []).map((option) => ({
                    value: option,
                    label: option,
                  })),
                ]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,

                    comparisonValue: event.target.value,
                  }))
                }
              />
            ) : selectedField?.type === "checkbox" ? (
              <Select
                label="Value"
                value={form.comparisonValue}
                options={[
                  {
                    value: "",
                    label: "Select value",
                  },
                  {
                    value: "true",
                    label: "Checked",
                  },
                  {
                    value: "false",
                    label: "Not checked",
                  },
                ]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,

                    comparisonValue: event.target.value,
                  }))
                }
              />
            ) : (
              <Input
                label="Value"
                type={selectedField?.type === "number" ? "number" : "text"}
                value={form.comparisonValue}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,

                    comparisonValue: event.target.value,
                  }))
                }
              />
            ))}
        </div>
      </Dialog>
    </>
  );
}
