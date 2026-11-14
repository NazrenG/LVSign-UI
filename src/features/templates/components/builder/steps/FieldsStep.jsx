import { useRef, useState } from "react";
import { FileText, FileUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { FIELD_TYPES } from "../../../templateConstants";
import { Button } from "@/components/ui";
import { templateRepository } from "@/features/templates";
import { useTemplateDocumentViewer } from "@/features/templates/hooks/useTemplateDocumentViewer";
import { TemplateDocumentCanvas } from "../fields/TemplateDocumentCanvas";
import { AddFieldsPanel } from "../fields/AddFieldsPanel";
import { SelectedFieldPanel } from "../fields/SelectedFieldPanel";
import { getRecipientColorMap } from "@/features/envelopes/utils/recipientColors";
import { ConditionalRoutingEditor } from "../fields/ConditionalRoutingEditor";

export function FieldsStep({ template, actions }) {
  const fileInputRef = useRef(null);

  const [uploadingDocument, setUploadingDocument] = useState(false);

  const [activeDocumentId, setActiveDocumentId] = useState(
    template.documents?.[0]?.id ?? null,
  );

  const [selectedId, setSelectedId] = useState(
    template.fields?.[0]?.id ?? null,
  );
  const [routingFieldId, setRoutingFieldId] = useState(null);

  const routingField =
    template.fields?.find((field) => field.id === routingFieldId) ?? null;
  const documents = template.documents ?? [];
  const sortedRoles = [...(template.roles ?? [])].sort(
    (a, b) => a.routingOrder - b.routingOrder || a.id.localeCompare(b.id),
  );

  const colorsByRoleId = getRecipientColorMap(sortedRoles);

  const activeDocument =
    documents.find((document) => document.id === activeDocumentId) ??
    documents[0] ??
    null;

  const {
    document: viewerDocument,
    loading: documentLoading,
    error: documentError,
  } = useTemplateDocumentViewer(template.id, activeDocument);

  const selectedField =
    template.fields?.find((field) => field.id === selectedId) ?? null;

  const validateFile = (file) => {
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      toast.error(`${file.name}: only PDF documents are supported.`);

      return false;
    }

    return true;
  };

  const uploadFiles = async (files) => {
    const validFiles = Array.from(files).filter(validateFile);

    if (validFiles.length === 0) {
      return;
    }

    try {
      setUploadingDocument(true);

      for (const file of validFiles) {
        const document = await templateRepository.uploadDocument(
          template.id,
          file,
        );

        actions.addDocument(document);

        setActiveDocumentId(document.id);

        toast.success(`${file.name} uploaded.`);
      }
    } catch (error) {
      console.error("Template document upload failed:", error);

      toast.error(error.message || "Document could not be uploaded.");
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDocumentUpload = async (event) => {
    const files = event.target.files;

    if (!files?.length) {
      return;
    }

    await uploadFiles(files);

    event.target.value = "";
  };

  const handleDropField = async ({ fieldType, filledBy, pageNumber, x, y }) => {
    if (!activeDocument) {
      toast.error("Select a document first.");
      return;
    }

    const isRecipient =
      filledBy !== "sender" &&
      filledBy !== "hrSystem" &&
      filledBy !== "calculated";

    const field = {
      templateDocumentId: activeDocument.id,

      recipientRoleId: isRecipient ? filledBy : null,

      ownerType: isRecipient
        ? "recipient"
        : filledBy === "hrSystem"
          ? "directory"
          : filledBy === "calculated"
            ? "calculated"
            : "sender",

      type: fieldType,

      label: FIELD_TYPES[fieldType]?.label ?? fieldType,

      options: fieldType === "dropdown" ? ["Option 1"] : null,

      pageNumber,

      x: Math.min(Math.max(x, 0), 0.8),

      y: Math.min(Math.max(y, 0), 0.9),

      width: fieldType === "signature" ? 0.22 : 0.18,

      height: fieldType === "signature" ? 0.07 : 0.05,

      required: true,
    };

    try {
      const created = await templateRepository.createField(template.id, field);

      actions.addExistingField(created);

      setSelectedId(created.id);

      toast.success("Field added.");
    } catch (error) {
      toast.error(error.message || "Field could not be added.");
    }
  };

  const handleCommitFieldRect = async (fieldId, rect) => {
    const currentField = template.fields.find((field) => field.id === fieldId);

    if (!currentField) {
      return;
    }

    const updatedField = {
      ...currentField,
      ...rect,
    };

    try {
      const saved = await templateRepository.updateField(
        template.id,
        fieldId,
        updatedField,
      );

      actions.updateField(fieldId, saved);
    } catch (error) {
      toast.error(error.message || "Field position could not be saved.");
    }
  };

  const handleDeleteField = async (fieldId) => {
    try {
      await templateRepository.deleteField(template.id, fieldId);

      actions.removeField(fieldId);

      setSelectedId(null);

      toast.success("Field removed.");
    } catch (error) {
      toast.error(error.message || "Field could not be removed.");
    }
  };

  const handleFieldUpdate = async (fieldId, patch) => {
    const currentField = template.fields.find((field) => field.id === fieldId);

    if (!currentField) {
      return;
    }

    const updatedField = {
      ...currentField,
      ...patch,
    };

    try {
      const saved = await templateRepository.updateField(
        template.id,
        fieldId,
        updatedField,
      );

      actions.updateField(fieldId, saved);

      return saved;
    } catch (error) {
      toast.error(error.message || "Field could not be updated.");

      throw error;
    }
  };

  return (
    <>
      {routingFieldId && (
        <p className="fixed bottom-4 left-4 z-[100] bg-white p-3 text-black">
          Routing field selected: {routingFieldId}
        </p>
      )}
      <div className="flex min-h-[calc(100vh-130px)]">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          onChange={handleDocumentUpload}
          className="hidden"
        />

        {/* LEFT — DOCUMENTS */}
        <aside className="w-[220px] shrink-0 border-r border-line px-4 py-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Documents</h2>

            <span className="text-[13px] text-ink-muted">
              {documents.length}
            </span>
          </div>

          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((document) => {
                const isActive = document.id === activeDocument?.id;

                return (
                  <button
                    key={document.id}
                    type="button"
                    onClick={() => setActiveDocumentId(document.id)}
                    className={`flex w-full items-start gap-2 rounded-md border px-2.5 py-2 text-left ${
                      isActive
                        ? "border-line bg-surface shadow-xs"
                        : "border-transparent hover:bg-canvas-muted"
                    }`}
                  >
                    <FileText
                      className={`mt-0.5 size-4 shrink-0 ${
                        isActive ? "text-primary" : "text-ink-muted"
                      }`}
                      strokeWidth={1.5}
                    />

                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-ink">
                        {document.name}
                      </span>

                      <span className="block text-[12px] text-ink-muted">
                        {document.pageCount
                          ? `${document.pageCount} pages`
                          : "PDF document"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] text-ink-muted">No documents yet.</p>
          )}

          <Button
            variant="ghost"
            icon={Plus}
            className="-ml-3 mt-3"
            disabled={uploadingDocument}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadingDocument ? "Adding..." : "Add document"}
          </Button>
        </aside>

        {/* CENTER — PDF CANVAS */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-12 items-center justify-end gap-4 border-b border-line px-5 text-sm text-ink-muted">
            <button type="button" className="hover:text-ink">
              −
            </button>

            <span>Fit</span>

            <button type="button" className="hover:text-ink">
              +
            </button>
          </div>

          <TemplateDocumentCanvas
            document={viewerDocument}
            loading={documentLoading}
            error={documentError}
            uploading={uploadingDocument}
            fields={template.fields}
            selectedFieldId={selectedId}
            onSelectField={setSelectedId}
            onAddDocument={() => fileInputRef.current?.click()}
            onDropDocument={uploadFiles}
            onDropField={handleDropField}
            onCommitFieldRect={handleCommitFieldRect}
            colorsByRoleId={colorsByRoleId}
          />
        </main>

        {/* RIGHT — FIELDS */}
        <aside className="w-[360px] shrink-0 border-l border-line px-5 py-6">
          <div className="space-y-4">
            <AddFieldsPanel template={template} />
            {selectedField && (
              <SelectedFieldPanel
                field={selectedField}
                template={template}
                onUpdate={handleFieldUpdate}
                onDelete={handleDeleteField}
                onConfigureRouting={setRoutingFieldId}
              />
            )}
          </div>
        </aside>
      </div>
      {routingField && (
        <ConditionalRoutingEditor
          field={routingField}
          roles={template.roles}
          templateId={template.id}
          onClose={() => setRoutingFieldId(null)}
        />
      )}
    </>
  );
}
