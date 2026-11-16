import { Badge } from "@/components/ui";

/** Active / Inactive pill used across Admin lists. */
export function ActiveBadge({ active }) {
  return (
    <Badge tone={active ? "success" : "neutral"}>
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}
