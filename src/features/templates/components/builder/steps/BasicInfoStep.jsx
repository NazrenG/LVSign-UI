import { FileText, User } from "lucide-react";
import {
  Card,
  Input,
  NoteCard,
  OptionButtons,
  Select,
  Textarea,
} from "@/components/ui";
import { PEOPLE } from "@/data/people";
import { TEMPLATE_CATEGORIES } from "../../../templateConstants";
import { AccessPermissionsCard } from "../basic/AccessPermissionsCard";
import { AudienceSummaryCard } from "../basic/AudienceSummaryCard";
import { BuilderStepLayout } from "../BuilderStepLayout";

const LANGUAGES = ["English", "Azərbaycan", "Русский"];

const TIPS = [
  "Use a sentence-case name people will search for.",
  "The document ID prefix cannot be changed after the first document is sent.",
  "Untick “Can use” for teams that never send this document.",
];

export function BasicInfoStep({ template, actions }) {
  const owner = PEOPLE[template.ownerId];
  const setValue = (key) => (event) =>
    actions.update({ [key]: event.target.value });
  const isPrefixLocked = template.version > 0;

  return (
    <BuilderStepLayout
      title="Basic info"
      description="Name the template, choose where it lives and who is allowed to use or change it."
      aside={
        <>
          <AudienceSummaryCard access={template.access} />
          <NoteCard title="Before you continue" items={TIPS} />
        </>
      }
    >
      <Card className="space-y-5 p-5 sm:p-6">
        <Input
          label="Template name"
          value={template.name}
          onChange={setValue("name")}
          required
        />
        <Textarea
          label="Description"
          value={template.description}
          onChange={setValue("description")}
          hint="Shown on the template card and to people choosing a template."
        />
        <OptionButtons
          legend="Category"
          options={TEMPLATE_CATEGORIES}
          value={template.category}
          onChange={(category) => actions.update({ category })}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Document ID prefix"
            value={template.docPrefix}
            onChange={(event) =>
              actions.update({ docPrefix: event.target.value.toUpperCase() })
            }
            readOnly={isPrefixLocked}
            className="font-mono text-sm"
            hint={
              template.docPrefix
                ? `Documents are numbered ${template.docPrefix}-2026-0001, -0002 …`
                : "For example HR-LEAVE"
            }
          />
          <Select
            label="Language"
            options={LANGUAGES}
            value={template.language}
            onChange={setValue("language")}
          />
          <Input
            label="Owner"
            icon={User}
            value={owner ? `${owner.name} · ${owner.department}` : ""}
            readOnly
            hint="Gets notified when the template fails or expires."
          />
          <Input
            label="Source document"
            icon={FileText}
            value={template.sourceDocument.name}
            suffix={`${template.sourceDocument.pages} pages`}
            readOnly
          />
        </div>
      </Card>

      <AccessPermissionsCard template={template} actions={actions} />
    </BuilderStepLayout>
  );
}
