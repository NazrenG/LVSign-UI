import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button, SearchInput, SegmentedControl } from "@/components/ui";
import { STAMP_SCOPE } from "../../adminConstants";
import { byId } from "../../adminSelectors";
import { AdminSectionHeader } from "../AdminSectionHeader";
import { ConfirmDialog } from "../ConfirmDialog";
import { EmptyState } from "../EmptyState";
import { StampAssignmentsDialog } from "./StampAssignmentsDialog";
import { StampCard } from "./StampCard";
import { StampFormDialog } from "./StampFormDialog";

const SCOPE_FILTERS = [
  { value: "all", label: "All" },
  { value: STAMP_SCOPE.company, label: "Company" },
  { value: STAMP_SCOPE.users, label: "User-assigned" },
];

export function StampsSection({
  stamps,
  users,
  departments,
  saveStamp,
  updateStampAssignments,
  deleteStamp,
}) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [form, setForm] = useState(null); // { stamp? } | null
  const [assigning, setAssigning] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const usersById = useMemo(() => byId(users), [users]);

  const needle = query.trim().toLowerCase();
  const visible = stamps.filter(
    (stamp) =>
      (scope === "all" || stamp.scope === scope) &&
      (!needle ||
        stamp.name.toLowerCase().includes(needle) ||
        stamp.description.toLowerCase().includes(needle)),
  );

  return (
    <>
      <AdminSectionHeader
        title="Stamps"
        description="Company stamps and stamps assigned to specific employees."
        actions={
          <Button icon={Plus} onClick={() => setForm({})}>
            Create stamp
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput
          className="md:max-w-sm md:flex-1"
          placeholder="Search stamps"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <SegmentedControl
          label="Filter stamps by type"
          options={SCOPE_FILTERS}
          value={scope}
          onChange={setScope}
          className="md:w-auto"
        />
      </div>

      {visible.length === 0 ? (
        <div className="rounded-md border border-line bg-surface">
          <EmptyState
            title={stamps.length ? "No stamps match" : "No stamps yet"}
            message={
              stamps.length
                ? "Try another name or type."
                : "Create a stamp to upload a company or department seal."
            }
            action={
              !stamps.length && (
                <Button icon={Plus} onClick={() => setForm({})}>
                  Create stamp
                </Button>
              )
            }
          />
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((stamp) => (
            <li key={stamp.id}>
              <StampCard
                stamp={stamp}
                usersById={usersById}
                onEdit={(item) => setForm({ stamp: item })}
                onAssign={setAssigning}
                onToggleActive={(item) =>
                  saveStamp(item.id, { ...item, active: !item.active })
                }
                onDelete={setDeleting}
              />
            </li>
          ))}
        </ul>
      )}

      {form && (
        <StampFormDialog
          stamp={form.stamp}
          stamps={stamps}
          users={users}
          departments={departments}
          onSave={saveStamp}
          onClose={() => setForm(null)}
        />
      )}
      {assigning && (
        <StampAssignmentsDialog
          stamp={assigning}
          users={users}
          departments={departments}
          onSave={updateStampAssignments}
          onClose={() => setAssigning(null)}
        />
      )}
      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Delete stamp?"
        tone="danger"
        confirmLabel="Delete stamp"
        message={
          <>
            <p>
              <strong className="text-ink">{deleting?.name}</strong> will be
              removed from the stamp list.
              {deleting?.assignedUserIds.length > 0 &&
                ` It is assigned to ${deleting.assignedUserIds.length} ${
                  deleting.assignedUserIds.length === 1 ? "user" : "users"
                }, who will lose access to it.`}
            </p>
            <p>
              Deleting may affect existing assignments. To keep it for later,
              deactivate it instead.
            </p>
            <p className="text-[13px]">
              Demo only: the stamp is removed from this page, nothing is deleted
              from LV.SignFlow.
            </p>
          </>
        }
        onConfirm={() => deleteStamp(deleting)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
