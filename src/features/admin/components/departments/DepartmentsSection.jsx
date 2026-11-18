import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, Card, Menu } from "@/components/ui";
import { AdminSectionHeader } from "../AdminSectionHeader";
import { DepartmentDetailsDialog } from "./DepartmentDetailsDialog";
import { DepartmentFormDialog } from "./DepartmentFormDialog";
import { ConfirmDialog } from "../ConfirmDialog";

export function DepartmentsSection({
  departments,
  departmentsLoading,
  departmentsError,
  reloadDepartments,
  users,
  saveDepartment,
  setDepartmentActive,
  deleteDepartment,
}) {
  const [pendingAction, setPendingAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [form, setForm] = useState(null); // { department? } | null
  const [viewingId, setViewingId] = useState(null);

  const membersOf = (id) => users.filter((user) => user.departmentId === id);
  const viewing = departments.find((dep) => dep.id === viewingId);

  const actions = (department) => [
    {
      label: "View details",
      onSelect: () => setViewingId(department.id),
    },
    {
      label: "Edit department",
      onSelect: () => setForm({ department }),
    },

    {
      label: "Delete department",
      tone: "danger",
      onSelect: () => {
        setActionError(null);
        setPendingAction({
          type: "delete",
          department,
        });
      },
    },
  ];

  async function confirmAction() {
    if (!pendingAction || actionLoading) return;

    setActionLoading(true);
    setActionError(null);

    try {
      const { type, department } = pendingAction;

      if (type === "delete") {
        await deleteDepartment(department.id);
      } else {
        await setDepartmentActive(department.id, !department.active);
      }

      setViewingId(null);
      setPendingAction(null);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <>
      <AdminSectionHeader
        title="Departments"
        description="Departments group employees. A user's department is set on the Users page."
        actions={
          <Button icon={Plus} onClick={() => setForm({})}>
            Add department
          </Button>
        }
      />

      <Card className="overflow-visible">
        <table className="w-full text-left">
          <thead className="border-b border-line text-sm text-ink-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Department
              </th>
              <th
                scope="col"
                className="hidden px-4 py-3 font-medium md:table-cell"
              >
                Code
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Employees
              </th>
              <th scope="col" className="w-14 px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {departments.map((department) => {
              const members = membersOf(department.id);
              const active = members.filter((user) => user.active).length;
              return (
                <tr key={department.id} className="hover:bg-canvas">
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => setViewingId(department.id)}
                      className="text-left font-medium text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      {department.name}
                      {!department.active && (
                        <span className="ml-2 text-xs text-ink-muted">
                          (Inactive)
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="hidden max-w-md px-4 py-3.5 text-[14px] text-ink-muted md:table-cell">
                    {department.code || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-[15px] whitespace-nowrap text-ink">
                    {members.length}
                    {members.length !== active && (
                      <span className="ml-1.5 text-[13px] text-ink-muted">
                        ({active} active)
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-3.5 text-right">
                    <Menu
                      label={`Actions for ${department.name}`}
                      items={actions(department)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {form && (
        <DepartmentFormDialog
          department={form.department}
          departments={departments}
          onSave={saveDepartment}
          onClose={() => setForm(null)}
        />
      )}
      {viewing && (
        <DepartmentDetailsDialog
          department={viewing}
          members={membersOf(viewing.id)}
          onEdit={(department) => {
            setViewingId(null);
            setForm({ department });
          }}
          onClose={() => setViewingId(null)}
        />
      )}

      {pendingAction && (
        <ConfirmDialog
          isOpen
          title={
            pendingAction.type === "delete"
              ? "Delete department?"
              : pendingAction.department.active
                ? "Deactivate department?"
                : "Reactivate department?"
          }
          tone={pendingAction.type === "delete" ? "danger" : "primary"}
          confirmLabel={actionLoading ? "Processing..." : "Confirm"}
          message={
            <div className="space-y-2">
              <p>{pendingAction.department.name}</p>
              {pendingAction.type === "delete" && (
                <p>
                  Departments with assigned users or template shares cannot be
                  deleted.
                </p>
              )}
              {actionError && (
                <p role="alert" className="text-danger">
                  {actionError}
                </p>
              )}
            </div>
          }
          onConfirm={confirmAction}
          onClose={() => {
            if (!actionLoading) setPendingAction(null);
          }}
        />
      )}
    </>
  );
}
