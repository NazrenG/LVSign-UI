import { useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout";
import { Button, SearchInput, SectionHeading, Select } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import {
  CategoryFilter,
  FrequentlyUsedTemplates,
  PAGE_SIZE,
  SORT_OPTIONS,
  TEMPLATE_CATEGORIES,
  TemplateCard,
  countByCategory,
  filterTemplates,
  getFrequentlyUsed,
  sortTemplates,
} from "@/features/templates";
import { templatesService } from "@/services/templatesService";
import { pluralize } from "@/utils/formatters";

export function TemplatesPage() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("mostUsed");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const templates = templatesService.list();
  const results = sortTemplates(
    filterTemplates(templates, { category, query }),
    sortKey,
  );
  const visible = results.slice(0, visibleCount);
  const remaining = results.length - visible.length;
  const isFiltering = category !== "all" || query.trim() !== "";

  // Changing a filter starts the list from the top again.
  const resetPaging = (setter) => (value) => {
    setter(value);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <>
      <PageHeader
        title="Templates"
        subtitle={`${pluralize(templates.length, "template")} in ${TEMPLATE_CATEGORIES.length} categories · approval routes and fields are set once, then reused`}
        actions={
          <>
            <SearchInput
              placeholder="Search templates, fields or roles"
              value={query}
              onChange={(event) => resetPaging(setQuery)(event.target.value)}
              className="w-full sm:w-80"
            />
            <Button as={Link} to={ROUTES.templateBuilder("new")} icon={Plus}>
              Create template
            </Button>
          </>
        }
      />

      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CategoryFilter
            value={category}
            counts={countByCategory(templates)}
            onChange={resetPaging(setCategory)}
          />
          <div className="flex items-center gap-3">
            <span className="text-sm whitespace-nowrap text-ink-muted">
              Sort by
            </span>
            <Select
              aria-label="Sort templates"
              options={SORT_OPTIONS}
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value)}
              wrapperClassName="w-full sm:w-44"
            />
          </div>
        </div>

        {!isFiltering && (
          <FrequentlyUsedTemplates templates={getFrequentlyUsed(templates)} />
        )}

        <section>
          <SectionHeading
            title={isFiltering ? "Results" : "Share with me"}
            description={`Showing ${visible.length} of ${results.length}`}
            action={
              <span className="hidden text-[13px] text-ink-muted md:block">
                Initials on each card are the signer roles, in signing order
              </span>
            }
          />

          {results.length === 0 ? (
            <p className="rounded-md border border-dashed border-line-strong px-6 py-12 text-center text-ink-muted">
              No templates match “{query}”.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}

          {remaining > 0 && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="secondary"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                Show{" "}
                {pluralize(Math.min(remaining, PAGE_SIZE), "more template")}
              </Button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
