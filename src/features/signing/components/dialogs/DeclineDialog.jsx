import { useEffect, useState } from "react";
import { Button, Dialog, Textarea } from "@/components/ui";

const MIN_REASON = 5;

export function DeclineDialog({ isOpen, senderName, onDecline, onClose }) {
  const [reason, setReason] = useState("");
  const [state, setState] = useState({ isSending: false, error: null });

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setState({ isSending: false, error: null });
    }
  }, [isOpen]);

  const isValid = reason.trim().length >= MIN_REASON;

  const submit = async () => {
    setState({ isSending: true, error: null });
    try {
      await onDecline(reason.trim());
    } catch (error) {
      setState({ isSending: false, error: error.message });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      title="Decline to sign?"
      description={`${senderName} will be told that you declined, and signing will stop.`}
      onClose={state.isSending ? () => {} : onClose}
      footer={
        <>
          {state.error && (
            <p className="mr-auto text-[13px] text-danger">{state.error}</p>
          )}
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={state.isSending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={submit}
            disabled={!isValid || state.isSending}
          >
            {state.isSending ? "Declining…" : "Decline"}
          </Button>
        </>
      }
    >
      <Textarea
        label="Reason"
        rows={4}
        value={reason}
        maxLength={1000}
        placeholder="For example: the leave dates overlap with the depot audit."
        onChange={(event) => setReason(event.target.value)}
        hint={`Shared with ${senderName}. At least ${MIN_REASON} characters.`}
      />
    </Dialog>
  );
}
