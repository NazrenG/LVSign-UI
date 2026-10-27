import { useState } from "react";
import { Send } from "lucide-react";
import { Button, Dialog } from "@/components/ui";
import { formatDueDate, pluralize } from "@/utils/formatters";
import { RoutingSummaryCard } from "./RoutingSummaryCard";
import { SendChecklistCard } from "./SendChecklistCard";

/** Last look before sending: documents, route, message, checklist. */
export function ReviewSendDialog({
  isOpen,
  envelope,
  checks,
  isReady,
  onClose,
  onSend,
  onIssueSelect,
}) {
  const [isSending, setIsSending] = useState(false);

  const [sendError, setSendError] = useState("");
  // const send = async () => {
  //   setState({ isSending: true, error: null });
  //   try {
  //     await onSend();
  //   } catch (error) {
  //     setState({ isSending: false, error: error.message });
  //   }
  // };
  const handleSend = async () => {
    if (isSending) {
      return;
    }

    try {
      setIsSending(true);
      setSendError("");

      await onSend();
    } catch (error) {
      setSendError(error.message ?? "Envelope could not be sent.");

      setIsSending(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      size="lg"
      title="Review and send"
      description={envelope.title}
      onClose={onClose}
      footer={
        <>
          {sendError && (
            <p className="mr-auto text-[13px] text-danger">{sendError}</p>
          )}
          <Button variant="secondary" disabled={isSending} onClick={onClose}>
            Keep editing
          </Button>

          <Button
            icon={Send}
            disabled={isSending || !isReady}
            onClick={handleSend}
          >
            {isSending ? "Sending…" : "Send envelope"}
          </Button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-5">
          <section>
            <h3 className="mb-2 text-sm font-medium text-ink">Documents</h3>
            <ol className="space-y-1 text-[15px]">
              {envelope.documents.map((document, index) => (
                <li key={document.id} className="flex justify-between gap-3">
                  <span className="truncate text-ink">
                    {index + 1}. {document.name}
                  </span>
                  <span className="shrink-0 text-ink-muted">
                    {pluralize(document.pages.length, "page")}
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <section>
            <h3 className="mb-2 text-sm font-medium text-ink">Email</h3>
            <p className="text-[15px] font-medium text-ink">
              {envelope.emailSubject || "No subject"}
            </p>
            {envelope.emailMessage && (
              <p className="mt-1 text-[15px] text-ink-muted">
                {envelope.emailMessage}
              </p>
            )}
            <p className="mt-2 font-mono text-[13px] text-ink-muted">
              {envelope.dueDate
                ? `Due ${formatDueDate(envelope.dueDate)}`
                : "No due date"}
              {envelope.reminderEveryDays > 0 &&
                ` · reminders every ${pluralize(envelope.reminderEveryDays, "day")}`}
            </p>
          </section>
          <SendChecklistCard checks={checks} onIssueSelect={onIssueSelect} />
        </div>
        <RoutingSummaryCard envelope={envelope} />
      </div>
    </Dialog>
  );
}
