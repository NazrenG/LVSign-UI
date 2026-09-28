import { ArrowLeft, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Button } from "@/components/ui";
import { formatTime } from "@/utils/formatters";
import { BuilderStepper } from "./BuilderStepper";

export function BuilderHeader({
  template,
  savedAt,
  isDirty,
  currentStep,
  isLastStep,
  canPublish,
  backTo,
  onStepChange,
  onSave,
  onContinue,
  onPublish,
}) {
  const savedText = isDirty
    ? "unsaved changes"
    : `saved ${formatTime(savedAt ?? new Date())}`;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 xl:flex-row xl:items-center xl:justify-between xl:gap-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Button
            as={Link}
            to={backTo}
            variant="secondary"
            size="icon"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" strokeWidth={1.5} />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-serif text-xl text-ink">
                {template.name || "Untitled template"}
              </h1>
              <Badge tone="neutral">Draft</Badge>
            </div>
            <p className="font-mono text-[13px] text-ink-muted">
              v{template.version + 1} draft · {savedText}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:justify-end xl:gap-6">
          <BuilderStepper
            currentStep={currentStep}
            onStepChange={onStepChange}
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onSave}
              className="flex-1 sm:flex-none"
            >
              Save draft
            </Button>
            {isLastStep ? (
              <Button
                icon={ArrowUp}
                onClick={onPublish}
                disabled={!canPublish}
                title={
                  canPublish
                    ? undefined
                    : "Fix the steps marked in the checklist first"
                }
                className="flex-1 sm:flex-none"
              >
                Publish template
              </Button>
            ) : (
              <Button onClick={onContinue} className="flex-1 sm:flex-none">
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
