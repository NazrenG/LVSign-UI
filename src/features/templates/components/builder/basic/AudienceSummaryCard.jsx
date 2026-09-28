import { Card } from "@/components/ui";
import { getAudience } from "../../../templateSelectors";

export function AudienceSummaryCard({ access }) {
  const { canUse, canEdit, people } = getAudience(access);

  const rows = [
    { label: "Can use", value: canUse.join(", ") || "Nobody" },
    { label: "Can edit", value: canEdit.join(", ") || "Nobody" },
    { label: "Approx. people", value: people },
  ];

  return (
    <Card className="p-5">
      <h3 className="mb-3 text-base font-semibold text-ink">
        Who will see this template
      </h3>
      <dl className="space-y-2 text-[15px]">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <dt className="text-ink-muted">{row.label}</dt>
            <dd className="text-right text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
