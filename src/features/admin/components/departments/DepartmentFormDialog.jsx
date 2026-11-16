import { useState } from "react";
import { Button, Dialog, Input, Textarea } from "@/components/ui";

export function DepartmentFormDialog({
  department,
  departments,
  onSave,
  onClose,
}) {
  const isEdit = Boolean(department);
  const [name, setName] = useState(department?.name ?? "");
  const [description, setDescription] = useState(department?.description ?? "");
  const [submitted, setSubmitted] = useState(false);

  const trimmed = name.trim();
  const duplicate = departments.some(
    (dep) =>
      dep.id !== department?.id &&
      dep.name.toLowerCase() === trimmed.toLowerCase(),
  );
  const error = !trimmed
    ? "Enter a department name."
    : duplicate
      ? "A department with this name already exists."
      : "";

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (error) return;
    onSave(department?.id, { name: trimmed, description: description.trim() });
    onClose();
  };

  return (
    <Dialog
      isOpen
      title={isEdit ? "Edit department" : "Add department"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="admin-department-form">
            {isEdit ? "Save changes" : "Add department"}
          </Button>
        </>
      }
    >
      <form
        id="admin-department-form"
        noValidate
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <Input
            label="Department name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={submitted && Boolean(error)}
            aria-describedby="department-name-error"
          />
          {submitted && error && (
            <p
              id="department-name-error"
              role="alert"
              className="mt-1.5 text-[13px] text-danger"
            >
              {error}
            </p>
          )}
        </div>
        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />
      </form>
    </Dialog>
  );
}
