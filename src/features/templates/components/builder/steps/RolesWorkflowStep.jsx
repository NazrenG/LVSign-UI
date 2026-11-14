import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { StepMarker } from "@/components/shared";
import { Button } from "@/components/ui";

import { templateRepository } from "@/features/templates";

import { BuilderStepLayout } from "../BuilderStepLayout";
import { RoleCard } from "../roles/RoleCard";
import { RoutePreviewCard } from "../roles/RoutePreviewCard";
import { WorkflowRulesCard } from "../roles/WorkflowRulesCard";
import { RoutingRuleSetsCard } from "../roles/RoutingRuleSetsCard";

export function RolesWorkflowStep({ template, actions }) {
  const [addingRole, setAddingRole] = useState(false);

  const handleAddRole = async () => {
    try {
      setAddingRole(true);

      const maxOrder =
        template.roles.length === 0
          ? 0
          : Math.max(...template.roles.map((role) => role.routingOrder));

      const created = await templateRepository.createRecipientRole(
        template.id,
        {
          name: "New recipient",

          recipientType: 1,

          routingOrder: maxOrder + 1,

          isRequired: true,

          defaultUserId: null,

          allowSenderEditRecipient: true,

          allowSenderDeleteRecipient: true,

          allowSenderChangeRoutingOrder: true,
        },
      );

      actions.addExistingRole(created);

      toast.success("Recipient role added.");
    } catch (error) {
      toast.error(error.message || "Recipient role could not be added.");
    } finally {
      setAddingRole(false);
    }
  };

  const handleRoleUpdate = async (role, patch) => {
    const updated = {
      ...role,
      ...patch,
    };

    try {
      const saved = await templateRepository.updateRecipientRole(
        template.id,
        role.id,
        updated,
      );

      actions.updateRole(role.id, saved);
    } catch (error) {
      toast.error(error.message || "Recipient role could not be updated.");
    }
  };

  const handleRoleDelete = async (roleId) => {
    try {
      await templateRepository.deleteRecipientRole(template.id, roleId);

      actions.removeRole(roleId);

      toast.success("Recipient role removed.");
    } catch (error) {
      toast.error(error.message || "Recipient role could not be removed.");
    }
  };

  const handleMoveRole = async (roleId, offset) => {
    const currentIndex = template.roles.findIndex((role) => role.id === roleId);

    const targetIndex = currentIndex + offset;

    if (targetIndex < 0 || targetIndex >= template.roles.length) {
      return;
    }

    const reordered = [...template.roles];

    [reordered[currentIndex], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[currentIndex],
    ];

    try {
      await templateRepository.reorderRecipientRoles(
        template.id,
        reordered.map((role) => role.id),
      );

      actions.setRoles(
        reordered.map((role, index) => ({
          ...role,
          routingOrder: index + 1,
        })),
      );
    } catch (error) {
      toast.error(error.message || "Recipient order could not be updated.");
    }
  };

  return (
    <BuilderStepLayout
      title="Roles & workflow"
      description="Define the recipient roles and the order in which they receive the document."
      aside={<RoutePreviewCard template={template} />}
    >
      {template.roles.length === 0 ? (
        <div className="rounded-md border border-dashed border-line-strong px-6 py-10 text-center">
          <p className="text-[15px] text-ink-muted">
            No recipient roles have been added yet.
          </p>

          <Button
            variant="ghost"
            icon={Plus}
            onClick={handleAddRole}
            disabled={addingRole}
            className="mt-3"
          >
            {addingRole ? "Adding..." : "Add recipient role"}
          </Button>
        </div>
      ) : (
        <>
          <ol className="space-y-3">
            {template.roles.map((roleStep, index) => (
              <li key={roleStep.id} className="relative flex gap-4">
                <div
                  className="hidden w-4 shrink-0 flex-col items-center pt-6 sm:flex"
                  aria-hidden
                >
                  <StepMarker className="size-5" />

                  {index < template.roles.length - 1 && (
                    <span className="-mb-3 mt-1 w-0.5 flex-1 bg-line" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <RoleCard
                    roleStep={roleStep}
                    index={index}
                    total={template.roles.length}
                    onChange={(patch) => handleRoleUpdate(roleStep, patch)}
                    onDelete={() => handleRoleDelete(roleStep.id)}
                    onMoveUp={() => handleMoveRole(roleStep.id, -1)}
                    onMoveDown={() => handleMoveRole(roleStep.id, 1)}
                  />
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-4 flex flex-wrap gap-2 sm:pl-8">
            <Button
              variant="ghost"
              icon={Plus}
              onClick={handleAddRole}
              disabled={addingRole}
            >
              {addingRole ? "Adding..." : "Add recipient role"}
            </Button>
          </div>
        </>
      )}
      <WorkflowRulesCard rules={template.rules} actions={actions} />

      <RoutingRuleSetsCard
        templateId={template.id}
        isDraft={template.status === "draft"}
      />
    </BuilderStepLayout>
  );
}
