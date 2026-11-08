import { Bell, Download, X, FilePenLine, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui";
import { formatDueDate } from "@/utils/formatters";
import { AGREEMENT_STATUS } from "../agreementStatus";
import { getPerson, getReminderLabel } from "../agreementSelectors";
import { ActivityHistory } from "./ActivityHistory";
import { SigningTimeline } from "./SigningTimeline";
import { StatusBadge } from "./StatusBadge";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useState, useEffect } from "react";
import {
  getAgreementDownloads,
  downloadSignedDocument,
  downloadCompletionCertificate,
} from "@/services/agreementsService";
import { toast } from "sonner";
import {
  deleteDraftEnvelope,
  getAgreementHistory,
  voidEnvelope,
} from "@/services/agreementsService";

import { VoidEnvelopeDialog } from "./VoidEnvelopeDialog";
import { DeleteDraftDialog } from "./DeleteDraftDialog";

function DetailItem({ label, children, mono = false }) {
  return (
    <div>
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd
        className={mono ? "mt-1 font-mono text-sm text-ink" : "mt-1 text-ink"}
      >
        {children}
      </dd>
    </div>
  );
}

export function AgreementDetailPanel({ agreement, onClose, onChanged }) {
  const reminderLabel = getReminderLabel(agreement);
  const canVoid = agreement.status === AGREEMENT_STATUS.AWAITING;
  const canEdit = agreement.status === AGREEMENT_STATUS.DRAFT;
  const isCompleted = agreement.status === AGREEMENT_STATUS.COMPLETED;

  const [downloads, setDownloads] = useState(null);

  const [downloadsLoading, setDownloadsLoading] = useState(false);

  const [downloadingKey, setDownloadingKey] = useState(null);
  const [history, setHistory] = useState([]);

  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  useEffect(() => {
    let cancelled = false;

    getAgreementHistory(agreement.id)
      .then((result) => {
        if (!cancelled) {
          setHistory(result);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, [agreement.id, agreement.status]);

  useEffect(() => {
    if (!isCompleted) {
      setDownloads(null);

      return;
    }

    let cancelled = false;

    setDownloadsLoading(true);

    getAgreementDownloads(agreement.id)
      .then((result) => {
        if (!cancelled) {
          setDownloads(result);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Completed files could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDownloadsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [agreement.id, isCompleted]);
  const handleDownloadDocument = async (document) => {
    const key = `document-${document.documentId}`;

    try {
      setDownloadingKey(key);

      await downloadSignedDocument(
        agreement.id,
        document.documentId,
        document.fileName,
      );

      toast.success("Signed document downloaded successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The signed document could not be downloaded.",
      );
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleDownloadCertificate = async () => {
    const key = "certificate";

    try {
      setDownloadingKey(key);

      await downloadCompletionCertificate(agreement.id);

      toast.success("Completion certificate downloaded successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The completion certificate could not be downloaded.",
      );
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleVoid = async (reason) => {
    try {
      await voidEnvelope(agreement.id, reason);

      toast.success("Envelope voided successfully.");

      await onChanged?.();

      return true;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Envelope could not be voided.",
      );
    }
  };
  const handleDeleteDraft = async () => {
    try {
      await deleteDraftEnvelope(agreement.id);

      toast.success("Draft deleted.");

      onClose();

      await onChanged?.();

      return true;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Draft could not be deleted.",
      );
    }
  };

  const canDelete = agreement.status === AGREEMENT_STATUS.DRAFT;

  return (
    <>
      <div className="space-y-6 p-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-ink">{agreement.title}</h2>

            <StatusBadge agreement={agreement} />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-muted hover:bg-canvas"
            aria-label="Close details"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </header>

        {/* Agreement information */}
        <dl className="grid grid-cols-2 gap-4 border-b border-line pb-6">
          <DetailItem label="Sent by">
            {agreement.senderName ??
              getPerson(agreement.senderId)?.name ??
              "Unknown"}
          </DetailItem>

          <DetailItem label="Due">
            {agreement.dueAt ? formatDueDate(agreement.dueAt) : "—"}
          </DetailItem>

          <DetailItem label="Pages">{agreement.pages}</DetailItem>

          <DetailItem label="Document ID" mono>
            {agreement.documentId}
          </DetailItem>
        </dl>

        {/* Signing route */}
        <section>
          <h3 className="mb-4 text-base font-semibold text-ink">
            Signing route
          </h3>

          <SigningTimeline agreement={agreement} />
        </section>

        {/* Completed files */}
        {isCompleted && (
          <section className="space-y-3 border-b border-line pb-6">
            <div>
              <h3 className="text-base font-semibold text-ink">
                Completed files
              </h3>

              <p className="mt-1 text-sm text-ink-muted">
                Download the final signed documents and completion certificate.
              </p>
            </div>

            {/* Loading */}
            {downloadsLoading && (
              <p className="text-sm text-ink-muted">
                Preparing completed files...
              </p>
            )}

            {/* Downloads */}
            {!downloadsLoading && downloads && (
              <div className="space-y-2">
                {/* Signed documents */}
                {downloads.documents.map((document) => {
                  const downloadKey = `document-${document.documentId}`;

                  const isDownloading = downloadingKey === downloadKey;

                  return (
                    <div
                      key={document.documentId}
                      className="flex items-center justify-between gap-4 rounded-md border border-line px-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {document.fileName}
                        </p>

                        <p className="text-xs text-ink-muted">Signed PDF</p>
                      </div>

                      <Button
                        variant="secondary"
                        icon={Download}
                        disabled={!document.isReady || isDownloading}
                        onClick={() => handleDownloadDocument(document)}
                      >
                        {isDownloading
                          ? "Downloading..."
                          : document.isReady
                            ? "Download"
                            : "Preparing..."}
                      </Button>
                    </div>
                  );
                })}

                {/* Completion certificate */}
                <div className="flex items-center justify-between gap-4 rounded-md border border-line px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">
                      Certificate of Completion
                    </p>

                    <p className="text-xs text-ink-muted">
                      Completion details and document SHA-256 fingerprints
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    icon={Download}
                    disabled={
                      !downloads.certificateReady ||
                      downloadingKey === "certificate"
                    }
                    onClick={handleDownloadCertificate}
                  >
                    {downloadingKey === "certificate"
                      ? "Downloading..."
                      : downloads.certificateReady
                        ? "Download"
                        : "Preparing..."}
                  </Button>
                </div>

                {/* Finalization still running */}
                {!downloads.isReady &&
                  downloads.finalizationStatus !== "Failed" && (
                    <p className="text-xs text-ink-muted">
                      Signed files are still being finalized. They will become
                      available automatically.
                    </p>
                  )}

                {/* Finalization failed */}
                {downloads.finalizationStatus === "Failed" && (
                  <p className="text-xs text-danger">
                    Signed files are temporarily unavailable. The system will
                    retry automatically.
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* Agreement actions */}
        <div className="flex flex-wrap gap-3 border-b border-line pb-6">
          {canEdit && (
            <Button
              as={Link}
              to={ROUTES.prepareEnvelope(agreement.id)}
              icon={FilePenLine}
            >
              Continue editing
            </Button>
          )}

          {reminderLabel && (
            <Button variant="secondary" icon={Bell}>
              {reminderLabel}
            </Button>
          )}

          {canVoid && (
            <Button variant="danger" onClick={() => setIsVoidDialogOpen(true)}>
              Void document
            </Button>
          )}

          {canDelete && (
            <Button
              variant="danger"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete draft
            </Button>
          )}
        </div>

        {/* Activity */}
        <ActivityHistory events={history} />
      </div>

      <VoidEnvelopeDialog
        isOpen={isVoidDialogOpen}
        onClose={() => setIsVoidDialogOpen(false)}
        onVoid={handleVoid}
      />

      <DeleteDraftDialog
        isOpen={isDeleteDialogOpen}
        title={agreement.title}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteDraft}
      />
    </>
  );
}
