import { useEffect, useState } from "react";
import { GitBranch, X } from "lucide-react";

import { Button, Card, Input, Select } from "@/components/ui";
import { templateRepository } from "../../../api/templateRepository";

const ACTIONS = [
  { value: "1", label: "Signer" },
  { value: "2", label: "Approver" },
  { value: "3", label: "CC" },
  { value: "4", label: "Skip" },
];

const OPERATORS = [
  { value: "1", label: "Equals" },
  { value: "2", label: "Not equals" },
  { value: "3", label: "Contains" },
  { value: "4", label: "Does not contain" },
  { value: "5", label: "Is empty" },
  { value: "6", label: "Is not empty" },
  { value: "7", label: "Greater than" },
  { value: "8", label: "Greater than or equal" },
  { value: "9", label: "Less than" },
  { value: "10", label: "Less than or equal" },
];

const INVERSE_OPERATORS = {
  1: 2,
  2: 1,
  3: 4,
  4: 3,
  5: 6,
  6: 5,
  7: 10,
  8: 9,
  9: 8,
  10: 7,
};

const NUMBER_OPERATORS = ["1", "2", "5", "6", "7", "8", "9", "10"];

const TEXT_OPERATORS = ["1", "2", "3", "4", "5", "6"];

const NO_VALUE_OPERATORS = ["5", "6"];

function RecipientActions({ title, roles, values, onChange, disabled }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>

      {roles.map((role) => (
        <div
          key={role.id}
          className="grid grid-cols-[minmax(0,1fr)_150px] items-center gap-3"
        >
          <span className="truncate text-sm text-ink">
            {role.name || "Unnamed recipient"}
          </span>

          <Select
            aria-label={`${title}: ${role.name}`}
            options={ACTIONS}
            value={values[role.id] ?? "4"}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                ...values,
                [role.id]: event.target.value,
              })
            }
          />
        </div>
      ))}
    </section>
  );
}

