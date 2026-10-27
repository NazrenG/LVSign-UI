import { FileText, Plus } from "lucide-react";
import { PdfPage } from "@/components/shared";
import { Button, Menu } from "@/components/ui";
import { cn } from "@/utils/cn";
import { pluralize } from "@/utils/formatters";
import {
  countFieldsByDocument,
  getFieldsOnPage,
} from "../../utils/envelopeSelectors";
import { useState } from "react";

const THUMBNAIL_WIDTH = 120;

function PageThumbnail({ envelope, document, page, isCurrent, onSelect }) {
  const fieldCount = getFieldsOnPage(
    envelope,
    document.id,
    page.pageNumber,
  ).length;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isCurrent ? "page" : undefined}
      className="group flex flex-col items-center gap-1.5"
    >
      <span
        className={cn(
          "relative block border-2 bg-surface transition-colors",
          isCurrent
            ? "border-primary"
            : "border-line group-hover:border-line-strong",
        )}
        style={{
          width: THUMBNAIL_WIDTH,
          height: (THUMBNAIL_WIDTH * page.height) / page.width,
        }}
      >
        <PdfPage
          url={document.fileUrl}
          pageNumber={page.pageNumber}
          renderWidth={THUMBNAIL_WIDTH}
        />
        {fieldCount > 0 && (
          <span className="absolute right-1 bottom-1 rounded-sm bg-ink/80 px-1 font-mono text-[10px] text-white">
            {fieldCount}
          </span>
        )}
      </span>
      <span
        className={cn(
          "text-[13px]",
          isCurrent ? "font-medium text-primary" : "text-ink-muted",
        )}
      >
        Page {page.pageNumber}
      </span>
    </button>
  );
}

/**
 * Left column: the envelope's documents (in order), the active one's page
 * thumbnails, and "Add document".
 */
export function DocumentsPanel({
  envelope,
  activeDocument,
  currentPage,
  upload,
  commands,
  actions,
  onPageSelect,
}) {
  const fieldCounts = countFieldsByDocument(envelope);
  const [deletingId, setDeletingId] = useState(null); //for double click
  const handleDelete = async (documentId) => {
    if (deletingId) {
      return;
    }

    try {
      setDeletingId(documentId);

      await commands.removeDocument(documentId);
    } finally {
      setDeletingId(null);
    }
  };
  
  return (
    <nav aria-label="Documents" className="space-y-4">
      <h2 className="flex items-baseline justify-between text-base font-semibold text-ink">
        Documents
        <span className="text-[13px] font-normal text-ink-muted">
          {envelope.documents.length}
        </span>
      </h2>

      <ol className="space-y-4">
        {envelope.documents.map((document, index) => {
          const isActive = document.id === activeDocument?.id;
          return (
            <li key={document.id}>
              <div
                className={cn(
                  "flex items-start gap-2 rounded-md border px-2.5 py-2",
                  isActive
                    ? "border-line bg-surface shadow-xs"
                    : "border-transparent hover:bg-canvas-muted",
                )}
              >
                <button
                  type="button"
                  onClick={() => commands.setActiveDocument(document.id)}
                  className="flex min-w-0 flex-1 items-start gap-2 text-left"
                >
                  <FileText
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      isActive ? "text-primary" : "text-ink-muted",
                    )}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block truncate text-[13px] font-medium",
                        isActive ? "text-primary" : "text-ink",
                      )}
                    >
                      {document.name}
                    </span>
                    <span className="block text-[12px] text-ink-muted">
                      {pluralize(document.pages.length, "page")} ·{" "}
                      {pluralize(fieldCounts[document.id] ?? 0, "field")}
                    </span>
                  </span>
                </button>
                <Menu
                  label={`${document.name} actions`}
                  items={[
                    {
                      label: "Move up",
                      onSelect: () => commands.moveDocument(document.id, -1),
                      disabled: index === 0,
                    },
                    {
                      label: "Move down",
                      onSelect: () => commands.moveDocument(document.id, 1),
                      disabled: index === envelope.documents.length - 1,
                    },
                    // {
                    //   label: "Remove document",
                    //   onSelect: () => commands.removeDocument(document.id),
                    //   tone: "danger",
                    // },
                    {
                      label:
                        deletingId === document.id
                          ? "Removing…"
                          : "Remove document",

                      onSelect: () => handleDelete(document.id),

                      disabled: deletingId === document.id,

                      tone: "danger",
                    },
                  ]}
                />
              </div>

              {isActive && (
                <div className="mt-3 flex flex-col items-center gap-3">
                  {document.pages.map((page) => (
                    <PageThumbnail
                      key={page.pageNumber}
                      envelope={envelope}
                      document={document}
                      page={page}
                      isCurrent={page.pageNumber === currentPage}
                      onSelect={() => onPageSelect(page.pageNumber)}
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <Button
        variant="ghost"
        icon={Plus}
        className="-ml-3"
        disabled={upload.isUploading}
        onClick={upload.open}
      >
        {upload.isUploading ? "Adding…" : "Add document"}
      </Button>
      {upload.error && (
        <p className="text-[13px] text-danger">{upload.error}</p>
      )}
    </nav>
  );
}
