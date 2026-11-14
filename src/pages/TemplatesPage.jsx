import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/layout";
import { Button, SearchInput, SectionHeading, Select } from "@/components/ui";

import { ROUTES } from "@/constants/routes";

import {
  CategoryFilter,
  PAGE_SIZE,
  SORT_OPTIONS,
  TEMPLATE_CATEGORIES,
  TemplateCard,
  countByCategory,
  filterTemplates,
  sortTemplates,
  templateRepository,
} from "@/features/templates";

import { pluralize } from "@/utils/formatters";

export function TemplatesPage() {
  const [scope, setScope] = useState("all");

  const [templates, setTemplates] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [category, setCategory] = useState("all");

  const [query, setQuery] = useState("");

  const [sortKey, setSortKey] = useState("recent");

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;

    async function loadTemplates() {
      try {
        setLoading(true);
        setError(null);

        let result;

        switch (scope) {
          case "mine":
            result = await templateRepository.listMine();
            break;

          case "shared":
            result = await templateRepository.listSharedWithMe();
            break;

          default:
            result = await templateRepository.listAll();
            break;
        }

        if (!cancelled) {
          setTemplates(result);
          setVisibleCount(PAGE_SIZE);
        }
      } catch (error) {
        console.error("Templates load failed:", error);

        if (!cancelled) {
          setError(error.message || "Templates could not be loaded.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTemplates();

    return () => {
      cancelled = true;
    };
  }, [scope]);

  const results = sortTemplates(
    filterTemplates(templates, {
      category,
      query,
    }),
    sortKey,
  );

  const visible = results.slice(0, visibleCount);

  const remaining = results.length - visible.length;

  const isFiltering = category !== "all" || query.trim() !== "";

  const resetPaging = (setter) => (value) => {
    setter(value);

    setVisibleCount(PAGE_SIZE);
  };

  const handleScopeChange = (nextScope) => {
    setScope(nextScope);

    /*
     * Scope dəyişəndə köhnə
     * category/search paging state-i
     * reset edirik.
     */
    setCategory("all");
    setQuery("");
    setVisibleCount(PAGE_SIZE);
  };

  const sectionTitle =
    scope === "mine"
      ? "My templates"
      : scope === "shared"
        ? "Shared with me"
        : "All templates";

  return (
    <>
      <PageHeader
        title="Templates"
        subtitle={`${pluralize(
          templates.length,
          "template",
        )} · create and reuse approval workflows`}
        actions={
          <>
            <SearchInput
              placeholder="Search templates"
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
        {/* Scope */}

        <div className="border-b border-line pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              {
                value: "all",
                label: "All templates",
              },
              {
                value: "mine",
                label: "My templates",
              },
              {
                value: "shared",
                label: "Shared with me",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleScopeChange(option.value)}
                className={
                  scope === option.value
                    ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
                    : "rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas-muted hover:text-ink"
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CategoryFilter
            value={category}
            counts={countByCategory(templates)}
            onChange={resetPaging(setCategory)}
          />

          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-sm text-ink-muted">
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

        {/* List */}

        <section>
          <SectionHeading
            title={isFiltering ? "Results" : sectionTitle}
            description={
              loading
                ? "Loading templates..."
                : `Showing ${visible.length} of ${results.length}`
            }
          />

          {loading ? (
            <div className="rounded-md border border-line bg-surface px-6 py-12 text-center text-ink-muted">
              Loading templates...
            </div>
          ) : error ? (
            <div className="rounded-md border border-danger/30 bg-danger/5 px-6 py-12 text-center text-danger">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-md border border-dashed border-line-strong px-6 py-12 text-center text-ink-muted">
              {isFiltering
                ? `No templates match “${query}”.`
                : scope === "mine"
                  ? "You do not have any templates yet."
                  : scope === "shared"
                    ? "No templates have been shared with you."
                    : "No templates are available."}
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visible.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>

              {remaining > 0 && (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setVisibleCount((count) => count + PAGE_SIZE)
                    }
                  >
                    Show{" "}
                    {pluralize(Math.min(remaining, PAGE_SIZE), "more template")}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
