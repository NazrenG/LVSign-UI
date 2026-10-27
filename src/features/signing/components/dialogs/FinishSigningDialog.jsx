import { Button, Dialog } from "@/components/ui";
import { pluralize } from "@/utils/formatters";

export function FinishSigningDialog({
  isOpen,
  session,
  progress,
  isSubmitting,
  error,
  onConfirm,
  onClose,
}) {
  const rows = [
    ["Documents", pluralize(session.documents.length, "document")],
    [
      "Required fields",
      `${progress.completedCount} of ${progress.requiredCount} completed`,
    ],
    ...(progress.optionalRemainingCount
      ? [["Optional fields", `${progress.optionalRemainingCount} left empty`]]
      : []),
  ];

  return (
    <Dialog
      isOpen={isOpen}
      title="Finish signing?"
      onClose={isSubmitting ? () => {} : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Keep reviewing
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Finish signing"}
          </Button>
        </>
      }
    >
      <p className="text-[15px] text-ink">
        Confirm that all required fields are complete and that you are ready to
        submit your response.
      </p>
      <dl className="mt-4 divide-y divide-line rounded-sm border border-line">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-4 px-3.5 py-2.5 text-[14px]"
          >
            <dt className="text-ink-muted">{label}</dt>
            <dd className="text-right font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      {error && (
        <p role="alert" className="mt-4 text-[14px] text-danger">
          {error.message}
        </p>
      )}
    </Dialog>
  );
}
