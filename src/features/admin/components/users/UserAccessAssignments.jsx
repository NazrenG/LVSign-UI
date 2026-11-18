import { useCallback, useEffect, useState } from "react";
import { adminUsersApi } from "../../api/adminUsersApi";

function getErrorMessage(error) {
  if (error?.status === 409) {
    return (
      error.message || "This action is blocked by administrator protection."
    );
  }

  if (error?.status === 403) {
    return "You do not have permission to manage access.";
  }

  return error?.message || "Unable to update access.";
}

export function UserAccessAssignments({ user }) {
  const [roles, setRoles] = useState([]);
  const [assignedRoles, setAssignedRoles] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [assignedProfiles, setAssignedProfiles] = useState([]);

  const [roleId, setRoleId] = useState("");
  const [profileId, setProfileId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const userId = user?.id;

  const load = useCallback(async () => {
    const [allRoles, userRoles, allProfiles, userProfiles] = await Promise.all([
      adminUsersApi.getRoles(),
      adminUsersApi.getUserRoles(userId),
      adminUsersApi.getPermissionProfiles(),
      adminUsersApi.getUserPermissionProfiles(userId),
    ]);

    setRoles(allRoles);
    setAssignedRoles(userRoles);
    setProfiles(allProfiles);
    setAssignedProfiles(userProfiles);
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([
      adminUsersApi.getRoles(),
      adminUsersApi.getUserRoles(userId),
      adminUsersApi.getPermissionProfiles(),
      adminUsersApi.getUserPermissionProfiles(userId),
    ])
      .then(([r, ur, p, up]) => {
        if (cancelled) return;
        setRoles(r);
        setAssignedRoles(ur);
        setProfiles(p);
        setAssignedProfiles(up);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const mutate = async (operation) => {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await operation();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const assignedRoleIds = new Set(assignedRoles.map((r) => r.roleId));

  const assignedProfileIds = new Set(
    assignedProfiles.map((p) => p.permissionProfileId),
  );

  const availableRoles = roles.filter(
    (r) => r.isActive && !assignedRoleIds.has(r.id),
  );

  const availableProfiles = profiles.filter(
    (p) => p.isActive && !assignedProfileIds.has(p.id),
  );

  if (!userId) return null;

  return (
    <section className="mt-5 space-y-5 border-t border-line pt-5">
      <h3 className="font-medium text-ink">Roles & permissions</h3>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading access assignments...</p>
      ) : (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Assigned roles</h4>

            {assignedRoles.length === 0 && (
              <p className="text-sm text-ink-muted">No roles assigned.</p>
            )}

            {assignedRoles.map((role) => (
              <div
                key={role.roleId}
                className="flex items-center justify-between gap-3 rounded-md border border-line p-3"
              >
                <span className="text-sm">{role.roleName}</span>

                <button
                  type="button"
                  disabled={busy}
                  className="text-sm text-danger disabled:opacity-50"
                  onClick={() =>
                    mutate(() => adminUsersApi.removeRole(userId, role.roleId))
                  }
                >
                  Remove
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <select
                aria-label="Select role"
                className="min-w-0 flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm"
                value={roleId}
                disabled={busy || !user.active}
                onChange={(e) => setRoleId(e.target.value)}
              >
                <option value="">Select role</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={!roleId || busy || !user.active}
                className="rounded-md bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
                onClick={() =>
                  mutate(async () => {
                    await adminUsersApi.assignRole(userId, roleId);
                    setRoleId("");
                  })
                }
              >
                Assign
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Permission profiles</h4>

            {assignedProfiles.length === 0 && (
              <p className="text-sm text-ink-muted">
                No permission profiles assigned.
              </p>
            )}

            {assignedProfiles.map((profile) => (
              <div
                key={profile.permissionProfileId}
                className="flex items-center justify-between gap-3 rounded-md border border-line p-3"
              >
                <span className="text-sm">{profile.permissionProfileName}</span>

                <button
                  type="button"
                  disabled={busy}
                  className="text-sm text-danger disabled:opacity-50"
                  onClick={() =>
                    mutate(() =>
                      adminUsersApi.removePermissionProfile(
                        userId,
                        profile.permissionProfileId,
                      ),
                    )
                  }
                >
                  Remove
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <select
                aria-label="Select permission profile"
                className="min-w-0 flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm"
                value={profileId}
                disabled={busy || !user.active}
                onChange={(e) => setProfileId(e.target.value)}
              >
                <option value="">Select profile</option>
                {availableProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={!profileId || busy || !user.active}
                className="rounded-md bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
                onClick={() =>
                  mutate(async () => {
                    await adminUsersApi.assignPermissionProfile(
                      userId,
                      profileId,
                    );
                    setProfileId("");
                  })
                }
              >
                Assign
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
