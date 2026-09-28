import { BuilderStepLayout } from "../BuilderStepLayout";
import { ExpirationCard } from "../expiry/ExpirationCard";
import { PublishChecklistCard } from "../expiry/PublishChecklistCard";
import { ReminderEmailPreview } from "../expiry/ReminderEmailPreview";
import { RemindersCard } from "../expiry/RemindersCard";
import { SignerTimelineCard } from "../expiry/SignerTimelineCard";

export function ExpiryRemindersStep({
  template,
  actions,
  checks,
  onStepChange,
}) {
  const updateExpiry = (patch) => actions.updateSection("expiry", patch);

  return (
    <BuilderStepLayout
      title="Expiry & reminders"
      description="Set how long a document stays valid and how LV Sign chases people who have not signed yet."
      aside={
        <>
          <PublishChecklistCard
            checks={checks}
            version={template.version}
            onStepChange={onStepChange}
          />
          <ReminderEmailPreview template={template} />
        </>
      }
    >
      <ExpirationCard expiry={template.expiry} onChange={updateExpiry} />
      <RemindersCard expiry={template.expiry} onChange={updateExpiry} />
      <SignerTimelineCard expiry={template.expiry} />
    </BuilderStepLayout>
  );
}
