
import { useState } from "react";
import { Button, Dialog, Input } from "@/components/ui";

export function DepartmentFormDialog({
  department,
  departments,
  onSave,
  onClose,
}) {
  const isEdit = Boolean(department);

  const [name, setName] = useState(department?.name ?? "");
  const [code, setCode] = useState(department?.code ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const trimmedName = name.trim();

  const duplicate = departments.some(
    (item) =>
      item.id !== department?.id &&
      item.name.toLowerCase() === trimmedName.toLowerCase(),
  );

  const nameError = !trimmedName
    ? "Department name is required."
    : trimmedName.length > 200
      ? "Maximum 200 characters."
      : duplicate
        ? "Department name already exists."
        : "";

  const codeError =
    code.trim().length > 50
      ? "Maximum 50 characters."
      : "";

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setSaveError(null);

    if (nameError || codeError || saving) return;

    setSaving(true);

    try {
      await onSave(department?.id, {
        name: trimmedName,
        code: code.trim(),
      });

      onClose();
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      isOpen
      title={isEdit ? "Edit department" : "Add department"}
      onClose={saving ? undefined : onClose}
      footer={
        <>
          <Button
            variant="secondary"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="admin-department-form"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : isEdit
                ? "Save changes"
                : "Add department"}
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
        {saveError && (
          <p role="alert" className="text-sm text-danger">
            {saveError}
          </p>
        )}

        <div>
          <Input
            label="Department name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={submitted && Boolean(nameError)}
          />
          {submitted && nameError && (
            <p role="alert" className="text-sm text-danger">
              {nameError}
            </p>
          )}
        </div>

        <div>
          <Input
            label="Department code (optional)"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="e.g. IT, HR, FIN"
            aria-invalid={submitted && Boolean(codeError)}
          />
          {submitted && codeError && (
            <p role="alert" className="text-sm text-danger">
              {codeError}
            </p>
          )}
        </div>
      </form>
    </Dialog>
  );
}
