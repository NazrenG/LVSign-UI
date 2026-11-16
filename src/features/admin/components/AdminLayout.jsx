import { Info } from "lucide-react";
import { Outlet, useOutletContext } from "react-router-dom";
import { PageHeader } from "@/components/layout";
import { DEMO_NOTICE } from "../adminConstants";
import { useAdminWorkspace } from "../hooks/useAdminWorkspace";
import { AdminTabs } from "./AdminTabs";

/**
 * Admin workspace shell: title, demo notice, section tabs, routed section.
 * Rendered inside the existing AppLayout (main sidebar unchanged).
 */
export function AdminLayout() {
  const workspace = useAdminWorkspace();

  return (
    <>
      <PageHeader
        title="Admin"
        subtitle="Manage people, access, stamps and organization-wide agreement rules."
        className="mb-4"
      />
      <p className="mb-5 flex items-start gap-2.5 rounded-md border border-line bg-canvas-muted px-3.5 py-2.5 text-[13px] text-ink-muted">
        <Info
          className="mt-0.5 size-4 shrink-0"
          strokeWidth={1.75}
          aria-hidden
        />
        <span>{DEMO_NOTICE}</span>
      </p>
      <AdminTabs />
      <div className="pt-6">
        <Outlet context={workspace} />
      </div>
    </>
  );
}

/** Admin pages read the shared demo state with this hook. */
export const useAdmin = () => useOutletContext();
