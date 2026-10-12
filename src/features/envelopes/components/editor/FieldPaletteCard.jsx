import { GripVertical } from "lucide-react";
import { Card, CardHeader, Select } from "@/components/ui";
import { cn } from "@/utils/cn";
import {
  FIELD_PALETTE,
  FIELD_TYPES,
  isFieldAllowedFor,
} from "../../models/fieldTypes";
import { FIELD_DRAG_TYPE } from "./DocumentPage";
import { RecipientDot, recipientName } from "./RecipientDot";

/**
 * Field types for the active recipient. Drag one onto a page, or click to
 * drop it in the middle of the page currently in view.
 */
export function FieldPaletteCard({
  fieldOwners,
  activeRecipient,
  activeDocument,
  currentPage,
  colorsById,
  commands,
  onPlaced,
}) {
  const canPlace = Boolean(activeRecipient && activeDocument);

  const place = (type) => {
    commands.placeField(type, {
      documentId: activeDocument.id,
      pageNumber: currentPage,
    });
    onPlaced?.();
  };

  return (
    <Card className="p-5">
      <CardHeader title="Fields" className="mb-3" />

      {fieldOwners.length > 0 ? (
        <div className="mb-4">
          <p className="mb-1.5 text-[13px] text-ink-muted">
            Placing fields for
          </p>
          <div className="flex items-center gap-2">
            <RecipientDot colors={colorsById[activeRecipient?.id]} />
            <Select
              aria-label="Placing fields for"
              options={fieldOwners.map((recipient) => ({
                value: recipient.id,
                label: recipientName(recipient),
              }))}
              value={activeRecipient?.id ?? ""}
              onChange={(event) =>
                commands.setActiveRecipient(event.target.value)
              }
              wrapperClassName="flex-1"
            />
          </div>
        </div>
      ) : (
        <p className="mb-4 text-[13px] text-ink-muted">
          Add a signer or approver to place fields.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {FIELD_PALETTE.map((type) => {
          const { label, icon: Icon } = FIELD_TYPES[type];
          const isAllowed =
            canPlace && isFieldAllowedFor(type, activeRecipient.recipientType);
          return (
            <button
              key={type}
              type="button"
              disabled={!isAllowed}
              draggable={isAllowed}
              onDragStart={(event) => {
                event.dataTransfer.setData(FIELD_DRAG_TYPE, type);
                event.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => place(type)}
              title={
                isAllowed
                  ? `Drag onto the page, or click to add to page ${currentPage}`
                  : canPlace
                    ? `${label} can’t be given to this recipient`
                    : undefined
              }
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-sm border border-line-strong bg-surface px-2.5 py-1.5 text-left text-[15px] leading-tight text-ink transition-colors",
                "cursor-grab hover:border-primary hover:text-primary active:cursor-grabbing disabled:pointer-events-none disabled:opacity-40",
              )}
            >
              <GripVertical
                className="size-3.5 shrink-0 text-ink-subtle"
                aria-hidden
              />
              <Icon className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[13px] text-ink-muted">
        Drag a field onto the page. Every signer needs at least one signature
        field.
      </p>
    </Card>
  );
}
