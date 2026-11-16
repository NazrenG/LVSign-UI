import { useMemo, useState } from "react";
import {
  Button,
  Dialog,
  Input,
  RadioGroup,
  Textarea,
  Toggle,
} from "@/components/ui";
import { STAMP_SCOPE } from "../../adminConstants";
import { byId } from "../../adminSelectors";
import { UserMultiSelect } from "../UserMultiSelect";
import { StampImageField } from "./StampImageField";

const SCOPE_OPTIONS = [
  {
    value: STAMP_SCOPE.company,
    label: "Company stamp — the organization's official stamp",
  },
  {
    value: STAMP_SCOPE.users,
    label: "User-assigned stamp — for selected employees",
  },
];

/** Create / edit a stamp. Everything stays in local demo state. */
export function StampFormDialog({
  stamp,
  stamps,
  users,
  departments,
  onSave,
  onClose,
}) {
  const isEdit = Boolean(stamp);
  const [values, setValues] = useState(() => ({
    name: stamp?.name ?? "",
    description: stamp?.description ?? "",
    imageUrl: stamp?.imageUrl ?? "",
    scope: stamp?.scope ?? STAMP_SCOPE.users,
    assignedUserIds: stamp?.assignedUserIds ?? [],
    active: stamp?.active ?? true,
  }));
  const [submitted, setSubmitted] = useState(false);
  const departmentsById = useMemo(() => byId(departments), [departments]);
  const set = (key) => (value) =>
    setValues((current) => ({ ...current, [key]: value }));

  const trimmed = values.name.trim();
  const errors = {
    name: !trimmed
      ? "Enter a stamp name."
      : stamps.some(
            (item) =>
              item.id !== stamp?.id &&
              item.name.toLowerCase() === trimmed.toLowerCase(),
          )
        ? "A stamp with this name already exists."
        : "",
    imageUrl: values.imageUrl ? "" : "Add a stamp image.",
    assignedUserIds:
      values.scope === STAMP_SCOPE.users && values.assignedUserIds.length === 0
        ? "Select at least one employee, or make it a company stamp."
        : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const close = () => {
    // Release an image picked in this dialog but not saved.
    if (
      values.imageUrl.startsWith("blob:") &&
      values.imageUrl !== stamp?.imageUrl
    ) {
      URL.revokeObjectURL(values.imageUrl);
    }
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;
    onSave(stamp?.id, {
      ...values,
      name: trimmed,
      description: values.description.trim(),
      assignedUserIds:
        values.scope === STAMP_SCOPE.users ? values.assignedUserIds : [],
    });
    onClose();
  };

  const changeImage = (url) => {
    if (
      values.imageUrl.startsWith("blob:") &&
      values.imageUrl !== stamp?.imageUrl
    ) {
      URL.revokeObjectURL(values.imageUrl);
    }
    set("imageUrl")(url);
  };

  return (
    <Dialog
      isOpen
      size="lg"
      title={isEdit ? "Edit stamp" : "Create stamp"}
      description="Stamps are images employees can place on documents. This screen manages them; it doesn't stamp PDFs."
      onClose={close}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="admin-stamp-form">
            {isEdit ? "Save changes" : "Create stamp"}
          </Button>
        </>
      }
    >
      <form
        id="admin-stamp-form"
        noValidate
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <Input
            label="Stamp name"
            value={values.name}
            onChange={(event) => set("name")(event.target.value)}
            placeholder="e.g. Finance — Approved"
            aria-invalid={submitted && Boolean(errors.name)}
            aria-describedby="stamp-name-error"
          />
          {submitted && errors.name && (
            <p
              id="stamp-name-error"
              role="alert"
              className="mt-1.5 text-[13px] text-danger"
            >
              {errors.name}
            </p>
          )}
        </div>

        <StampImageField
          value={values.imageUrl}
          onChange={changeImage}
          error={submitted ? errors.imageUrl : ""}
        />

        <Textarea
          label="Description (optional)"
          value={values.description}
          onChange={(event) => set("description")(event.target.value)}
          rows={2}
        />

        <div className="space-y-4 rounded-md border border-line p-4">
          <RadioGroup
            legend="Who is this stamp for?"
            options={SCOPE_OPTIONS}
            value={values.scope}
            onChange={set("scope")}
          />
          <p className="text-[13px] text-ink-muted">
            How stamp access is enforced will be defined when stamps are
            connected to the backend.
          </p>
          {values.scope === STAMP_SCOPE.users && (
            <div>
              <UserMultiSelect
                label="Assigned employees"
                users={users}
                departmentsById={departmentsById}
                value={values.assignedUserIds}
                onChange={set("assignedUserIds")}
              />
              {submitted && errors.assignedUserIds && (
                <p role="alert" className="mt-1.5 text-[13px] text-danger">
                  {errors.assignedUserIds}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-md border border-line px-4 py-3">
          <div>
            <p className="text-[15px] font-medium text-ink">Active</p>
            <p className="text-[13px] text-ink-muted">
              Inactive stamps can't be placed on documents.
            </p>
          </div>
          <Toggle
            checked={values.active}
            onChange={set("active")}
            label="Stamp active"
          />
        </div>
      </form>
    </Dialog>
  );
}
