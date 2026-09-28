import { Mail, Plus } from "lucide-react";
import { StepMarker } from "@/components/shared";
import { Button, NoteCard, SegmentedControl } from "@/components/ui";
import { COPY_RECIPIENTS, SIGNING_ORDER } from "../../../templateConstants";
import { BuilderStepLayout } from "../BuilderStepLayout";
import { RoleCard } from "../roles/RoleCard";
import { RoutePreviewCard } from "../roles/RoutePreviewCard";
import { WorkflowRulesCard } from "../roles/WorkflowRulesCard";

const HOW_ROLES_RESOLVE = [
  "Department head comes from the employee’s record in the HR system.",
  "Group roles go to whoever in the group opens it first.",
  "If a role cannot be resolved, the sender picks a person before sending.",
];

export function RolesWorkflowStep({ template, actions }) {
  const isParallel = template.signingOrder === "parallel";
  const nextRecipient = COPY_RECIPIENTS.find(
    (recipient) => !template.copyRecipients.includes(recipient),
  );

  return (
    <BuilderStepLayout
      title="Roles & workflow"
      description="Define signer roles, not people. LV Sign resolves each role from the directory when a document is sent."
      headerAction={
        <SegmentedControl
          label="Signing order"
          options={SIGNING_ORDER}
          value={template.signingOrder}
          onChange={(signingOrder) => actions.update({ signingOrder })}
          className="sm:w-64"
        />
      }
      aside={
        <>
          <RoutePreviewCard template={template} />
          <NoteCard title="How roles resolve" items={HOW_ROLES_RESOLVE} />
        </>
      }
    >
      <ol className="space-y-3">
        {template.roles.map((roleStep, index) => (
          <li key={roleStep.id} className="relative flex gap-4">
            {/* Order rail (desktop only) */}
            <div
              className="hidden w-4 shrink-0 flex-col items-center pt-6 sm:flex"
              aria-hidden
            >
              <StepMarker className="size-5" />
              {!isParallel && index < template.roles.length - 1 && (
                <span className="-mb-3 mt-1 w-0.5 flex-1 bg-line" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <RoleCard
                roleStep={roleStep}
                index={index}
                total={template.roles.length}
                isParallel={isParallel}
                actions={actions}
              />
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-2 sm:pl-8">
        <Button variant="ghost" icon={Plus} onClick={actions.addRole}>
          Add signer role
        </Button>
        <Button
          variant="ghost"
          icon={Mail}
          disabled={!nextRecipient}
          onClick={() =>
            actions.update({
              copyRecipients: [...template.copyRecipients, nextRecipient],
            })
          }
        >
          Add copy recipient
        </Button>
      </div>

      <WorkflowRulesCard rules={template.rules} actions={actions} />
    </BuilderStepLayout>
  );
}
