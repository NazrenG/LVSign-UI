import { StepProgress } from "@/components/shared";
import { Card, CardHeader } from "@/components/ui";
import {
  describeRoleStep,
  getApprovalSteps,
  getRole,
} from "../../templateSelectors";

export function ApprovalChainCard({ template }) {
  const orderText =
    template.signingOrder === "sequential"
      ? "Signs in order"
      : "Signs all at once";

  return (
    <Card className="p-5 sm:p-6">
      <CardHeader
        title="Approval chain"
        action={
          <span className="text-[13px] text-ink-muted">
            {orderText} · roles resolve when you send
          </span>
        }
      />
      <StepProgress
        steps={getApprovalSteps(template)}
        className="border-b border-line pb-6"
      />

      <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {template.roles.map((roleStep) => (
          <div key={roleStep.id}>
            <dt className="text-[15px] font-medium text-ink">
              {getRole(roleStep).name}
            </dt>
            <dd className="mt-1 text-[13px] text-ink-muted">
              {roleStep.resolver}
            </dd>
            <dd className="text-[13px] text-ink-muted">
              {describeRoleStep(roleStep)}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
