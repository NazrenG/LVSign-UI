import { Button, Dialog } from "@/components/ui";

/** Small confirmation for destructive or state-changing actions. */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  tone = "primary",
  onConfirm,
  onClose,
}) {
  return (
    <Dialog
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-[15px] text-ink-muted">{message}</div>
    </Dialog>
  );
}
