import { Button, Dialog } from "@/components/ui";

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  tone = "primary",
  loading = false,
  error = null,
  onConfirm,
  onClose,
}) {
  return (
    <Dialog
      isOpen={isOpen}
      title={title}
      onClose={loading ? undefined : onClose}
      footer={
        <>
          <Button variant="secondary" disabled={loading} onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-[15px] text-ink-muted">
        {message}

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  );
}
