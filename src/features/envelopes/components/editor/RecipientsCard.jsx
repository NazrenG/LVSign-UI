import { Pencil, Plus } from "lucide-react";
import { Button, Card, CardHeader, SegmentedControl } from "@/components/ui";
import { cn } from "@/utils/cn";
import { pluralize } from "@/utils/formatters";
import { ROUTING_MODE } from "../../models/envelopeModel";
import { RECIPIENT_TYPES } from "../../models/recipientTypes";
import {
  countFieldsByRecipient,
  sortByRoutingOrder,
} from "../../utils/envelopeSelectors";
import { RecipientDot, recipientName } from "./RecipientDot";

const ROUTING_OPTIONS = [
  { value: ROUTING_MODE.SEQUENTIAL, label: "In order" },
  { value: ROUTING_MODE.PARALLEL, label: "All at once" },
];

/** Recipients in routing order. Clicking one makes it the owner of new fields. */
export function RecipientsCard({
  envelope,
  colorsById,
  activeRecipient,
  actions,
  commands,
  onEditRecipient,
}) {
  const counts = countFieldsByRecipient(envelope);
  const isSequential = envelope.routingMode === ROUTING_MODE.SEQUENTIAL;

  return (
    <Card className="p-5">
      <CardHeader title="Recipients" className="mb-3" />
      <SegmentedControl
        label="Signing order"
        options={ROUTING_OPTIONS}
        value={envelope.routingMode}
        onChange={commands.setRoutingMode}
        className="mb-4 *:py-1.5 *:text-sm"
      />

      {envelope.recipients.length === 0 ? (
        <p className="mb-2 text-[15px] text-ink-muted">
          Add the people who sign, approve or receive a copy.
        </p>
      ) : (
        <ol className="-mx-2 mb-2 space-y-1">
          {sortByRoutingOrder(envelope.recipients).map((recipient) => {
            const type = RECIPIENT_TYPES[recipient.recipientType];
            const isActive = recipient.id === activeRecipient?.id;
            return (
              <li
                key={recipient.id}
                className={cn(
                  "flex items-center gap-2 rounded-md pr-1",
                  isActive && "bg-canvas",
                )}
              >
                <button
                  type="button"
                  disabled={!type.canOwnFields}
                  onClick={() => commands.setActiveRecipient(recipient.id)}
                  aria-pressed={isActive}
                  title={
                    type.canOwnFields
                      ? "Place new fields for this recipient"
                      : undefined
                  }
                  className="flex min-w-0 flex-1 items-start gap-2.5 rounded-md px-2 py-2 text-left disabled:cursor-default"
                >
                  {isSequential && (
                    <span className="mt-0.5 w-4 shrink-0 text-center font-mono text-[12px] text-ink-muted">
                      {recipient.routingOrder}
                    </span>
                  )}
                  <RecipientDot
                    colors={colorsById[recipient.id]}
                    className="mt-1.5"
                  />
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block truncate text-[15px] font-medium",
                        recipient.displayName.trim()
                          ? "text-ink"
                          : "text-ink-subtle italic",
                      )}
                    >
                      {recipientName(recipient)}
                    </span>
                    <span className="block truncate text-[13px] text-ink-muted">
                      {type.label}
                      {recipient.roleName && ` · ${recipient.roleName}`}
                    </span>
                    {type.canOwnFields && (
                      <span className="block font-mono text-[12px] text-ink-muted">
                        {pluralize(counts[recipient.id] ?? 0, "field")} placed
                      </span>
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onEditRecipient(recipient.id)}
                  aria-label={`Edit ${recipientName(recipient)}`}
                  className="rounded-md p-2 text-ink-muted hover:bg-canvas-muted hover:text-ink"
                >
                  <Pencil className="size-4" strokeWidth={1.5} />
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {counts.unassigned > 0 && (
        <p className="mb-2 flex items-center gap-2 text-[13px] text-danger">
          <RecipientDot />
          {pluralize(counts.unassigned, "field")} without a recipient
        </p>
      )}

      <Button
        variant="ghost"
        icon={Plus}
        className="-ml-3"
        onClick={() => onEditRecipient(commands.addRecipient())}
      >
        Add recipient
      </Button>
    </Card>
  );
}
