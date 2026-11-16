import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import { Button, Card, SearchInput, Select } from "@/components/ui";
import { byId, filterUsers } from "../../adminSelectors";
import { AdminSectionHeader } from "../AdminSectionHeader";
import { ConfirmDialog } from "../ConfirmDialog";
import { EmptyState } from "../EmptyState";
import { UserDetailsSheet } from "./UserDetailsSheet";
import { UserFormDialog } from "./UserFormDialog";
import { UsersTable } from "./UsersTable";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export function UsersSection({
  users,
  departments,
  profiles,
  stamps,
  addUser,
  updateUser,
  setUserActive,
}) {
  const [filters, setFilters] = useState({
    query: "",
    departmentId: "all",
    status: "all",
  });
  const [form, setForm] = useState(null); // { user?: User } | null
  const [viewingId, setViewingId] = useState(null);
  const [confirming, setConfirming] = useState(null); // user to (de)activate

  const departmentsById = useMemo(() => byId(departments), [departments]);
  const profilesById = useMemo(() => byId(profiles), [profiles]);
  const visible = filterUsers(users, filters);
  const viewing = users.find((user) => user.id === viewingId);
  const setFilter = (key) => (event) =>
    setFilters((current) => ({ ...current, [key]: event.target.value }));
  const isFiltered =
    filters.query || filters.departmentId !== "all" || filters.status !== "all";

  const handlers = {
    onView: (user) => setViewingId(user.id),
    onEdit: (user) => {
      setViewingId(null);
      setForm({ user });
    },
    onToggleActive: (user) => setConfirming(user),
  };

  return (
    <>
      <AdminSectionHeader
        title="Users"
        description={`${users.length} employees · sign-in with Microsoft work accounts`}
        actions={
          <Button icon={UserPlus} onClick={() => setForm({})}>
            Add user
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px]">
        <SearchInput
          placeholder="Search by name or email"
          value={filters.query}
          onChange={setFilter("query")}
        />
        <Select
          aria-label="Filter by department"
          value={filters.departmentId}
          onChange={setFilter("departmentId")}
          options={[
            { value: "all", label: "All departments" },
            ...departments.map((dep) => ({ value: dep.id, label: dep.name })),
          ]}
        />
        <Select
          aria-label="Filter by status"
          value={filters.status}
          onChange={setFilter("status")}
          options={STATUS_OPTIONS}
        />
      </div>

      <Card className="overflow-hidden">
        {visible.length === 0 ? (
          <EmptyState
            title="No users match these filters"
            message="Try another name, department or status."
            action={
              isFiltered && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setFilters({
                      query: "",
                      departmentId: "all",
                      status: "all",
                    })
                  }
                >
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <UsersTable
            users={visible}
            departmentsById={departmentsById}
            profilesById={profilesById}
            {...handlers}
          />
        )}
      </Card>
      <p className="mt-3 text-[13px] text-ink-muted">
        Showing {visible.length} of {users.length} users.
      </p>

      {form && (
        <UserFormDialog
          isOpen
          user={form.user}
          users={users}
          departments={departments}
          profiles={profiles}
          onSave={(values) =>
            form.user ? updateUser(form.user.id, values) : addUser(values)
          }
          onClose={() => setForm(null)}
        />
      )}

      <UserDetailsSheet
        user={viewing}
        department={viewing && departmentsById[viewing.departmentId]}
        profile={viewing && profilesById[viewing.profileId]}
        stamps={stamps}
        onEdit={handlers.onEdit}
        onToggleActive={handlers.onToggleActive}
        onClose={() => setViewingId(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(confirming)}
        title={confirming?.active ? "Deactivate user?" : "Reactivate user?"}
        tone={confirming?.active ? "danger" : "primary"}
        confirmLabel={confirming?.active ? "Deactivate" : "Reactivate"}
        message={
          confirming?.active ? (
            <>
              <p>
                <strong className="text-ink">{confirming?.name}</strong> will
                lose access to LV.SignFlow. You can reactivate the account
                later.
              </p>
              <p className="text-[13px]">
                Demo only: this changes the status shown on this page and
                nothing else.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong className="text-ink">{confirming?.name}</strong> will be
                able to sign in to LV.SignFlow again with their Microsoft
                account.
              </p>
              <p className="text-[13px]">
                Demo only: this changes the status shown on this page and
                nothing else.
              </p>
            </>
          )
        }
        onConfirm={() => setUserActive(confirming, !confirming.active)}
        onClose={() => setConfirming(null)}
      />
    </>
  );
}
