import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { CURRENT_USER } from "@/data/people";
import {
  BUILDER_STEPS,
  BasicInfoStep,
  BuilderHeader,
  ExpiryRemindersStep,
  FieldsStep,
  RolesWorkflowStep,
  getPublishChecks,
  useTemplateDraft,
} from "@/features/templates";
import { templatesService } from "@/services/templatesService";

const STEP_COMPONENTS = {
  basic: BasicInfoStep,
  roles: RolesWorkflowStep,
  fields: FieldsStep,
  expiry: ExpiryRemindersStep,
};

/**
 * Full-screen, 4-step template builder.
 * The current step lives in the URL (?step=roles), so refresh/back keep it.
 */
export function TemplateBuilderPage() {
  const { templateId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [initialTemplate] = useState(() =>
    templatesService.createDraft({
      id: templateId,
      duplicateOf: searchParams.get("duplicate"),
    }),
  );
  const { template, isDirty, savedAt, actions } =
    useTemplateDraft(initialTemplate);

  const stepId = STEP_COMPONENTS[searchParams.get("step")]
    ? searchParams.get("step")
    : "basic";
  const stepIndex = BUILDER_STEPS.findIndex((step) => step.id === stepId);
  const isLastStep = stepIndex === BUILDER_STEPS.length - 1;
  const checks = getPublishChecks(template);

  const goToStep = (id) => {
    const next = new URLSearchParams(searchParams);
    next.set("step", id);
    setSearchParams(next);
    window.scrollTo({ top: 0 });
  };

  const handlePublish = () => {
    const saved = templatesService.publish(template, CURRENT_USER.id);
    navigate(ROUTES.templateDetail(saved.id));
  };

  const StepComponent = STEP_COMPONENTS[stepId];
  const backTo =
    template.id === "new"
      ? ROUTES.templates
      : ROUTES.templateDetail(template.id);

  return (
    <div className="min-h-screen">
      <BuilderHeader
        template={template}
        savedAt={savedAt}
        isDirty={isDirty}
        currentStep={stepId}
        isLastStep={isLastStep}
        canPublish={checks.every((check) => check.isValid)}
        backTo={backTo}
        onStepChange={goToStep}
        onSave={actions.markSaved}
        onContinue={() => goToStep(BUILDER_STEPS[stepIndex + 1].id)}
        onPublish={handlePublish}
      />
      <main>
        <StepComponent
          template={template}
          actions={actions}
          checks={checks}
          onStepChange={goToStep}
        />
      </main>
    </div>
  );
}
