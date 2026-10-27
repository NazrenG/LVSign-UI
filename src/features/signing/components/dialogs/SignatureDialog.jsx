import { useEffect, useId, useState } from "react";
import { Button, Dialog, Input, SegmentedControl } from "@/components/ui";
import { cn } from "@/utils/cn";
import { SignatureMark } from "../SignatureMark";
import {
  DEFAULT_SIGNATURE_FONT,
  SIGNATURE_FONTS,
  getSignatureFont,
  loadSignatureFonts,
  toInitials,
} from "../../utils/signatureFonts";
import { SignaturePad } from "./SignaturePad";

const COPY = {
  signature: {
    title: "Adopt your signature",
    noun: "signature",
    adopt: "Adopt and sign",
    savedEmpty:
      "You have no saved signature yet. Signatures you adopt will appear here once saving is available.",
  },
  initials: {
    title: "Adopt your initials",
    noun: "initials",
    adopt: "Adopt and initial",
    savedEmpty: "You have no saved initials yet.",
  },
};

const TABS = [
  { value: "type", label: "Type" },
  { value: "draw", label: "Draw" },
  { value: "saved", label: "Saved" },
];

/**
 * Signature or initials capture: Type, Draw or pick a Saved one.
 * Front-end only for now; the applied mark is returned through onAdopt.
 */
export function SignatureDialog({
  isOpen,
  kind = "signature",
  recipientName,
  saved = [],
  currentMark,
  onAdopt,
  onRemove,
  onClose,
}) {
  const copy = COPY[kind];
  const defaultText =
    kind === "initials" ? toInitials(recipientName) : recipientName;
  const fontGroup = useId();

  const [tab, setTab] = useState("type");
  const [typedText, setTypedText] = useState(defaultText);
  const [fontKey, setFontKey] = useState(DEFAULT_SIGNATURE_FONT);
  const [drawn, setDrawn] = useState(null);
  const [savedId, setSavedId] = useState(saved[0]?.id ?? null);

  // Reset to sensible defaults every time the dialog opens.
  useEffect(() => {
    if (!isOpen) return;
    loadSignatureFonts();
    setTab(
      currentMark?.method === "drawn"
        ? "draw"
        : currentMark?.method === "saved"
          ? "saved"
          : "type",
    );
    setTypedText(currentMark?.typedText ?? defaultText);
    setFontKey(currentMark?.fontKey ?? DEFAULT_SIGNATURE_FONT);
    setDrawn(null);
    setSavedId(currentMark?.sourceId ?? saved[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const savedMark = saved.find((item) => item.id === savedId);
  const mark =
    tab === "type"
      ? typedText.trim() && {
          method: "typed",
          typedText: typedText.trim(),
          fontKey,
        }
      : tab === "draw"
        ? drawn && { method: "drawn", imageDataUrl: drawn }
        : savedMark && {
            ...savedMark,
            method: "saved",
            sourceId: savedMark.id,
          };

  return (
    <Dialog
      isOpen={isOpen}
      title={copy.title}
      onClose={onClose}
      footer={
        <div className="flex w-full flex-col gap-3">
          <p className="text-[12.5px] text-ink-muted">
            By selecting {copy.adopt}, you agree that this electronic{" "}
            {copy.noun} represents your {copy.noun}.
          </p>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {currentMark && (
              <Button variant="danger" className="mr-auto" onClick={onRemove}>
                Remove
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onAdopt(mark)} disabled={!mark}>
              {copy.adopt}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <SegmentedControl
          label={`How to create your ${copy.noun}`}
          options={TABS}
          value={tab}
          onChange={setTab}
        />

        {tab === "type" && (
          <div className="space-y-4">
            <Input
              label={kind === "initials" ? "Initials" : "Full name"}
              value={typedText}
              maxLength={kind === "initials" ? 4 : 80}
              onChange={(event) => setTypedText(event.target.value)}
            />
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-ink">
                Style
              </legend>
              <div className="grid gap-2">
                {SIGNATURE_FONTS.map((font) => (
                  <label
                    key={font.key}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-sm border px-3 py-2 transition-colors",
                      fontKey === font.key
                        ? "border-primary bg-primary-soft/60"
                        : "border-line-strong hover:bg-canvas",
                    )}
                  >
                    <input
                      type="radio"
                      name={fontGroup}
                      checked={fontKey === font.key}
                      onChange={() => setFontKey(font.key)}
                      className="size-4 accent-primary"
                    />
                    <span
                      className="min-w-0 flex-1 truncate leading-[1.3] text-primary"
                      style={{
                        fontFamily: getSignatureFont(font.key).family,
                        fontSize: 30,
                      }}
                    >
                      {typedText.trim() || defaultText}
                    </span>
                    <span className="text-[12px] text-ink-muted">
                      {font.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {tab === "draw" && (
          <SignaturePad
            onChange={setDrawn}
            label={
              kind === "initials" ? "Draw your initials" : "Draw your signature"
            }
            heightClass={kind === "initials" ? "h-36" : "h-44"}
          />
        )}

        {tab === "saved" &&
          (saved.length ? (
            <div
              className="grid gap-2"
              role="radiogroup"
              aria-label={`Saved ${copy.noun}`}
            >
              {saved.map((item) => (
                <label
                  key={item.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-sm border px-3 py-3",
                    savedId === item.id
                      ? "border-primary bg-primary-soft/60"
                      : "border-line-strong hover:bg-canvas",
                  )}
                >
                  <input
                    type="radio"
                    checked={savedId === item.id}
                    onChange={() => setSavedId(item.id)}
                    className="size-4 accent-primary"
                  />
                  <span className="h-10 min-w-0 flex-1 overflow-hidden">
                    <SignatureMark mark={item} fontPx={30} />
                  </span>
                  <span className="text-[12px] text-ink-muted">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="rounded-sm border border-dashed border-line-strong px-4 py-6 text-center text-[14px] text-ink-muted">
              {copy.savedEmpty}
            </p>
          ))}
      </div>
    </Dialog>
  );
}
