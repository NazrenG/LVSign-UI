import { GitBranch } from "lucide-react";
import { VerticalSteps } from "@/components/shared";
import { Badge, Button, Card, CardHeader } from "@/components/ui";
import { pluralize } from "@/utils/formatters";
import { ROUTING_MODE } from "../../models/envelopeModel";
import { RECIPIENT_TYPES } from "../../models/recipientTypes";
import { getRoutingSteps } from "../../utils/envelopeSelectors";
import { recipientName } from "./RecipientDot";

/**
 * Who receives the envelope when. Recipients sharing a routing order are
 * one parallel step. Conditional routing has its place here, ready for
 * when the server supports it.
 */
export function RoutingSummaryCard({ envelope }) {
  const steps = getRoutingSteps(envelope).map(({ order, recipients }) => ({
    key: String(order),
    title: recipients.map(recipientName).join(", "),
    subtitle:
      envelope.routingMode === ROUTING_MODE.PARALLEL
        ? "Everyone at once"
        : `Step ${order}${recipients.length > 1 ? " · at the same time" : ""}`,
    caption: [
      ...new Set(
        recipients.map(
          (recipient) => RECIPIENT_TYPES[recipient.recipientType].label,
        ),
      ),
    ].join(" · "),
    state: "pending",
  }));

  return (
    <Card className="p-5">
      <CardHeader title="Signing order" className="mb-4" />
      {steps.length ? (
        <VerticalSteps steps={steps} />
      ) : (
        <p className="text-[15px] text-ink-muted">No recipients yet.</p>
      )}

      <div className="mt-4 border-t border-line pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[15px] font-medium text-ink">
            <GitBranch
              className="size-4 text-ink-muted"
              strokeWidth={1.5}
              aria-hidden
            />
            Conditions
          </p>
          {envelope.routingRules.length > 0 ? (
            <Badge tone="info">
              {pluralize(envelope.routingRules.length, "rule")}
            </Badge>
          ) : (
            <Badge tone="neutral">Coming soon</Badge>
          )}
        </div>
        <p className="mt-1 text-[13px] text-ink-muted">
          Send to different people depending on a field value — for example, add
          Finance when the amount is over 5,000 AZN.
        </p>
        {/* TODO(api): enable once EnvelopeRoutingRuleSet endpoints exist. */}
        <Button variant="ghost" size="sm" className="mt-1 -ml-3" disabled>
          Add condition
        </Button>
      </div>
    </Card>
  );
}
