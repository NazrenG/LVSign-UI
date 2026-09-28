import { Avatar } from "@/components/ui";
import { cn } from "@/utils/cn";
import { EndMarker } from "./StepMarker";

const Connector = ({ tone }) => (
  <span
    className={cn("h-0.5 w-2", tone === "light" ? "bg-line-strong" : "bg-ink")}
    aria-hidden
  />
);

/**
 * Compact chain of initials: (LH)─(FA)─(OG)─□
 * items: [{ key, name, initials?, variant }]
 */
export function RoleChain({
  items,
  endTone = "pending",
  showEnd = true,
  connectorTone = "dark",
  className,
}) {
  return (
    <div className={cn("flex items-center", className)}>
      {items.map((item, index) => (
        <span key={item.key} className="flex items-center">
          {index > 0 && <Connector tone={connectorTone} />}
          <Avatar
            name={item.name}
            initials={item.initials}
            size="sm"
            variant={item.variant}
          />
        </span>
      ))}
      {showEnd && (
        <>
          <Connector tone={connectorTone} />
          <EndMarker tone={endTone} className="size-3" />
        </>
      )}
    </div>
  );
}
