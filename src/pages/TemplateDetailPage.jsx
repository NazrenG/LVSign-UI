import { useParams } from "react-router-dom";
import { StatGroup } from "@/components/ui";
import {
  ApprovalChainCard,
  FormFieldsTable,
  PrefillForm,
  TemplateDetailHeader,
  TemplateSettingsSummary,
} from "@/features/templates";
import { templatesService } from "@/services/templatesService";
import { NotFoundPage } from "./NotFoundPage";

export function TemplateDetailPage() {
  const { templateId } = useParams();
  const template = templatesService.get(templateId);

  if (!template) return <NotFoundPage />;

  const { stats } = template;

  return (
    <>
      <TemplateDetailHeader template={template} />
      <StatGroup
        className="mb-7"
        stats={[
          {
            label: "Avg. completion time",
            value: `${stats.avgCompletionDays} days`,
          },
          { label: "Times used", value: stats.timesUsed },
          {
            label: "Completed before expiry",
            value: `${stats.completedBeforeExpiry}%`,
          },
          { label: "Signer roles", value: template.roles.length },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <ApprovalChainCard template={template} />
          <FormFieldsTable template={template} />
          <TemplateSettingsSummary template={template} />
        </div>
        {/* key: reset the form when navigating between templates */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <PrefillForm key={template.id} template={template} />
        </aside>
      </div>
    </>
  );
}
