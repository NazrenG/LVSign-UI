import { Card, CardHeader, Input } from "@/components/ui";
import { BuilderStepLayout } from "../BuilderStepLayout";

export function ExpiryRemindersStep({ template, actions }) {
  return (
    <BuilderStepLayout
      title="Expiry & reminders"
      description="Configure the default expiry and signing reminder interval for envelopes created from this template."
    >
      <Card className="space-y-5 p-5 sm:p-6">
        <CardHeader
          title="Envelope timing"
          description="These values become defaults when an envelope is created from this template."
        />

        <Input
          label="Envelope expires after"
          type="number"
          min={1}
          value={template.expirationDays ?? ""}
          suffix="days after sending"
          onChange={(event) => {
            const value = Number(event.target.value);

            actions.update({
              expirationDays: value > 0 ? value : null,
            });
          }}
        />

        <Input
          label="Signing reminder interval"
          type="number"
          min={1}
          value={template.reminderIntervalDays ?? ""}
          suffix="days"
          onChange={(event) => {
            const value = Number(event.target.value);

            actions.update({
              reminderIntervalDays: value > 0 ? value : null,
            });
          }}
        />
      </Card>
    </BuilderStepLayout>
  );
}
