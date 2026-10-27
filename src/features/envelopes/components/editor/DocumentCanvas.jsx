import { useMemo } from "react";
import { FileUp } from "lucide-react";
import { Button, IconTile } from "@/components/ui";
import { getFieldsOnPage } from "../../utils/envelopeSelectors";
import { PX_PER_POINT } from "../../hooks/useCanvasViewport";
import { DocumentPage } from "./DocumentPage";
 
export function DocumentCanvas({
  envelope,
  document,
  viewport,
  colorsById,
  selectedFieldId,
  commands,
  actions,
  onAddDocument,
}) {
  const recipientsById = useMemo(
    () =>
      Object.fromEntries(
        envelope.recipients.map((recipient) => [recipient.id, recipient]),
      ),
    [envelope.recipients],
  );

  const commitRect = useMemo(
    () => (fieldId, rect) => commands.updateField(fieldId, rect),
    [commands],
  );

  return (
    <div
      ref={viewport.scrollRef}
      className="flex-1 overflow-auto bg-canvas"
      onPointerDown={(event) =>
        event.target === event.currentTarget && commands.clearSelection()
      }
    >
      {document ? (
        <div className="mx-auto flex w-max min-w-full flex-col items-center gap-6 px-6 py-8">
          {document.pages.map((page) => (
            <DocumentPage
              key={`${document.id}-${page.pageNumber}`}
              document={document}
              page={page}
              widthPx={Math.round(page.width * PX_PER_POINT * viewport.zoom)}
              fields={getFieldsOnPage(envelope, document.id, page.pageNumber)}
              recipientsById={recipientsById}
              colorsById={colorsById}
              selectedFieldId={selectedFieldId}
              onSelectField={commands.selectField}
              onClearSelection={commands.clearSelection}
              onCommitRect={commitRect}
              onDropField={commands.placeField}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
          <IconTile icon={FileUp} />
          <div>
            <p className="font-medium text-ink">Add the first document</p>
            <p className="mt-1 text-[15px] text-ink-muted">
              Upload a PDF to start placing fields.
            </p>
          </div>
          <Button icon={FileUp} onClick={onAddDocument}>
            Add document
          </Button>
        </div>
      )}
    </div>
  );
}
