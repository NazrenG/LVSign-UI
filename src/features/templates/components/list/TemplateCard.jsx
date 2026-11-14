import { FileText, PenLine, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Card } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { formatDayMonthYear } from "@/utils/formatters";
import { CategoryLabel } from "./CategoryLabel";

function CardStat({ label, value, mono = false }) {
  return (
    <div>
      <dt className="text-[13px] text-ink-muted">{label}</dt>

      <dd
        className={
          mono
            ? "mt-0.5 font-mono text-sm text-ink"
            : "mt-0.5 font-medium text-ink"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function formatStatus(status) {
  if (!status) {
    return "Draft";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function TemplateCard({ template }) {
  const canEdit =
    template.isOwner ||
    ["edit", "manage"].includes(template.effectiveAccessLevel);

  return (
    <Card as="article" className="flex flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        {template.category ? (
          <CategoryLabel category={template.category} />
        ) : (
          <span className="flex items-center gap-1.5 text-[13px] text-ink-muted">
            <FileText className="size-4" strokeWidth={1.5} />
            Template
          </span>
        )}

        <span className="rounded-full bg-canvas-muted px-2.5 py-1 text-xs font-medium text-ink-muted">
          {formatStatus(template.status)}
        </span>
      </div>

      <h3 className="mt-4 font-serif text-xl text-ink">
        <Link
          to={ROUTES.templateDetail(template.id)}
          className="hover:text-primary"
        >
          {template.name}
        </Link>
      </h3>

      <p className="mt-2 mb-5 line-clamp-3 text-[15px] text-ink-muted">
        {template.description || "No description provided."}
      </p>

      <dl className="mt-auto grid grid-cols-3 gap-3 border-y border-line py-4">
        <CardStat label="Version" value={`v${template.latestVersionNumber}`} />

        <CardStat
          label="Access"
          value={template.isOwner ? "Owner" : template.effectiveAccessLevel}
        />

        <CardStat
          label="Updated"
          value={
            template.updatedAt ? formatDayMonthYear(template.updatedAt) : "—"
          }
          mono
        />
      </dl>

      <div className="mt-4 flex items-center justify-between gap-3">
        {canEdit ? (
          <Button
            as={Link}
            to={ROUTES.templateBuilder(template.id)}
            variant="ghost"
            icon={PenLine}
            className="-ml-3"
          >
            Edit template
          </Button>
        ) : (
          <div />
        )}

        <Button
          as={Link}
          to={ROUTES.templateDetail(template.id)}
          variant="secondary"
          icon={Send}
        >
          Use template
        </Button>
      </div>
    </Card>
  );
}
