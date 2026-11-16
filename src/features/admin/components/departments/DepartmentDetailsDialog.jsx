import { Avatar, Button, Dialog } from "@/components/ui";
import { ActiveBadge } from "../StatusBadge";

export function DepartmentDetailsDialog({
  department,
  members,
  onEdit,
  onClose,
}) {
  return (
    <Dialog
      isOpen
      title={department.name}
      description={department.description || "No description."}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(department)}>Edit department</Button>
        </>
      }
    >
      <h3 className="mb-2 text-sm font-medium text-ink">
        Employees ({members.length})
      </h3>
      {members.length === 0 ? (
        <p className="rounded-md border border-dashed border-line-strong px-4 py-6 text-center text-[14px] text-ink-muted">
          No employees in this department yet.
        </p>
      ) : (
        <ul className="divide-y divide-line rounded-md border border-line">
          {members.map((user) => (
            <li key={user.id} className="flex items-center gap-3 px-3.5 py-2.5">
              <Avatar name={user.name} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium text-ink">
                  {user.name}
                </span>
                <span className="block truncate text-[12px] text-ink-muted">
                  {user.email}
                </span>
              </span>
              <ActiveBadge active={user.active} />
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}
