import { useEffect, useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import { Button, Card, SearchInput, Select } from "@/components/ui";
import { byId, filterUsers } from "../../adminSelectors";
import { AdminSectionHeader } from "../AdminSectionHeader";
import { ConfirmDialog } from "../ConfirmDialog";
import { EmptyState } from "../EmptyState";
import { UserDetailsSheet } from "./UserDetailsSheet";
import { UserFormDialog } from "./UserFormDialog";
import { UsersTable } from "./UsersTable";
import { adminUsersApi } from "../../api/adminUsersApi";
import { mapAdminUser } from "../../api/adminUserMapper";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export function UsersSection({
  users,
  usersLoading,
  usersError,
  reloadUsers,
  departments,
  profiles,
  stamps,
  addUser,
  updateUser,
  setUserActive,
  departmentsLoading,
  departmentsError,
  accessProfiles,
  accessProfilesLoading,
}) {
  const [filters, setFilters] = useState({
    query: "",
    departmentId: "all",
    status: "all",
  });
  const [form, setForm] = useState(null); // { user?: User } | null
  const [viewingId, setViewingId] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [confirming, setConfirming] = useState(null); // user to (de)activate
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [userProfilesById, setUserProfilesById] = useState({});
  const departmentsById = useMemo(() => byId(departments), [departments]);
  const profilesById = useMemo(() => byId(profiles), [profiles]);
  const visible = filterUsers(users, filters);
  const viewing = viewingUser;
  const setFilter = (key) => (event) =>
    setFilters((current) => ({ ...current, [key]: event.target.value }));
  const isFiltered =
    filters.query || filters.departmentId !== "all" || filters.status !== "all";

  useEffect(() => {
    if (!viewingId) {
      setViewingUser(null);
      setDetailsError(null);
      setDetailsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadUserDetails() {
      setViewingUser(null);
      setDetailsLoading(true);
      setDetailsError(null);

      try {
        const dto = await adminUsersApi.getUser(viewingId);

        if (!cancelled) {
          setViewingUser(mapAdminUser(dto));
        }
      } catch (error) {
        if (!cancelled) {
          setDetailsError(error);
        }
      } finally {
        if (!cancelled) {
          setDetailsLoading(false);
        }
      }
    }

    loadUserDetails();

    return () => {
      cancelled = true;
    };
  }, [viewingId]);

  useEffect(() => {
    let cancelled = false;

    async function loadAssignments() {
      const results = await Promise.allSettled(
        users.map((user) => adminUsersApi.getUserPermissionProfiles(user.id)),
      );

      if (cancelled) return;

      const next = {};

      users.forEach((user, index) => {
        const result = results[index];

        next[user.id] =
          result.status === "fulfilled"
            ? result.value.map((p) => p.permissionProfileName)
            : null;
      });

      setUserProfilesById(next);
    }

    loadAssignments();

    return () => {
      cancelled = true;
    };
  }, [users]);

  const handlers = {
    onView: (user) => setViewingId(user.id),
    onEdit: (user) => {
      setViewingId(null);
      setForm({ user });
    },
    onToggleActive: (user) => {
      setStatusError(null);
      setConfirming(user);
    },
  };

  const handleConfirmStatus = async () => {
    if (!confirming || statusLoading) return;

    setStatusLoading(true);
    setStatusError(null);

    try {
      await setUserActive(confirming, !confirming.active);

      setConfirming(null);
    } catch (error) {
      setStatusError(
        error.status === 409
          ? error.message ||
              "This action conflicts with administrator protection rules."
          : error.status === 403
            ? "You don't have permission to change user status."
            : error.message || "Failed to update user status.",
      );
    } finally {
      setStatusLoading(false);
    }
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
        {usersLoading ? (
          <div className="p-6 text-sm text-ink-muted">Loading users...</div>
        ) : usersError ? (
          <div className="space-y-3 p-6">
            <p className="text-sm text-red-600">
              {usersError.status === 403
                ? "You don't have permission to view users."
                : usersError.message || "Failed to load users."}
            </p>
            <Button variant="secondary" onClick={reloadUsers}>
              Retry
            </Button>
          </div>
        ) : visible.length === 0 ? (
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
            userProfilesById={userProfilesById}
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
          departmentsLoading={departmentsLoading}
          departmentsError={departmentsError}
          profiles={profiles}
          onSave={(values) =>
            form.user ? updateUser(form.user.id, values) : addUser(values)
          }
          onClose={() => setForm(null)}
          accessProfiles={accessProfiles}
          accessProfilesLoading={accessProfilesLoading}
        />
      )}

      <UserDetailsSheet
        user={viewing}
        loading={detailsLoading}
        error={detailsError}
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
              {/* <p className="text-[13px]">
                Demo only: this changes the status shown on this page and
                nothing else.
              </p> */}
            </>
          ) : (
            <>
              <p>
                <strong className="text-ink">{confirming?.name}</strong> will be
                able to sign in to LV.SignFlow again with their Microsoft
                account.
              </p>
              {/* <p className="text-[13px]">
                Demo only: this changes the status shown on this page and
                nothing else.
              </p> */}
            </>
          )
        }
        loading={statusLoading}
        error={statusError}
        onConfirm={handleConfirmStatus}
        onClose={() => {
          if (statusLoading) return;
          setConfirming(null);
          setStatusError(null);
        }}
      />
    </>
  );
}
