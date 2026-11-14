import { Card, CardHeader } from "@/components/ui";

function recipientTypeLabel(recipientType) {
  switch (recipientType) {
    case "approver":
      return "Approver";

    case "viewer":
      return "Viewer";

    case "copy":
      return "Copy recipient";

    default:
      return "Signer";
  }
}

export function ApprovalChainCard({ template }) {
  const roles = [...template.roles].sort(
    (a, b) => a.routingOrder - b.routingOrder,
  );

  return (
    <Card className="p-5 sm:p-6">
      <CardHeader
        title="Recipient workflow"
        description={`${roles.length} recipient role${roles.length === 1 ? "" : "s"} configured`}
      />

      {roles.length === 0 ? (
        <p className="text-[15px] text-ink-muted">
          No recipient roles have been configured.
        </p>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex items-start gap-4 rounded-md border border-line bg-canvas-muted/40 p-4"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                {role.routingOrder}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium text-ink">{role.name}</p>

                <p className="mt-0.5 text-[13px] text-ink-muted">
                  {recipientTypeLabel(role.recipientType)}
                  {" · "}
                  {role.isRequired ? "Required" : "Optional"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
