import { useEffect, useState } from "react";
import { Button, Dialog, Textarea } from "@/components/ui";

const MIN_REASON = 5;

export function VoidEnvelopeDialog({ isOpen, onVoid, onClose }) {
  const [reason, setReason] = useState("");

  const [state, setState] = useState({
    isSending: false,
    error: null,
  });

  useEffect(() => {
    if (isOpen) {
      setReason("");

      setState({
        isSending: false,
        error: null,
      });
    }
  }, [isOpen]);

  const isValid = reason.trim().length >= MIN_REASON;

  const submit = async () => {
    setState({
      isSending: true,
      error: null,
    });

    try {
      const success = await onVoid(reason.trim());

      if (success) {
        onClose();
      }
    } catch (error) {
      setState({
        isSending: false,
        error:
          error instanceof Error
            ? error.message
            : "Envelope could not be voided.",
      });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      title="Void this envelope?"
      description="Recipients will no longer be able to sign this envelope."
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
            {state.isSending ? "Voiding…" : "Void envelope"}
          </Button>
        </>
      }
    >
      <Textarea
        label="Reason"
        rows={4}
        value={reason}
        maxLength={1000}
        placeholder="For example: this agreement was sent by mistake."
        onChange={(event) => setReason(event.target.value)}
        hint={`Recipients may see this reason. At least ${MIN_REASON} characters.`}
      />
    </Dialog>
  );
}
