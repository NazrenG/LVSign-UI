import { useEffect, useState } from "react";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";

import {
  BUILDER_STEPS,
  BasicInfoStep,
  BuilderHeader,
  ExpiryRemindersStep,
  FieldsStep,
  RolesWorkflowStep,
  getPublishChecks,
  templateRepository,
  useTemplateDraft,
} from "@/features/templates";

const STEP_COMPONENTS = {
  basic: BasicInfoStep,
  roles: RolesWorkflowStep,
  fields: FieldsStep,
  expiry: ExpiryRemindersStep,
};

export function TemplateBuilderPage() {
  const { templateId } = useParams();

  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  const [initialTemplate, setInitialTemplate] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);

        /*
         * NEW template
         */
        if (templateId === "new") {
          if (creating) {
            return;
          }

          setCreating(true);

          const newTemplateId = await templateRepository.create({
            name: "Untitled template",

            description: "",

            category: "HR",
          });

          if (cancelled) {
            return;
          }

          /*
           * URL-u real GUID ilə dəyişirik.
           */
          navigate(ROUTES.templateBuilder(newTemplateId), {
            replace: true,
          });

          return;
        }

        /*
         * EXISTING template
         */
        const result = await templateRepository.getBuilderTemplate(templateId);

        if (cancelled) {
          return;
        }

        if (!result) {
          setNotFound(true);
          return;
        }
        console.log("BUILDER TEMPLATE:", result);
        setInitialTemplate(result);
      } catch (error) {
        console.error("Template builder load failed:", error);

        if (!cancelled) {
          setError(error.message || "Template could not be loaded.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setCreating(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [templateId, navigate]);

  if (loading || templateId === "new") {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-muted">
        Loading template builder...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-2xl text-ink">Template not found</h1>

          <button
            type="button"
            onClick={() => navigate(ROUTES.templates)}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Back to templates
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md rounded-md border border-danger/30 bg-danger/5 p-6 text-center text-danger">
          {error}
        </div>
      </div>
    );
  }

  if (!initialTemplate) {
    return null;
  }

  return (
    <TemplateBuilderContent
      key={initialTemplate.id}
      initialTemplate={initialTemplate}
      searchParams={searchParams}
      setSearchParams={setSearchParams}
      navigate={navigate}
    />
  );
}

function TemplateBuilderContent({
  initialTemplate,
  searchParams,
  setSearchParams,
  navigate,
}) {
  const { template, isDirty, savedAt, actions } =
    useTemplateDraft(initialTemplate);
  const [saving, setSaving] = useState(false);
  const stepId = STEP_COMPONENTS[searchParams.get("step")]
    ? searchParams.get("step")
    : "basic";

  const stepIndex = BUILDER_STEPS.findIndex((step) => step.id === stepId);

  const isLastStep = stepIndex === BUILDER_STEPS.length - 1;

  const checks = getPublishChecks(template);
  const isPublishedVersion = template.latestVersionIsPublished === true;
  const goToStep = (id) => {
    const next = new URLSearchParams(searchParams);

    next.set("step", id);

    setSearchParams(next);

    window.scrollTo({
      top: 0,
    });
  };

  const handleSave = async () => {
    if (saving) return;

    if (isPublishedVersion) {
      toast.error(
        "This template version is published. Create a new version to make changes.",
      );
      return;
    }

    try {
      setSaving(true);

      await templateRepository.update(template.id, template);

      actions.markSaved();

      toast.success("Template draft saved.");
    } catch (error) {
      console.error("Template save failed:", error);
      toast.error(error.message || "Template could not be saved.");
    } finally {
      setSaving(false);
    }
  };
  /*
   * Hələlik publish 6.9E6-da.
   */

  const handlePublish = async () => {
    if (saving) return;

    if (isPublishedVersion) {
      toast.error(
        "This version is already published. Create a new draft version first.",
      );
      return;
    }

    const invalidChecks = checks.filter((check) => !check.isValid);

    if (invalidChecks.length > 0) {
      toast.error("Complete the required template steps before publishing.");
      return;
    }

    try {
      setSaving(true);

      // Save pending changes before publishing.
      if (isDirty) {
        await templateRepository.update(template.id, template);
        actions.markSaved();
      }

      await templateRepository.publish(template.id);

      toast.success("Template published successfully.");

      navigate(ROUTES.templateDetail(template.id), {
        replace: true,
      });
    } catch (error) {
      console.error("Template publish failed:", error);
      toast.error(error.message || "Template could not be published.");
    } finally {
      setSaving(false);
    }
  };

  const StepComponent = STEP_COMPONENTS[stepId];

  const backTo = ROUTES.templateDetail(template.id);

  const handleCreateNewVersion = async () => {
    if (saving || !template.latestVersionIsPublished) {
      return;
    }

    try {
      setSaving(true);

      const newVersion = await templateRepository.createNewVersion(template.id);

      if (newVersion.latestVersionIsPublished || !newVersion.hasDraftVersion) {
        throw new Error("The server did not return a new draft version.");
      }

      toast.success(
        `Template version ${newVersion.latestVersionNumber} created.`,
      );

      // Reload the builder so all roles, documents and fields
      // are loaded from the newly created draft version.
      window.location.assign(ROUTES.templateBuilder(template.id));
    } catch (error) {
      console.error("Create template version failed:", error);

      toast.error(error.message || "Could not create a new template version.");
    } finally {
      setSaving(false);
    }
  };

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
        onSave={handleSave}
        onContinue={() => goToStep(BUILDER_STEPS[stepIndex + 1].id)}
        onPublish={handlePublish}
        saving={saving}
        onCreateVersion={handleCreateNewVersion}
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
