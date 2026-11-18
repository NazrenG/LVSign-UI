import { useState, useEffect } from "react";
import { Button, Dialog, Input, Select, Toggle } from "@/components/ui";
import { isValidEmail } from "../../adminSelectors";
import { adminUsersApi } from "../../api/adminUsersApi";

const EMPTY = {
  name: "",
  email: "",
  departmentId: "",
  profileId: "",
  active: true,
  jobTitle: "",
};

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-[13px] text-danger">
      {children}
    </p>
  );
}

/**
 * Add / edit user. No password: employees sign in with Microsoft.
 * Email is fixed after creation (it identifies the Microsoft account).
 */
export function UserFormDialog({
  isOpen,
  user,
  users,
  departments,
  profiles,
  onSave,
  onClose,
  accessProfiles = [],
  accessProfilesLoading = false,
}) {
  const isEdit = Boolean(user);
  const [values, setValues] = useState(() =>
    user
      ? {
          name: user.name,
          email: user.email,
          departmentId: user.departmentId,
          profileId: user.profileId,
          active: user.active,
          jobTitle: user.jobTitle ?? "",
        }
      : {
          ...EMPTY,
          departmentId: departments[0]?.id ?? "",
          profileId: "",
        },
  );
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [profileLoading, setProfileLoading] = useState(isEdit);
  const [profileError, setProfileError] = useState("");
  const [originalProfileId, setOriginalProfileId] = useState("");
  const [multipleProfiles, setMultipleProfiles] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    async function loadProfile() {
      setProfileLoading(true);
      setProfileError("");

      try {
        const assigned = await adminUsersApi.getUserPermissionProfiles(user.id);

        if (cancelled) return;

        setMultipleProfiles(assigned.length > 1);

        if (assigned.length === 1) {
          const id = assigned[0].permissionProfileId;
          setOriginalProfileId(id);
          setValues((current) => ({ ...current, profileId: id }));
        } else {
          setOriginalProfileId("");
          setValues((current) => ({ ...current, profileId: "" }));
        }
      } catch (error) {
        if (!cancelled) {
          setProfileError(error.message || "Unable to load profiles.");
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const set = (key) => (value) =>
    setValues((current) => ({ ...current, [key]: value }));

  const emailTaken =
    !isEdit &&
    users.some(
      (item) => item.email.toLowerCase() === values.email.trim().toLowerCase(),
    );
  const errors = {
    name: values.name.trim() ? "" : "Enter the employee's full name.",
    email: isEdit
      ? ""
      : !values.email.trim()
        ? "Enter the corporate email address."
        : !isValidEmail(values.email)
          ? "Enter a valid email address, e.g. name.surname@lv-logistics.com."
          : emailTaken
            ? "A user with this email already exists."
            : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setSaveError(null);

    if (hasErrors || saving) return;

    setSaving(true);

    try {
    await onSave({
  ...values,
  name: values.name.trim(),
  originalProfileId,
  multipleProfiles,
});

      onClose();
    } catch (error) {
      setSaveError(error.message || "Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      title={isEdit ? "Edit user" : "Add user"}
      description={
        isEdit
          ? "Update this employee's information."
          : "The employee signs in with their existing Microsoft work account — no password is set here."
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="admin-user-form" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Add user"}
          </Button>
        </>
      }
    >
      <form
        id="admin-user-form"
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
            label={isEdit ? "Display name" : "Full name"}
            value={values.name}
            onChange={(event) => set("name")(event.target.value)}
            autoComplete="off"
            aria-invalid={submitted && Boolean(errors.name)}
            aria-describedby="user-name-error"
          />
          <FieldError id="user-name-error">
            {submitted && errors.name}
          </FieldError>
        </div>

        <div>
          <Input
            label="Corporate email"
            type="email"
            value={values.email}
            onChange={(event) => set("email")(event.target.value)}
            readOnly={isEdit}
            placeholder="name.surname@lv-logistics.com"
            hint={
              isEdit
                ? "The email identifies the Microsoft account and can't be changed here."
                : undefined
            }
            aria-invalid={submitted && Boolean(errors.email)}
            aria-describedby="user-email-error"
          />

          <div>
            <Input
              label="Job title"
              value={values.jobTitle ?? ""}
              onChange={(event) => set("jobTitle")(event.target.value)}
              placeholder="e.g. System Developer"
            />
          </div>

          <FieldError id="user-email-error">
            {submitted && errors.email}
          </FieldError>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label="Department"
            value={values.departmentId}
            onChange={(event) => set("departmentId")(event.target.value)}
            options={[
              {
                value: "",
                label: "Select department",
              },
              ...departments
                .filter(
                  (department) =>
                    department.active ||
                    (isEdit && department.id === values.departmentId),
                )
                .map((department) => ({
                  value: department.id,
                  label: department.active
                    ? department.name
                    : `${department.name} (Inactive)`,
                })),
            ]}
          />
          <Select
            label="Permission profile"
            value={values.profileId ?? ""}
            onChange={(event) => set("profileId")(event.target.value)}
            disabled={
              accessProfilesLoading ||
              profileLoading ||
              Boolean(profileError) ||
              multipleProfiles
            }
            options={[
              {
                value: "",
                label: accessProfilesLoading
                  ? "Loading profiles..."
                  : "No profile",
              },
              ...accessProfiles
                .filter((profile) => profile.isActive)
                .map((profile) => ({
                  value: profile.id,
                  label: profile.name,
                })),
            ]}
          />
          {profileError && (
            <p role="alert" className="text-sm text-danger">
              {profileError}
            </p>
          )}

          {multipleProfiles && (
            <p className="text-sm text-ink-muted">
              Multiple profiles are assigned. Manage them in User Details.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-md border border-line px-4 py-3">
          <div>
            <p className="text-[15px] font-medium text-ink">Active account</p>
            <p className="text-[13px] text-ink-muted">
              Inactive users can't access LV.SignFlow.
            </p>
          </div>
          <Toggle
            checked={values.active}
            onChange={set("active")}
            label="Active account"
          />
        </div>
      </form>
    </Dialog>
  );
}
