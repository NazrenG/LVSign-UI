import { useMemo, useState } from "react";
import { ListFilter, Send } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout";
import { Button, SearchInput } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { AGREEMENTS } from "@/data/agreements";
import {
  AgreementDetailPanel,
  AgreementsTable,
  StatusTabs,
  countByStatus,
  filterAgreements,
} from "@/features/agreements";
import { useIsAtLeast } from "@/hooks/useMediaQuery";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { cn } from "@/utils/cn";

export function AgreementsPage() {
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useIsAtLeast("2xl");

  // Desktop shows the first document by default; smaller screens open the panel on tap only.
  const selectedId =
    searchParams.get("selected") ?? (isDesktop ? AGREEMENTS[0]?.id : null);
  const selectedAgreement = AGREEMENTS.find(
    (agreement) => agreement.id === selectedId,
  );
  const isDrawerOpen = Boolean(selectedAgreement) && !isDesktop;
  useLockBodyScroll(isDrawerOpen);

  const counts = useMemo(() => countByStatus(AGREEMENTS), []);
  const visibleAgreements = filterAgreements(AGREEMENTS, { status, query });

  const selectAgreement = (id) =>
    setSearchParams({ selected: id }, { replace: true });
  // An empty value (not a missing one) means "closed", so desktop doesn't fall back to the first row.
  const closeDetails = () =>
    setSearchParams({ selected: "" }, { replace: true });

  return (
    <>
      <PageHeader
        title="Agreements"
        actions={
          <>
            <SearchInput
              placeholder="Search by name or ID"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full sm:w-80"
            />
            <Button variant="secondary" icon={ListFilter}>
              Filter
            </Button>
            <Button as={Link} to={ROUTES.editDocument("new")} icon={Send}>
              Send a document
            </Button>
          </>
        }
      />

      <div className="grid gap-7 2xl:grid-cols-[minmax(0,1fr)_400px]">
        <section className="min-w-0 space-y-4">
          <StatusTabs value={status} counts={counts} onChange={setStatus} />
          <AgreementsTable
            agreements={visibleAgreements}
            selectedId={selectedId}
            onSelect={selectAgreement}
          />
          <p className="text-sm text-ink-muted">
            Showing {visibleAgreements.length} of {AGREEMENTS.length} documents
          </p>
        </section>

        {selectedAgreement && (
          <>
            {/* Backdrop — only below 2xl, where the panel becomes a slide-over drawer. */}
            <div
              className="fixed inset-0 z-[55] bg-ink/30 2xl:hidden"
              onClick={closeDetails}
              aria-hidden
            />
            <aside
              aria-label="Document details"
              className={cn(
                "fixed inset-y-0 right-0 z-[60] w-full max-w-md overflow-y-auto bg-surface shadow-xl",
                "2xl:static 2xl:z-auto 2xl:max-w-none 2xl:self-start 2xl:rounded-md 2xl:border 2xl:border-line 2xl:shadow-none",
              )}
            >
              <AgreementDetailPanel
                agreement={selectedAgreement}
                onClose={closeDetails}
              />
            </aside>
          </>
        )}
      </div>
    </>
  );
}
