import { useId, useRef, useState } from "react";
import { ImageUp } from "lucide-react";
import { Button } from "@/components/ui";
import { STAMP_IMAGE_MAX_BYTES, STAMP_IMAGE_TYPES } from "../../adminConstants";
import { StampPreview } from "./StampPreview";

/**
 * Local image picker with preview. The file is only read in the browser
 * (object URL) — nothing is uploaded or processed.
 */
export function StampImageField({ value, onChange, error }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [fileError, setFileError] = useState("");
  const [meta, setMeta] = useState(null); // { name, size, width, height }

  const handleFile = (file) => {
    if (!file) return;
    if (!STAMP_IMAGE_TYPES.includes(file.type)) {
      setFileError("Choose a PNG (recommended) or JPG image.");
      return;
    }
    if (file.size > STAMP_IMAGE_MAX_BYTES) {
      setFileError("The image is larger than 2 MB. Choose a smaller file.");
      return;
    }
    setFileError("");
    setMeta({ name: file.name, size: file.size });
    onChange(URL.createObjectURL(file));
  };

  const shownError = fileError || error;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-medium text-ink"
      >
        Stamp image
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={STAMP_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
        aria-describedby={`${inputId}-hint`}
        aria-invalid={Boolean(shownError)}
      />

      {value ? (
        <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
          <StampPreview
            src={value}
            alt="Stamp preview"
            className="h-44"
            onLoad={(event) => {
              // Read now: currentTarget is null once the event has finished.
              const { naturalWidth: width, naturalHeight: height } =
                event.currentTarget;
              setMeta((current) => ({ ...current, width, height }));
            }}
          />
          <div className="space-y-2 text-[13px] text-ink-muted">
            {meta?.name && (
              <p className="truncate font-medium text-ink">{meta.name}</p>
            )}
            {meta?.width > 0 && (
              <p className="font-mono">
                {meta.width} × {meta.height} px
                {meta.size
                  ? ` · ${Math.max(1, Math.round(meta.size / 1024))} KB`
                  : ""}
              </p>
            )}
            <p>Shown exactly as uploaded — not cropped or resized.</p>
            <Button
              variant="secondary"
              size="sm"
              icon={ImageUp}
              onClick={() => inputRef.current?.click()}
            >
              Replace image
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFile(event.dataTransfer.files?.[0]);
          }}
          className="flex w-full flex-col items-center gap-2 rounded-md border border-dashed border-line-strong bg-canvas px-6 py-8 text-center hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ImageUp
            className="size-6 text-ink-muted"
            strokeWidth={1.5}
            aria-hidden
          />
          <span className="text-[15px] font-medium text-ink">
            Choose an image
          </span>
          <span className="text-[13px] text-ink-muted">or drag it here</span>
        </button>
      )}

      <p id={`${inputId}-hint`} className="mt-1.5 text-[13px] text-ink-muted">
        PNG with a transparent background works best. JPG is accepted. Max 2 MB.
        The image stays in this browser — it isn't uploaded.
      </p>
      {shownError && (
        <p role="alert" className="mt-1.5 text-[13px] text-danger">
          {shownError}
        </p>
      )}
    </div>
  );
}
