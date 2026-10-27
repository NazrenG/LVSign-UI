import { CaseUpper, PenLine, Stamp } from "lucide-react";
import { cn } from "@/utils/cn";
import { SignatureMark, fitSignatureFont } from "../SignatureMark";
import { TOUCH_TARGET } from "./fieldStyles";

const EMPTY = {
  signature: { icon: PenLine, text: "Sign" },
  initials: { icon: CaseUpper, text: "Initial" },
  stamp: { icon: Stamp, text: "Stamp" },
};

/** Signature / initials / stamp: a button that opens the matching dialog. */
export function MarkField({
  field,
  value,
  boxWidthPx,
  boxHeightPx,
  onOpen,
  onFocus,
}) {
  const { icon: Icon, text } = EMPTY[field.fieldType];
  return (
    <button
      type="button"
      onClick={onOpen}
      onFocus={onFocus}
      aria-label={
        value
          ? `${field.label} — applied, select to change`
          : `${field.label} — select to ${text.toLowerCase()}`
      }
      className={cn(
        "relative flex size-full items-center justify-center gap-1.5 overflow-hidden px-1.5 focus:outline-none",
        TOUCH_TARGET,
      )}
    >
      {value ? (
        <SignatureMark
          mark={value}
          fontPx={fitSignatureFont(
            value.typedText,
            boxWidthPx - 12,
            boxHeightPx,
          )}
        />
      ) : (
        <>
          <Icon
            className="size-[1.1em] shrink-0 text-primary"
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="truncate font-medium text-primary">{text}</span>
        </>
      )}
    </button>
  );
}