export function ConditionalRoutingEditor({
  field,
  roles = [],
  templateId,
  onClose,
}) {
  const [operator, setOperator] = useState("7");
  const [comparisonValue, setComparisonValue] = useState("");

  const [thenActions, setThenActions] = useState({});
  const [elseActions, setElseActions] = useState({});

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [loadingRouting, setLoadingRouting] = useState(true);
  const [existingRouting, setExistingRouting] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [routingLoadFailed, setRoutingLoadFailed] = useState(false);

  const isNumber = field?.type === "number";

  useEffect(() => {
    setOperator(field?.type === "number" ? "7" : "1");
    setComparisonValue("");

    setThenActions({});
    setElseActions({});

    setSaveError("");
    setSaveSuccess(false);
  }, [field?.id, field?.type]);

  if (!field) return null;

  const availableOperators = OPERATORS.filter((option) =>
    (isNumber ? NUMBER_OPERATORS : TEXT_OPERATORS).includes(option.value),
  );

  const needsValue = !NO_VALUE_OPERATORS.includes(operator);

  const ruleSetName = `Field routing: ${field.id}`;

  async function handleSaveRouting() {
    if (saving || deleting || loadingRouting || routingLoadFailed) {
      return;
    }

    setSaveError("");
    setSaveSuccess(false);

    if (!templateId || !field.id || roles.length === 0) {
      setSaveError("Template, document field and recipients are required.");
      return;
    }

    const ifOperator = Number(operator);
    const elseOperator = INVERSE_OPERATORS[ifOperator];

    if (!elseOperator) {
      setSaveError("Unsupported routing condition.");
      return;
    }

    if (needsValue && !comparisonValue.trim()) {
      setSaveError("Enter a comparison value.");
      return;
    }

    if (isNumber && needsValue && !Number.isFinite(Number(comparisonValue))) {
      setSaveError("Enter a valid numeric value.");
      return;
    }

    const allActionTypes = [
      ...roles.map((role) => Number(thenActions[role.id] ?? 4)),
      ...roles.map((role) => Number(elseActions[role.id] ?? 4)),
    ];

    if (allActionTypes.some((value) => ![1, 2, 3, 4].includes(value))) {
      setSaveError("Invalid recipient action selected.");
      return;
    }

    setSaving(true);

    try {
      if (existingRouting) {
        const {
          ruleSet,
          thenRule,
          elseRule,
          thenCondition,
          elseCondition,
          thenList,
          elseList,
        } = existingRouting;

        const branches = [
          {
            rule: thenRule,
            condition: thenCondition,
            actions: thenList,
            operator: ifOperator,
            values: thenActions,
          },
          {
            rule: elseRule,
            condition: elseCondition,
            actions: elseList,
            operator: elseOperator,
            values: elseActions,
          },
        ];

        // Confirm the saved structure still exists before updating.
        const currentRuleSets =
          await templateRepository.getRoutingRuleSets(templateId);

        if (!currentRuleSets.some((item) => item.id === ruleSet.id)) {
          throw new Error(
            "The routing configuration no longer exists. Reopen the editor.",
          );
        }

        for (const branch of branches) {
          await templateRepository.updateRoutingCondition(
            templateId,
            ruleSet.id,
            branch.rule.id,
            branch.condition.id,
            {
              sourceTemplateFieldId: field.id,
              operator: branch.operator,
              comparisonValue: [5, 6].includes(branch.operator)
                ? null
                : comparisonValue.trim(),
            },
          );

          for (const action of branch.actions) {
            await templateRepository.updateRoutingAction(
              templateId,
              ruleSet.id,
              branch.rule.id,
              action.id,
              {
                recipientRoleId: action.recipientRoleId,
                actionType: Number(branch.values[action.recipientRoleId] ?? 4),
                order: action.order,
              },
            );
          }
        }

        onClose?.();
        return;
      }

      const existingRuleSets =
        await templateRepository.getRoutingRuleSets(templateId);

      if (existingRuleSets.some((ruleSet) => ruleSet.name === ruleSetName)) {
        throw new Error(
          "Routing already exists for this field. Editing will be available in the next step.",
        );
      }

      // 1. Create rule set.
      const ruleSet = await templateRepository.createRoutingRuleSet(
        templateId,
        {
          name: ruleSetName,
          isActive: true,
        },
      );

      // 2. Define IF and ELSE branches.
      const branches = [
        {
          name: "THEN",
          operator: ifOperator,
          priority: 1,
          actions: thenActions,
        },
        {
          name: "ELSE",
          operator: elseOperator,
          priority: 2,
          actions: elseActions,
        },
      ];

      // 3. Create rules, conditions and actions.
      for (const branch of branches) {
        const rule = await templateRepository.createRoutingRule(
          templateId,
          ruleSet.id,
          {
            targetRecipientRoleId: roles[0].id,
            name: `${field.label || field.type} - ${branch.name}`,
            matchType: 1,
            priority: branch.priority,
            isActive: true,
          },
        );

        await templateRepository.createRoutingCondition(
          templateId,
          ruleSet.id,
          rule.id,
          {
            sourceTemplateFieldId: field.id,
            operator: branch.operator,
            comparisonValue: NO_VALUE_OPERATORS.includes(
              String(branch.operator),
            )
              ? null
              : comparisonValue.trim(),
          },
        );

        for (let index = 0; index < roles.length; index++) {
          const role = roles[index];

          await templateRepository.createRoutingAction(
            templateId,
            ruleSet.id,
            rule.id,
            {
              recipientRoleId: role.id,
              actionType: Number(branch.actions[role.id] ?? 4),
              order: index + 1,
            },
          );
        }
      }

      setSaveSuccess(true);
      onClose?.();
    } catch (error) {
      setSaveError(error?.message || "Could not save conditional routing.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRouting() {
    if (!existingRouting || saving || deleting || loadingRouting) {
      return;
    }

    const confirmed = window.confirm(
      "Delete conditional routing for this field? This action cannot be undone.",
    );

    if (!confirmed) return;

    setDeleting(true);
    setSaveError("");

    try {
      await templateRepository.deleteRoutingRuleSet(
        templateId,
        existingRouting.ruleSet.id,
      );

      setExistingRouting(null);
      onClose?.();
    } catch (error) {
      setSaveError(error?.message || "Could not delete conditional routing.");
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    if (!templateId || !field?.id) return;

    let cancelled = false;
    setRoutingLoadFailed(false);
    async function loadRouting() {
      setLoadingRouting(true);
      setSaveError("");
      setExistingRouting(null);

      try {
        const ruleSets =
          await templateRepository.getRoutingRuleSets(templateId);

        const ruleSet = ruleSets.find(
          (item) => item.name === `Field routing: ${field.id}`,
        );

        if (!ruleSet) {
          if (!cancelled) setExistingRouting(null);
          return;
        }

        const rules = await templateRepository.getRoutingRules(
          templateId,
          ruleSet.id,
        );

        const thenRule = rules.find((rule) => rule.priority === 1);
        const elseRule = rules.find((rule) => rule.priority === 2);

        if (!thenRule || !elseRule || rules.length !== 2) {
          throw new Error(
            "Existing routing has an unsupported rule structure.",
          );
        }

        const [thenConditions, elseConditions, thenList, elseList] =
          await Promise.all([
            templateRepository.getRoutingConditions(
              templateId,
              ruleSet.id,
              thenRule.id,
            ),
            templateRepository.getRoutingConditions(
              templateId,
              ruleSet.id,
              elseRule.id,
            ),
            templateRepository.getRoutingActions(
              templateId,
              ruleSet.id,
              thenRule.id,
            ),
            templateRepository.getRoutingActions(
              templateId,
              ruleSet.id,
              elseRule.id,
            ),
          ]);

        if (
          thenConditions.length !== 1 ||
          elseConditions.length !== 1 ||
          thenConditions[0].sourceTemplateFieldId !== field.id ||
          elseConditions[0].sourceTemplateFieldId !== field.id
        ) {
          throw new Error(
            "Existing routing conditions cannot be edited with this editor.",
          );
        }

        const condition = thenConditions[0];

        if (
          INVERSE_OPERATORS[condition.operator] !== elseConditions[0].operator
        ) {
          throw new Error("Existing ELSE condition is not the inverse of IF.");
        }

        if (
          !["5", "6"].includes(String(condition.operator)) &&
          condition.comparisonValue !== elseConditions[0].comparisonValue
        ) {
          throw new Error("IF and ELSE use different comparison values.");
        }

        const mapActions = (items) =>
          Object.fromEntries(
            items.map((item) => [
              item.recipientRoleId,
              String(item.actionType),
            ]),
          );

        const expectedRoleIds = new Set(roles.map((role) => role.id));

        for (const items of [thenList, elseList]) {
          if (
            items.length !== expectedRoleIds.size ||
            items.some((item) => !expectedRoleIds.has(item.recipientRoleId)) ||
            new Set(items.map((item) => item.recipientRoleId)).size !==
              expectedRoleIds.size
          ) {
            throw new Error(
              "Recipient roles have changed. Routing needs review.",
            );
          }
        }

        if (cancelled) return;

        setOperator(String(condition.operator));
        setComparisonValue(condition.comparisonValue ?? "");
        setThenActions(mapActions(thenList));
        setElseActions(mapActions(elseList));

        setExistingRouting({
          ruleSet,
          thenRule,
          elseRule,
          thenCondition: thenConditions[0],
          elseCondition: elseConditions[0],
          thenList,
          elseList,
        });
      } catch (error) {
        if (!cancelled) {
          setRoutingLoadFailed(true);
          setSaveError(error.message || "Could not load routing.");
        }
      } finally {
        if (!cancelled) setLoadingRouting(false);
      }
    }

    loadRouting();

    return () => {
      cancelled = true;
    };
  }, [templateId, field?.id]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Configure conditional routing"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <GitBranch className="size-5 text-primary" aria-hidden />

            <div>
              <h2 className="text-lg font-semibold text-ink">
                Conditional routing
              </h2>
              <p className="text-sm text-ink-muted">
                Route recipients based on a document field.
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close routing editor"
            disabled={saving}
            onClick={onClose}
            className="rounded-sm p-2 text-ink-muted hover:bg-surface-secondary disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* IF */}
          <section className="space-y-3 rounded-sm border border-line p-4">
            <h3 className="text-sm font-semibold text-ink">IF — Condition</h3>

            <Input
              label="Document field"
              value={field.label || field.type}
              readOnly
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select
                label="Condition"
                options={availableOperators}
                value={operator}
                disabled={saving}
                onChange={(event) => {
                  setOperator(event.target.value);
                  setSaveError("");
                }}
              />

              {needsValue && (
                <Input
                  label="Value"
                  type={isNumber ? "number" : "text"}
                  value={comparisonValue}
                  disabled={saving}
                  onChange={(event) => {
                    setComparisonValue(event.target.value);
                    setSaveError("");
                  }}
                  placeholder={isNumber ? "e.g. 1000" : "Enter value"}
                />
              )}
            </div>
          </section>

          {/* THEN */}
          <div className="rounded-sm border border-line p-4">
            <RecipientActions
              title="THEN — When condition matches"
              roles={roles}
              values={thenActions}
              onChange={setThenActions}
              disabled={saving}
            />
          </div>

          {/* ELSE */}
          <div className="rounded-sm border border-line p-4">
            <RecipientActions
              title="ELSE — Otherwise"
              roles={roles}
              values={elseActions}
              onChange={setElseActions}
              disabled={saving}
            />
          </div>

          {roles.length === 0 && (
            <p className="text-sm text-danger">
              Add recipient roles before configuring routing.
            </p>
          )}

          {saveError && (
            <p
              role="alert"
              className="rounded-sm border border-danger/30 bg-danger/5 p-3 text-sm text-danger"
            >
              {saveError}
            </p>
          )}

          {saveSuccess && (
            <p className="text-sm text-success">
              Conditional routing saved successfully.
            </p>
          )}

          {/* Footer */}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <div>
              {existingRouting && (
                <Button
                  variant="danger"
                  disabled={saving || deleting || loadingRouting}
                  onClick={handleDeleteRouting}
                >
                  {deleting ? "Deleting..." : "Delete routing"}
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                disabled={saving || deleting}
                onClick={onClose}
              >
                Cancel
              </Button>

              <Button
                disabled={
                  saving ||
                  deleting ||
                  loadingRouting ||
                  routingLoadFailed ||
                  Boolean(saveError) ||
                  roles.length === 0
                }
                onClick={handleSaveRouting}
              >
                {saving
                  ? "Saving..."
                  : loadingRouting
                    ? "Loading..."
                    : existingRouting
                      ? "Update routing"
                      : "Save routing"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
