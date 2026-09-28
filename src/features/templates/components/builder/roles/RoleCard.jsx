import { GripVertical } from "lucide-react";
import { Card, Menu, Select } from "@/components/ui";
import { SIGNER_ROLES } from "@/data/templateRoles";
import { pluralize } from "@/utils/formatters";
import { ROLE_ACTIONS } from "../../../templateConstants";
import { getRole, getStepLabel } from "../../../templateSelectors";

/** Every resolver in the role library, plus the current one if it is custom. */
const resolverOptions = (current) => {
  const known = Object.values(SIGNER_ROLES).map((role) => role.resolver);
  return known.includes(current) ? known : [current, ...known];
};

function Detail({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-[15px]">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}

export function RoleCard({ roleStep, index, total, isParallel, actions }) {
  const role = getRole(roleStep);
  const stepLabel = isParallel ? "Signer" : getStepLabel(index, total);

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-2">
          <GripVertical
            className="mt-3 size-4 shrink-0 text-ink-subtle"
            aria-hidden
          />
          <div>
            <p className="text-[13px] text-ink-muted">
              Step {index + 1} · {stepLabel}
            </p>
            <h3 className="text-base font-semibold text-ink">{role.name}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            aria-label={`What ${role.name} does`}
            options={ROLE_ACTIONS}
            value={roleStep.action}
            onChange={(event) =>
              actions.updateRole(roleStep.id, { action: event.target.value })
            }
            wrapperClassName="flex-1 sm:w-56"
          />
          <Menu
            label={`${role.name} actions`}
            items={[
              {
                label: "Move up",
                onSelect: () => actions.moveRole(roleStep.id, -1),
                disabled: index === 0,
              },
              {
                label: "Move down",
                onSelect: () => actions.moveRole(roleStep.id, 1),
                disabled: index === total - 1,
              },
              {
                label: "Remove role",
                onSelect: () => actions.removeRole(roleStep.id),
                disabled: total === 1,
                tone: "danger",
              },
            ]}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-5">
        <Select
          label="Who fills this role"
          options={resolverOptions(roleStep.resolver)}
          value={roleStep.resolver}
          onChange={(event) =>
            actions.updateRole(roleStep.id, { resolver: event.target.value })
          }
        />
        <dl className="space-y-2 sm:pt-7">
          <Detail label="Can delegate" value={roleStep.delegate} />
          <Detail
            label="Time to act"
            value={pluralize(roleStep.timeToActDays, "working day")}
          />
        </dl>
      </div>
    </Card>
  );
}
