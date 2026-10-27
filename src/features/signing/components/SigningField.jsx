import { formatDayMonthYear } from "@/utils/formatters";
import {
  isAutoField,
  isFieldComplete,
  getFieldProblem,
} from "../utils/fieldValues";
import { CheckboxField } from "./fields/CheckboxField";
import { DropdownField, RadioField } from "./fields/ChoiceField";
import { fieldBoxClass } from "./fields/fieldStyles";
import { InputField } from "./fields/InputField";
import { MarkField } from "./fields/MarkField";
import { SignatureMark, fitSignatureFont } from "./SignatureMark";

const percent = (value) => `${value * 100}%`;
const position = (field) => ({
  left: percent(field.x),
  top: percent(field.y),
  width: percent(field.width),
  height: percent(field.height),
});

/** Font size that fits the box at the current zoom (10–16 px). */
const fontFor = (boxHeightPx) => Math.min(16, Math.max(10, boxHeightPx * 0.58));

/**
 * Another recipient's completed field: shown quietly, never interactive.
 * Empty fields of other recipients are not rendered at all.
 */
function OtherRecipientField({ field, pageWidthPx, pageHeightPx }) {
  const boxHeightPx = field.height * pageHeightPx;
  return (
    <div
      className="pointer-events-none absolute flex items-center overflow-hidden"
      style={position(field)}
      title={`${field.label} · ${field.recipientName}`}
    >
      {typeof field.value === "object" ? (
        <SignatureMark
          mark={field.value}
          fontPx={fitSignatureFont(
            field.value.typedText,
            field.width * pageWidthPx,
            boxHeightPx,
            0.85,
          )}
          className="text-ink/80"
        />
      ) : (
        <span
          className="truncate px-1 text-ink"
          style={{ fontSize: fontFor(boxHeightPx) }}
        >
          {String(field.value)}
        </span>
      )}
    </div>
  );
}

/**
 * One field on a page, positioned from normalized coordinates (so it stays
 * put at any zoom). Fixed in place: the recipient can fill it, never move it.
 */
export function SigningField({
  field,
  value,
  isActive,
  pageWidthPx,
  pageHeightPx,
  onActivate,
  onChange,
  onOpenMark,
}) {
  if (!field.isMine) {
    return field.value != null ? (
      <OtherRecipientField
        field={field}
        pageWidthPx={pageWidthPx}
        pageHeightPx={pageHeightPx}
      />
    ) : null;
  }

  const boxHeightPx = field.height * pageHeightPx;
  const isAuto = isAutoField(field);
  const isComplete = isFieldComplete(field, value);
  const problem = getFieldProblem(field, value);
  const focus = () => onActivate(field.id);
  const common = { field, value, onFocus: focus, onChange };

  let control;
  switch (field.fieldType) {
    case "signature":
    case "initials":
    case "stamp":
      control = (
        <MarkField
          {...common}
          boxWidthPx={field.width * pageWidthPx}
          boxHeightPx={boxHeightPx}
          onOpen={() => onOpenMark(field)}
        />
      );
      break;
    case "checkbox":
      control = <CheckboxField {...common} />;
      break;
    case "radio":
      control = <RadioField {...common} />;
      break;
    case "dropdown":
      control = <DropdownField {...common} />;
      break;
    case "dateSigned":
      control = (
        <span
          className="flex size-full items-center px-1.5 text-ink-muted"
          title="Filled in automatically when you finish"
        >
          {value ? formatDayMonthYear(value) : ""}
        </span>
      );
      break;
    default:
      control = <InputField {...common} />;
  }

  return (
    <div
      data-field-id={field.id}
      className={fieldBoxClass({
        isRequired: field.isRequired,
        isComplete: isComplete && !problem,
        isActive,
        isAuto,
      })}
      style={{ ...position(field), fontSize: fontFor(boxHeightPx) }}
    >
      {isActive && !isComplete && !isAuto && (
        <span className="pointer-events-none absolute -top-2.5 left-1.5 z-10 rounded-sm bg-primary px-1 py-px text-[10px] leading-tight font-medium whitespace-nowrap text-white">
          {field.isRequired ? "Required" : "Optional"} · {field.label}
        </span>
      )}
      {isActive && problem && (
        <span
          role="alert"
          className="pointer-events-none absolute top-full left-0 mt-1 rounded-sm bg-danger px-1.5 py-px text-[11px] font-medium whitespace-nowrap text-white"
        >
          {problem}
        </span>
      )}
      {control}
    </div>
  );
}
