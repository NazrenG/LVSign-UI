import { Badge } from "@/components/ui";
import { STATUS_META } from "../agreementStatus";
import { getStatusLabel } from "../agreementSelectors";

export function StatusBadge({ agreement, className }) {
  return (
    <Badge tone={STATUS_META[agreement.status].tone} className={className}>
      {getStatusLabel(agreement)}
    </Badge>
  );
}
