import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { Button, Checkbox, Dialog, Input, Textarea } from "@/components/ui";
import { PROTOTYPE_PERMISSION_GROUPS } from "../../adminConstants";

export function ProfileEditorDialog({
  profile,
  profiles,
  assignedCount,
  onSave,
  onClose,
}) {
  const isEdit = Boolean(profile);
  const [name, setName] = useState(profile?.name ?? "");
  const [description, setDescription] = useState(profile?.description ?? "");
  const [permissions, setPermissions] = useState(
    () => new Set(profile?.permissions ?? []),
  );
  const [submitted, setSubmitted] = useState(false);

  const trimmed = name.trim();
  const duplicate = profiles.some(
    (item) =>
      item.id !== profile?.id &&
      item.name.toLowerCase() === trimmed.toLowerCase(),
  );
  const error = !trimmed
    ? "Enter a profile name."
    : duplicate
      ? "A profile with this name already exists."
      : "";

  const toggle = (key) =>
    setPermissions((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleGroup = (group, on) =>
    setPermissions((current) => {
      const next = new Set(current);
      group.permissions.forEach(({ key }) =>
        on ? next.add(key) : next.delete(key),
      );
      return next;
    });

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (error) return;
    onSave(profile?.id, {
      name: trimmed,
      description: description.trim(),
      permissions: [...permissions],
    });
    onClose();
  };

  return (
    <Dialog
      isOpen
      size="lg"
      title={isEdit ? profile.name : "Create permission profile"}
      description={
        isEdit
          ? `Assigned to ${assignedCount} ${assignedCount === 1 ? "user" : "users"}.`
          : "Profiles bundle what a group of employees can do."
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="admin-profile-form">
            {isEdit ? "Save changes" : "Create profile"}
          </Button>
        </>
      }
    >
      <form
        id="admin-profile-form"
        noValidate
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <Input
            label="Profile name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={submitted && Boolean(error)}
            aria-describedby="profile-name-error"
          />
          {submitted && error && (
            <p
              id="profile-name-error"
              role="alert"
              className="mt-1.5 text-[13px] text-danger"
            >
              {error}
            </p>
          )}
        </div>
        <Textarea
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
        />

        <div>
          <h3 className="text-sm font-medium text-ink">Permissions</h3>
          <p className="mt-1.5 flex items-start gap-2 rounded-md bg-warning-soft px-3 py-2 text-[13px] text-warning">
            <FlaskConical
              className="mt-0.5 size-4 shrink-0"
              strokeWidth={1.75}
              aria-hidden
            />
            Prototype list. Final permission names will come from the backend
            Permission model, and nothing here is enforced yet.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {PROTOTYPE_PERMISSION_GROUPS.map((group) => {
              const enabled = group.permissions.filter(({ key }) =>
                permissions.has(key),
              ).length;
              const all = enabled === group.permissions.length;
              return (
                <fieldset
                  key={group.id}
                  className="rounded-md border border-line p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <legend className="text-[15px] font-medium text-ink">
                      {group.label}
                    </legend>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group, !all)}
                      className="text-[13px] text-primary hover:underline"
                    >
                      {all ? "Clear all" : "Select all"}
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {group.permissions.map((permission) => (
                      <Checkbox
                        key={permission.key}
                        label={permission.label}
                        checked={permissions.has(permission.key)}
                        onChange={() => toggle(permission.key)}
                        className="flex text-[14px]"
                      />
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </div>
        </div>
      </form>
    </Dialog>
  );
}
