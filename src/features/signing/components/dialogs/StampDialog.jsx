import { useEffect, useState } from "react";
import { Button, Dialog } from "@/components/ui";
import { cn } from "@/utils/cn";

/** Pick one of the stamps you may use and apply it. */
export function StampDialog({
  isOpen,
  stamps = [],
  currentMark,
  onApply,
  onRemove,
  onClose,
}) {
  const [stampId, setStampId] = useState(stamps[0]?.id ?? null);

  useEffect(() => {
    if (isOpen) setStampId(currentMark?.sourceId ?? stamps[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const stamp = stamps.find((item) => item.id === stampId);

  return (
    <Dialog
      isOpen={isOpen}
      title="Apply a stamp"
      description="Stamps are managed by LV Sign administrators."
      onClose={onClose}
      footer={
        <>
          {currentMark && (
            <Button variant="danger" className="mr-auto" onClick={onRemove}>
              Remove
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!stamp}
            onClick={() =>
              onApply({
                method: "stamp",
                sourceId: stamp.id,
                imageDataUrl: stamp.imageUrl,
              })
            }
          >
            Apply stamp
          </Button>
        </>
      }
    >
      {stamps.length === 0 ? (
        <p className="rounded-sm border border-dashed border-line-strong px-4 py-6 text-center text-[14px] text-ink-muted">
          No stamps are available to you. Ask an administrator to give you
          access to your department's stamp.
        </p>
      ) : (
        <div
          className="grid gap-3 sm:grid-cols-2"
          role="radiogroup"
          aria-label="Stamps"
        >
          {stamps.map((item) => (
            <label
              key={item.id}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-3 rounded-md border p-4 text-center",
                stampId === item.id
                  ? "border-primary bg-primary-soft/60"
                  : "border-line-strong hover:bg-canvas",
              )}
            >
              <input
                type="radio"
                className="sr-only"
                checked={stampId === item.id}
                onChange={() => setStampId(item.id)}
              />
              <img src={item.imageUrl} alt="" className="size-28" />
              <span className="text-[14px] font-medium text-ink">
                {item.name}
              </span>
            </label>
          ))}
        </div>
      )}
    </Dialog>
  );
}
