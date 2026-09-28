import { PenLine, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { RoleChain } from "@/components/shared";
import { Button, Card } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { formatDayMonthYear } from "@/utils/formatters";
import { getRoleChainItems } from "../../templateSelectors";
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

export function TemplateCard({ template }) {
  const { stats } = template;

  return (
    <Card as="article" className="flex flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <CategoryLabel category={template.category} />
        <RoleChain items={getRoleChainItems(template)} connectorTone="light" />
      </div>

      <h3 className="mt-4 font-serif text-xl text-ink">
        <Link
          to={ROUTES.templateDetail(template.id)}
          className="hover:text-primary"
        >
          {template.name}
        </Link>
      </h3>
      <p className="mt-2 mb-5 text-[15px] text-ink-muted">
        {template.description}
      </p>

      <dl className="mt-auto grid grid-cols-3 gap-3 border-y border-line py-4">
        <CardStat
          label="Avg. completion"
          value={`${stats.avgCompletionDays} days`}
        />
        <CardStat label="Times used" value={stats.timesUsed} />
        <CardStat
          label="Updated"
          value={formatDayMonthYear(template.updatedAt)}
          mono
        />
      </dl>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button
          as={Link}
          to={ROUTES.templateBuilder(template.id)}
          variant="ghost"
          icon={PenLine}
          className="-ml-3"
        >
          Edit template
        </Button>
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
