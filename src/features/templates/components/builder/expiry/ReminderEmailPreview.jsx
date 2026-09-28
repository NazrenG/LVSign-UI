import { Card } from "@/components/ui";
import { formatDueDate } from "@/utils/formatters";
import { getRole } from "../../../templateSelectors";

/** Example of the reminder e-mail the first signer would receive. */
export function ReminderEmailPreview({ template }) {
  const firstRole = template.roles[0]
    ? getRole(template.roles[0]).name
    : "signer";
  const due = new Date();
  due.setDate(due.getDate() + template.expiry.signerDays);

  return (
    <Card className="bg-canvas-muted/60 p-5">
      <h3 className="mb-3 text-base font-semibold text-ink">
        Reminder email preview
      </h3>
      <p className="font-mono text-[13px] text-ink-muted">Subject</p>
      <p className="mt-1 text-[15px] font-medium text-ink">
        {template.name} is waiting for your signature
      </p>
      <p className="mt-2 text-[15px] text-ink-muted">
        Your signature is needed on “{template.name}” as {firstRole}. Due{" "}
        {formatDueDate(due)}.
      </p>
    </Card>
  );
}
