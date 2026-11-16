import { useMemo, useState } from "react";
import { Button, Dialog } from "@/components/ui";
import { byId } from "../../adminSelectors";
import { UserMultiSelect } from "../UserMultiSelect";

/** Add or remove the employees a user-assigned stamp belongs to. */
export function StampAssignmentsDialog({
  stamp,
  users,
  departments,
  onSave,
  onClose,
}) {
  const [assigned, setAssigned] = useState(stamp.assignedUserIds);
  const departmentsById = useMemo(() => byId(departments), [departments]);
  const unchanged =
    assigned.length === stamp.assignedUserIds.length &&
    assigned.every((id) => stamp.assignedUserIds.includes(id));

  return (
    <Dialog
      isOpen
      title="Manage assignments"
      description={stamp.name}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={unchanged || assigned.length === 0}
            onClick={() => {
              onSave(stamp.id, assigned);
              onClose();
            }}
          >
            Update assignments
          </Button>
        </>
      }
    >
      <UserMultiSelect
        label="Employees who can use this stamp"
        users={users}
        departmentsById={departmentsById}
        value={assigned}
        onChange={setAssigned}
      />
      {assigned.length === 0 && (
        <p className="mt-2 text-[13px] text-warning">
          A user-assigned stamp needs at least one employee. To remove everyone,
          deactivate or delete the stamp instead.
        </p>
      )}
    </Dialog>
  );
}
