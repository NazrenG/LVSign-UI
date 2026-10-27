import { Link } from "react-router-dom";
import { Card, IconTile, SectionHeading } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { getCategory } from "../../templateConstants";

export function FrequentlyUsedTemplates({ templates }) {
  return (
    <section>
      <SectionHeading
        title="My Templates"
        description="Based on the last 30 days"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            as={Link}
            to={ROUTES.templateDetail(template.id)}
            className="flex items-center gap-4 p-4 transition-colors hover:border-line-strong hover:shadow-sm"
          >
            <IconTile
              icon={getCategory(template.category).icon}
              className="size-10 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-ink">
                {template.name}
              </p>
              <p className="text-[13px] text-ink-muted">
                {template.category} · {template.stats.usesThisMonth} uses this
                month
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
