import { Mail } from "lucide-react";
import { VerticalSteps } from "@/components/shared";
import { Card } from "@/components/ui";
import { getRole, getStepLabel } from "../../../templateSelectors";

export function RoutePreviewCard({ template }) {
  const steps = template.roles.map((roleStep, index) => ({
    key: roleStep.id,
    title: getRole(roleStep).name,
    subtitle: getStepLabel(index, template.roles.length),
    caption: getRole(roleStep).source,
    state: "pending",
  }));

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-base font-semibold text-ink">Route preview</h3>
      <VerticalSteps steps={steps} />

      {template.copyRecipients.length > 0 && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-2 text-[13px] font-medium text-ink">
            Copies on completion
          </p>
          <ul className="space-y-1">
            {template.copyRecipients.map((recipient) => (
              <li
                key={recipient}
                className="flex items-center gap-2 text-[15px] text-ink-muted"
              >
                <Mail className="size-4" strokeWidth={1.5} aria-hidden />
                {recipient}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
