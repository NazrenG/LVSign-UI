import { useParams } from "react-router-dom";
import { StatGroup } from "@/components/ui";
import {
  ApprovalChainCard,
  FormFieldsTable,
  PrefillForm,
  TemplateDetailHeader,
  TemplateSettingsSummary,
} from "@/features/templates";
import { NotFoundPage } from "./NotFoundPage";
import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui";
import { templateRepository } from "@/features/templates";

export function TemplateDetailPage() {
  const { templateId } = useParams();

  const [template, setTemplate] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadTemplate() {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);

        const result = await templateRepository.getFullDetail(templateId);

        if (cancelled) {
          return;
        }

        if (!result) {
          setNotFound(true);
          return;
        }

        setTemplate(result);
      } catch (error) {
        console.error("Template detail load failed:", error);

        if (!cancelled) {
          setError(error.message || "Template could not be loaded.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTemplate();

    return () => {
      cancelled = true;
    };
  }, [templateId]);

  if (loading) {
    return (
      <div className="rounded-md border border-line bg-surface px-6 py-16 text-center text-ink-muted">
        Loading template...
      </div>
    );
  }

  if (notFound) {
    return <NotFoundPage />;
  }

  if (error) {
    return (
      <div className="rounded-md border border-danger/30 bg-danger/5 px-6 py-16 text-center text-danger">
        {error}
      </div>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <>
      <TemplateDetailHeader template={template} />

      <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Version" value={`v${template.latestVersionNumber}`} />

        <InfoCard label="Status" value={formatStatus(template.status)} />

        <InfoCard label="Recipient roles" value={template.roles.length} />

        <InfoCard label="Documents" value={template.documents.length} />
      </div>

      <div className="space-y-6">
        <ApprovalChainCard template={template} />

        <FormFieldsTable template={template} />

        <DocumentsCard documents={template.documents} />
      </div>
    </>
  );
}

function formatStatus(status) {
  if (!status) {
    return "Draft";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function InfoCard({ label, value }) {
  return (
    <Card className="p-5">
      <p className="text-[13px] text-ink-muted">{label}</p>

      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
    </Card>
  );
}

function DocumentsCard({ documents }) {
  return (
    <Card className="p-5 sm:p-6">
      <CardHeader
        title="Documents"
        description={`${documents.length} document${documents.length === 1 ? "" : "s"} in this template version`}
      />

      {documents.length === 0 ? (
        <p className="text-[15px] text-ink-muted">
          No documents have been added.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div>
                <p className="text-[15px] font-medium text-ink">
                  {document.name}
                </p>

                <p className="mt-0.5 text-[13px] text-ink-muted">
                  {document.pageCount
                    ? `${document.pageCount} pages`
                    : "Page count unavailable"}
                </p>
              </div>

              <span className="text-xs text-ink-muted">#{document.order}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
