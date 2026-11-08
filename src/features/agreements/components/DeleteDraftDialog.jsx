import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
} from "@/components/ui";

export function DeleteDraftDialog({
  isOpen,
  title,
  onDelete,
  onClose,
}) {
  const [state, setState] =
    useState({
      isSending: false,
      error: null,
    });

  useEffect(() => {
    if (isOpen) {
      setState({
        isSending: false,
        error: null,
      });
    }
  }, [isOpen]);

  const submit = async () => {
    setState({
      isSending: true,
      error: null,
    });

    try {
      const success =
        await onDelete();

      if (success) {
        onClose();
      }
    } catch (error) {
      setState({
        isSending: false,
        error:
          error instanceof Error
            ? error.message
            : "Draft could not be deleted.",
      });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      title="Delete this draft?"
      description="This draft and its current preparation data will be removed."
      onClose={
        state.isSending
          ? () => {}
          : onClose
      }
      footer={
        <>
          {state.error && (
            <p className="mr-auto text-[13px] text-danger">
              {state.error}
            </p>
          )}

          <Button
            variant="secondary"
            onClick={onClose}
            disabled={
              state.isSending
            }
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={submit}
            disabled={
              state.isSending
            }
          >
            {state.isSending
              ? "Deleting…"
              : "Delete draft"}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-ink">
          You are about to delete:
        </p>

        <div className="rounded-md border border-line bg-canvas px-4 py-3">
          <p className="font-medium text-ink">
            {title ||
              "Untitled envelope"}
          </p>

          <p className="mt-1 text-sm text-ink-muted">
            This action cannot be
            undone.
          </p>
        </div>
      </div>
    </Dialog>
  );
}