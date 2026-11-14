import { FileUp } from "lucide-react";

import { Button, IconTile } from "@/components/ui";

import { TemplateDocumentPage } from "./TemplateDocumentPage";

export function TemplateDocumentCanvas({
  document,
  loading,
  error,
  uploading,

  fields = [],

  selectedFieldId,

  onSelectField,

  onAddDocument,

  onDropDocument,

  onDropField,
  onCommitFieldRect,
  colorsByRoleId,
}) {
  /*
   * Bu drag/drop yalnız DOCUMENT üçündür.
   *
   * Field drag/drop isə
   * TemplateDocumentPage daxilində idarə olunur.
   */
  const handleDocumentDragOver = (event) => {
    /*
     * Drag olunan obyekt file deyilsə,
     * burada heç nə etmə.
     *
     * Beləliklə field drag event-i
     * page component-ə qalır.
     */
    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }

    event.preventDefault();

    event.dataTransfer.dropEffect = "copy";
  };

  const handleDocumentDrop = (event) => {
    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }

    event.preventDefault();

    const files = Array.from(event.dataTransfer.files);

    if (files.length === 0) {
      return;
    }

    onDropDocument?.(files);
  };

  /*
   * PDF backend-dən yüklənir.
   */
  if (loading) {
    return (
      <div className="flex min-h-[650px] flex-1 items-center justify-center bg-canvas text-[15px] text-ink-muted">
        Loading document...
      </div>
    );
  }

  /*
   * PDF content endpoint error verərsə.
   */
  if (error) {
    return (
      <div className="flex min-h-[650px] flex-1 items-center justify-center bg-canvas p-8 text-center">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  /*
   * Hələ document yoxdur.
   *
   * Agreement editor-dəki
   * "Add the first document"
   * görünüşü.
   */
  if (!document) {
    return (
      <div
        onDragOver={handleDocumentDragOver}
        onDrop={handleDocumentDrop}
        className="flex min-h-[650px] flex-1 flex-col items-center justify-center gap-4 bg-canvas p-8 text-center"
      >
        <IconTile icon={FileUp} />

        <div>
          <p className="font-medium text-ink">Add the first document</p>

          <p className="mt-1 text-[15px] text-ink-muted">
            Upload a PDF to start placing fields.
          </p>

          <p className="mt-1 text-[13px] text-ink-muted">
            You can also drag and drop a PDF here.
          </p>
        </div>

        <Button icon={FileUp} onClick={onAddDocument} disabled={uploading}>
          {uploading ? "Adding..." : "Add document"}
        </Button>
      </div>
    );
  }

  /*
   * Document varsa artıq hər PDF page
   * TemplateDocumentPage tərəfindən
   * render və field-drop target kimi
   * idarə olunur.
   */
  return (
    <div
      onDragOver={handleDocumentDragOver}
      onDrop={handleDocumentDrop}
      className="flex min-h-[650px] flex-1 overflow-auto bg-canvas"
    >
      <div className="mx-auto flex w-max min-w-full flex-col items-center gap-6 px-6 py-8">
        {document.pages.map((page) => {
          const width = 720;

          const pageFields = fields.filter(
            (field) =>
              field.templateDocumentId === document.id &&
              field.pageNumber === page.pageNumber,
          );

          return (
            <TemplateDocumentPage
              key={page.pageNumber}
              document={document}
              page={page}
              widthPx={width}
              fields={pageFields}
              selectedFieldId={selectedFieldId}
              onSelectField={onSelectField}
              onDropField={onDropField}
              onCommitRect={onCommitFieldRect}
              colorsByRoleId={colorsByRoleId}
            />
          );
        })}
      </div>
    </div>
  );
}
