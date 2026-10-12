import { useCallback, useRef, useState } from "react";
import { PdfPage } from "@/components/shared";
import { cn } from "@/utils/cn";
import { toNormalizedPoint } from "../../utils/coordinates";
import { PlacedField } from "./PlacedField";

/** MIME type used when a field type is dragged from the palette. */
export const FIELD_DRAG_TYPE = "application/x-lvsign-field-type";

/**
 * One rendered PDF page with its fields on top. Size is
 * page size (pt) × zoom; field geometry is percentage-based.
 */
export function DocumentPage({
  document,
  page,
  widthPx,
  fields,
  recipientsById,
  colorsById,
  selectedFieldId,
  onSelectField,
  onClearSelection,
  onCommitRect,
  onDropField,
}) {
  const pageRef = useRef(null);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const heightPx = (widthPx * page.height) / page.width;

  const getPageSize = useCallback(() => {
    const box = pageRef.current.getBoundingClientRect();
    return { width: box.width, height: box.height };
  }, []);

  const acceptsDrop = (event) =>
    event.dataTransfer.types.includes(FIELD_DRAG_TYPE);

  const handleDrop = (event) => {
    if (!acceptsDrop(event)) return;
    event.preventDefault();
    setIsDropTarget(false);
    const box = pageRef.current.getBoundingClientRect();
    const point = toNormalizedPoint(
      event.clientX - box.left,
      event.clientY - box.top,
      box,
    );
    onDropField(event.dataTransfer.getData(FIELD_DRAG_TYPE), {
      documentId: document.id,
      pageNumber: page.pageNumber,
      point,
    });
  };

  return (
    <figure
      className="flex flex-col items-center gap-2"
      data-page-number={page.pageNumber}
    >
      <div
        ref={pageRef}
        className={cn(
          "relative shrink-0 bg-surface shadow-[0_24px_48px_-28px_rgb(0_0_0/0.25)] transition-shadow",
          isDropTarget && "ring-2 ring-primary/40",
        )}
        style={{ width: widthPx, height: heightPx }}
        onPointerDown={(event) =>
          event.target === event.currentTarget && onClearSelection()
        }
        onDragOver={(event) => {
          if (!acceptsDrop(event)) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          setIsDropTarget(true);
        }}
        onDragLeave={() => setIsDropTarget(false)}
        onDrop={handleDrop}
      >
        <div className="pointer-events-none absolute inset-0">
          <PdfPage
            url={document.fileUrl}
            pageNumber={page.pageNumber}
            renderWidth={widthPx}
          />
        </div>
        {fields.map((field) => (
          <PlacedField
            key={field.id}
            field={field}
            recipient={recipientsById[field.recipientId]}
            colors={colorsById[field.recipientId]}
            isSelected={field.id === selectedFieldId}
            getPageSize={getPageSize}
            onSelect={onSelectField}
            onCommitRect={onCommitRect}
          />
        ))}
      </div>
      <figcaption className="font-mono text-[11px] text-ink-muted">
        Page {page.pageNumber} of {document.pages.length}
      </figcaption>
    </figure>
  );
}
