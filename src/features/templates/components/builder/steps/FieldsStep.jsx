import { useState } from "react";
import { AddFieldsPanel } from "../fields/AddFieldsPanel";
import { DocumentFieldPreview } from "../fields/DocumentFieldPreview";
import { FieldGroupsList } from "../fields/FieldGroupsList";
import { SelectedFieldPanel } from "../fields/SelectedFieldPanel";

const initialSelection = (template) =>
  (
    template.fields.find((field) => field.type === "dropdown") ??
    template.fields[0]
  )?.id ?? null;

/**
 * Three columns on wide screens: field list · document · editing panels.
 * The field list is hidden below xl; panels drop under the document below lg.
 */
export function FieldsStep({ template, actions }) {
  const [selectedId, setSelectedId] = useState(() =>
    initialSelection(template),
  );
  const selectedField = template.fields.find(
    (field) => field.id === selectedId,
  );

  const handleAdd = (fieldType, filledBy) => {
    setSelectedId(actions.addField(fieldType, filledBy));
  };

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[260px_minmax(0,1fr)_380px]">
      <aside className="hidden border-r border-line px-6 py-8 xl:block">
        <FieldGroupsList
          template={template}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </aside>

      <section aria-label="Document" className="min-w-0 px-4 py-8 sm:px-8">
        <DocumentFieldPreview
          template={template}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </section>

      <aside className="space-y-4 border-line px-4 pb-8 sm:px-8 lg:border-l lg:px-6 lg:py-8">
        <AddFieldsPanel template={template} onAdd={handleAdd} />
        <SelectedFieldPanel
          field={selectedField}
          template={template}
          actions={actions}
        />
      </aside>
    </div>
  );
}
