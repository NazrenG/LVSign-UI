import {
  ChevronLeft,
  ChevronRight,
  Files,
  Minus,
  PanelRight,
  Plus,
} from "lucide-react";
import { Button, Select } from "@/components/ui";

/**
 * Above the canvas: document switcher, page navigation, zoom.
 * Below xl / lg the side panels move into sheets opened from here.
 */
export function CanvasToolbar({
  envelope,
  activeDocument,
  viewport,
  commands,
  onOpenDocuments,
  onOpenPanel,
  panelLabel,
}) {
  const pageCount = activeDocument?.pages.length ?? 0;
  const page = Math.min(viewport.currentPage, pageCount || 1);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-surface px-3 py-2 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={Files}
          onClick={onOpenDocuments}
          className="xl:hidden"
          aria-label="Documents"
        >
          <span className="hidden sm:inline">Documents</span>
        </Button>
        {envelope.documents.length > 1 && (
          <Select
            aria-label="Document"
            options={envelope.documents.map((document) => ({
              value: document.id,
              label: document.name,
            }))}
            value={activeDocument?.id ?? ""}
            onChange={(event) => commands.setActiveDocument(event.target.value)}
            wrapperClassName="min-w-0 max-w-64 flex-1"
          />
        )}
      </div>

      {pageCount > 0 && (
        <div className="flex items-center gap-1" aria-label="Pages">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => viewport.scrollToPage(page - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-20 text-center font-mono text-[13px] text-ink-muted">
            {page} / {pageCount}
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Next page"
            disabled={page >= pageCount}
            onClick={() => viewport.scrollToPage(page + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          aria-label="Zoom out"
          disabled={!viewport.canZoomOut}
          onClick={viewport.zoomOut}
        >
          <Minus className="size-4" />
        </Button>
        <button
          type="button"
          onClick={viewport.zoomToFit}
          title="Fit to width"
          className="min-w-14 rounded-sm px-1 py-1 text-center font-mono text-[13px] text-ink-muted hover:bg-canvas hover:text-ink"
        >
          {viewport.isFit ? "Fit" : `${Math.round(viewport.zoom * 100)}%`}
        </button>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Zoom in"
          disabled={!viewport.canZoomIn}
          onClick={viewport.zoomIn}
        >
          <Plus className="size-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={PanelRight}
          onClick={onOpenPanel}
          className="ml-2 lg:hidden"
        >
          {panelLabel}
        </Button>
      </div>
    </div>
  );
}
