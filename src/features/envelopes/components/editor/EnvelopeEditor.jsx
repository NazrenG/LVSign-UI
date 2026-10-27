import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sheet } from "@/components/ui";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useCanvasViewport } from "../../hooks/useCanvasViewport";
import { useDocumentUpload } from "../../hooks/useDocumentUpload";
import { useEditorShortcuts } from "../../hooks/useEditorShortcuts";
import { getRecipientColorMap } from "../../utils/recipientColors";
import { CanvasToolbar } from "./CanvasToolbar";
import { DocumentCanvas } from "./DocumentCanvas";
import { DocumentsPanel } from "./DocumentsPanel";
import { EditorSidePanel } from "./EditorSidePanel";
import { EnvelopeEditorHeader } from "./EnvelopeEditorHeader";
import { RecipientDialog } from "./RecipientDialog";
import { ReviewSendDialog } from "./ReviewSendDialog";
import { isClientId } from "../../api/clientIds";


/**
 * Prepare Document screen for a loaded envelope.
 *
 *   ≥ xl   documents | canvas | side panel
 *   lg–xl  canvas | side panel   (documents in a sheet)
 *   < lg   canvas only           (documents and side panel in sheets)
 *
 * Owns only UI state (dialogs, sheets, viewport); domain state comes from
 * useEnvelopeEditor via `editor`.
 */
export function EnvelopeEditor({ editor, backTo, onSent }) {
  const {
    envelope,
    actions,
    commands,
    activeDocument,
    selectedField,
    save,
    checks,
  } = editor;

  const documentsSheet = useDisclosure();
  const panelSheet = useDisclosure();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [editingRecipientId, setEditingRecipientId] = useState(null);

  const viewport = useCanvasViewport({
    pages: activeDocument?.pages ?? [],
    documentId: activeDocument?.id,
  });
  const upload = useDocumentUpload({
    addDocument: commands.addDocument,
    onAdded: documentsSheet.close,
  });
  // Selecting a field shows its properties at the top of the side panel.
  const sidePanelRef = useRef(null);
  const selectedFieldId = selectedField?.id;
  useEffect(() => {
    if (selectedFieldId) sidePanelRef.current?.scrollTo({ top: 0 });
  }, [selectedFieldId]);

  const colorsById = useMemo(
    () => getRecipientColorMap(envelope.recipients),
    [envelope.recipients],
  );

  useEditorShortcuts({
    isEnabled: true,
    selectedField,
    commands,
    actions
  });

  const showPage = useCallback(
    (pageNumber) => {
      viewport.scrollToPage(pageNumber);
      documentsSheet.close();
    },
    [viewport, documentsSheet],
  );

  /** Checklist issue → bring the problem into view. */
  const handleIssue = useCallback(
    (issue) => {
      if (issue.fieldId) {
        const field = envelope.fields.find((item) => item.id === issue.fieldId);
        if (!field) return;
        setIsReviewOpen(false);
        panelSheet.close();
        commands.setActiveDocument(field.documentId);
        commands.selectField(field.id);
        // Wait for the document's pages to mount before scrolling.
        requestAnimationFrame(() => viewport.scrollToPage(field.pageNumber));
      } else if (issue.recipientId) {
        setIsReviewOpen(false);
        setEditingRecipientId(issue.recipientId);
      }
    },
    [envelope.fields, commands, viewport, panelSheet],
  );

  const sidePanel = (
    <EditorSidePanel
      editor={editor}
      colorsById={colorsById}
      currentPage={viewport.currentPage}
      onEditRecipient={setEditingRecipientId}
      onIssueSelect={handleIssue}
      onFieldPlaced={panelSheet.close}
    />
  );

  const documentsPanel = (
    <DocumentsPanel
      envelope={envelope}
      activeDocument={activeDocument}
      currentPage={viewport.currentPage}
      upload={upload}
      commands={commands}
      actions={actions}
      onPageSelect={showPage}
    />
  );

  return (
    <div className="flex h-dvh flex-col">
      <input {...upload.inputProps} />
      <EnvelopeEditorHeader
        envelope={envelope}
        backTo={backTo}
        checks={checks}
        save={save} 
        actions={actions}
        onReview={() => setIsReviewOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[220px] shrink-0 overflow-y-auto border-r border-line px-4 py-6 xl:block">
          {documentsPanel}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <CanvasToolbar
            envelope={envelope}
            activeDocument={activeDocument}
            viewport={viewport}
            commands={commands}
            onOpenDocuments={documentsSheet.open}
            onOpenPanel={panelSheet.open}
            panelLabel={selectedField ? "Edit field" : "Recipients & fields"}
          />
          <DocumentCanvas
            envelope={envelope}
            document={activeDocument}
            viewport={viewport}
            colorsById={colorsById}
            selectedFieldId={selectedField?.id}
            commands={commands}
            actions={actions}
            onAddDocument={upload.open}
          />
        </main>

        <aside
          ref={sidePanelRef}
          className="hidden w-[360px] shrink-0 overflow-y-auto border-l border-line px-5 py-6 lg:block"
        >
          {sidePanel}
        </aside>
      </div>

      <Sheet
        isOpen={documentsSheet.isOpen}
        title="Documents"
        side="left"
        onClose={documentsSheet.close}
      >
        {documentsPanel}
      </Sheet>
      <Sheet
        isOpen={panelSheet.isOpen}
        title={selectedField ? "Selected field" : "Recipients & fields"}
        onClose={panelSheet.close}
      >
        {sidePanel}
      </Sheet>

      {editingRecipientId && (
        <RecipientDialog
          key={editor.resolveId(editingRecipientId)}
          envelope={envelope}
          recipient={envelope.recipients.find(
            (recipient) =>
              recipient.id === editor.resolveId(editingRecipientId),
          )}
          users={editor.users}
          actions={actions}
          commands={commands}
          onClose={() => {
            const resolvedId = editor.resolveId(editingRecipientId);

            const currentRecipient = envelope.recipients.find(
              (recipient) => recipient.id === resolvedId,
            );

            /*
             * Yeni recipient hələ backend-ə save edilməyibsə
             * X ilə dialog bağlananda temporary recipient-i də sil.
             */
            if (currentRecipient && isClientId(currentRecipient.id)) {
              actions.removeRecipient(currentRecipient.id);
            }

            setEditingRecipientId(null);
          }}
        />
      )}
      <ReviewSendDialog
        isOpen={isReviewOpen}
        envelope={envelope}
        checks={checks}
        isReady={editor.isReadyToSend}
        onClose={() => setIsReviewOpen(false)}
        onSend={async () => {
          await commands.send();
          onSent?.();
        }}
        onIssueSelect={handleIssue}
      />
    </div>
  );
}
