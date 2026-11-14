import { Mail } from "lucide-react";
import { VerticalSteps } from "@/components/shared";
import { Card } from "@/components/ui";

export function RoutePreviewCard({ template }) {
  const steps = [...template.roles]
    .sort((a, b) => a.routingOrder - b.routingOrder)
    .map((role) => ({
      key: role.id,
      title: role.name,
      subtitle: `Routing order ${role.routingOrder}`,
      caption: getRecipientTypeLabel(role.recipientType),
      state: "pending",
    }));

  function getRecipientTypeLabel(type) {
    switch (Number(type)) {
      case 2:
        return "Approver";
      case 3:
        return "Viewer";
      case 4:
        return "Copy recipient";
      default:
        return "Signer";
    }
  }

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
