import { EnvelopeDetailsCard } from "./EnvelopeDetailsCard";
import { FieldPaletteCard } from "./FieldPaletteCard";
import { FieldPropertiesCard } from "./FieldPropertiesCard";
import { RecipientsCard } from "./RecipientsCard";
import { RoutingSummaryCard } from "./RoutingSummaryCard";
import { SendChecklistCard } from "./SendChecklistCard";


export function EditorSidePanel({
  editor,
  colorsById,
  currentPage,
  onEditRecipient,
  onIssueSelect,
  onFieldPlaced,
}) {
  const {
    envelope,
    actions,
    commands,
    selectedField,
    fieldOwners,
    activeRecipient,
    activeDocument,
    checks,
  } = editor;

  const recipientsCard = (
    <RecipientsCard
      envelope={envelope}
      colorsById={colorsById}
      activeRecipient={activeRecipient}
      actions={actions}
      commands={commands}
      onEditRecipient={onEditRecipient}
    />
  );
  const paletteCard = (
    <FieldPaletteCard
      fieldOwners={fieldOwners}
      activeRecipient={activeRecipient}
      activeDocument={activeDocument}
      currentPage={currentPage}
      colorsById={colorsById}
      commands={commands}
      onPlaced={onFieldPlaced}
    />
  );

  // A selected field's properties come first, so they are visible without scrolling.
  if (selectedField) {
    return (
      <div className="space-y-4">
        <FieldPropertiesCard
          envelope={envelope}
          field={selectedField}
          fieldOwners={fieldOwners}
          actions={actions}
          commands={commands}
        />
        {paletteCard}
        {recipientsCard}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recipientsCard}
      {paletteCard}
      <SendChecklistCard checks={checks} onIssueSelect={onIssueSelect} />
      <EnvelopeDetailsCard envelope={envelope} actions={actions} />
      <RoutingSummaryCard envelope={envelope} commands={commands}/>
    </div>
  );
}
