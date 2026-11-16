import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, Card, Menu } from "@/components/ui";
import { AdminSectionHeader } from "../AdminSectionHeader";
import { DepartmentDetailsDialog } from "./DepartmentDetailsDialog";
import { DepartmentFormDialog } from "./DepartmentFormDialog";

export function DepartmentsSection({ departments, users, saveDepartment }) {
  const [form, setForm] = useState(null); // { department? } | null
  const [viewingId, setViewingId] = useState(null);

  const membersOf = (id) => users.filter((user) => user.departmentId === id);
  const viewing = departments.find((dep) => dep.id === viewingId);
  const actions = (department) => [
    { label: "View details", onSelect: () => setViewingId(department.id) },
    { label: "Edit department", onSelect: () => setForm({ department }) },
  ];

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

      <Card className="overflow-hidden">
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
                Description
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
                    </button>
                  </td>
                  <td className="hidden max-w-md px-4 py-3.5 text-[14px] text-ink-muted md:table-cell">
                    {department.description || "—"}
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
      <p className="mt-3 text-[13px] text-ink-muted">
        Department status (active/inactive) isn't shown yet — it will follow the
        backend Department model.
      </p>

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
    </>
  );
}
