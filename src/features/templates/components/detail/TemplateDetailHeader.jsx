import { Copy, PenLine } from "lucide-react";

import { Link } from "react-router-dom";

import { Breadcrumbs, Button } from "@/components/ui";

import { ROUTES } from "@/constants/routes";

import { formatDayMonthYear } from "@/utils/formatters";

import { CategoryLabel } from "../list/CategoryLabel";

export function TemplateDetailHeader({ template }) {
  const canEdit =
    template.isOwner ||
    ["edit", "manage"].includes(template.effectiveAccessLevel);

  return (
    <header className="mb-6">
      <Breadcrumbs
        items={[
          {
            label: "Templates",
            to: ROUTES.templates,
          },
          ...(template.category
            ? [
                {
                  label: template.category,
                },
              ]
            : []),
          {
            label: template.name,
          },
        ]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="font-serif text-3xl text-ink sm:text-[34px]">
              {template.name}
            </h1>

            {template.category && (
              <CategoryLabel category={template.category} />
            )}
          </div>

          {template.description && (
            <p className="mt-2 text-[15px] text-ink-muted">
              {template.description}
            </p>
          )}

          <p className="mt-1 font-mono text-[13px] text-ink-muted">
            Version {template.latestVersionNumber}
            {template.updatedAt &&
              ` · updated ${formatDayMonthYear(template.updatedAt)}`}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <Button
            as={Link}
            to={`${ROUTES.templateBuilder("new")}?duplicate=${template.id}`}
            variant="ghost"
            icon={Copy}
          >
            Duplicate
          </Button>

          {canEdit && (
            <Button
              as={Link}
              to={ROUTES.templateBuilder(template.id)}
              variant="secondary"
              icon={PenLine}
            >
              Edit template
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
