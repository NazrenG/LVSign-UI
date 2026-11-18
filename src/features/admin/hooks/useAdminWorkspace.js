import { useCallback, useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { ALL_PROTOTYPE_PERMISSION_KEYS } from "../adminConstants";
import { demoId } from "../adminSelectors";
import {
  DEFAULT_AGREEMENT_RULES,
  DEMO_DEPARTMENTS,
  DEMO_PROFILES,
  DEMO_STAMPS,
  DEMO_USERS,
} from "../data/adminDemoData";
import { adminUsersApi } from "../api/adminUsersApi";
import { mapAdminUsers } from "../api/adminUserMapper";
import { useCurrentUser } from "@/features/auth/CurrentUserProvider";
import {
  toCreateAdminUserRequest,
  toUpdateAdminUserRequest,
} from "../api/adminUserRequests";

import { adminDepartmentsApi } from "../api/adminDepartmentsApi";
import {
  mapAdminDepartment,
  mapAdminDepartments,
  toDepartmentRequest,
} from "../api/adminDepartmentMapper";

const initialProfiles = () =>
  DEMO_PROFILES.map((profile) => ({
    ...profile,
    permissions: profile.permissions ?? [...ALL_PROTOTYPE_PERMISSION_KEYS],
  }));

/** Every demo confirmation says plainly that nothing was saved. */
function notifyDemo(message) {
  toast.success(message, {
    description: "Demo only — this change is not saved to LV.SignFlow.",
  });
}

const today = () => new Date().toISOString().slice(0, 10);

const releaseImage = (url) => {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
};

/**
 * Local, in-memory state for the Admin UI prototype. Shared by every Admin
 * page through the router outlet context; it resets on reload.
 * No requests are sent anywhere.
 */
export function useAdminWorkspace() {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentsError, setDepartmentsError] = useState(null);
  const [profiles, setProfiles] = useState(initialProfiles);
  const [stamps, setStamps] = useState(DEMO_STAMPS);
  const [agreementRules, setAgreementRules] = useState(DEFAULT_AGREEMENT_RULES);
  const [accessProfiles, setAccessProfiles] = useState([]);
  const [accessRoles, setAccessRoles] = useState([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      adminUsersApi.getPermissionProfiles(),
      adminUsersApi.getRoles(),
    ])
      .then(([profiles, roles]) => {
        if (cancelled) return;
        setAccessProfiles(profiles);
        setAccessRoles(roles);
      })
      .catch((error) => {
        console.error("Access options failed:", error);
        toast.error("Unable to load roles or profiles.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loadDepartments = useCallback(async () => {
    setDepartmentsLoading(true);
    setDepartmentsError(null);

    try {
      const response = await adminDepartmentsApi.getAll();

      setDepartments(mapAdminDepartments(response));
    } catch (error) {
      setDepartments([]);
      setDepartmentsError(error);
    } finally {
      setDepartmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);

    try {
      const response = await adminUsersApi.getUsers();

      setUsers(mapAdminUsers(response));
    } catch (error) {
      setUsers([]);
      setUsersError(error);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const addUser = useCallback(
    async (values) => {
      const createdUser = await adminUsersApi.createUser(
        toCreateAdminUserRequest(values),
      );

      if (values.profileId) {
        try {
          await adminUsersApi.assignPermissionProfile(
            createdUser.id,
            values.profileId,
          );
        } catch (error) {
          await loadUsers();

          throw new Error(
            `User ${createdUser.email} was created, but the ` +
              `permission profile could not be assigned: ${error.message}`,
          );
        }
      }

      await loadUsers();

      toast.success(`${createdUser.displayName} created successfully.`);

      return createdUser;
    },
    [loadUsers],
  );

  const updateUser = useCallback(
    async (userId, values) => {
      try {
        const request = toUpdateAdminUserRequest(values);

        await adminUsersApi.updateUser(userId, request);

        if (
          !values.multipleProfiles &&
          values.profileId !== values.originalProfileId
        ) {
          // First assign the new profile.
          if (values.profileId) {
            await adminUsersApi.assignPermissionProfile(id, values.profileId);
          }

          // Then remove the previous profile.
          if (values.originalProfileId) {
            await adminUsersApi.removePermissionProfile(
              id,
              values.originalProfileId,
            );
          }
        }

        await loadUsers();

        toast.success("User updated successfully.");
      } catch (error) {
        toast.error(error.message || "Failed to update user.");

        throw error;
      }
    },
    [loadUsers],
  );

  const setUserActive = useCallback(
    async (user, isActive) => {
      await adminUsersApi.updateUserStatus(user.id, isActive);

      await loadUsers();

      toast.success(
        isActive
          ? `${user.name} activated successfully.`
          : `${user.name} deactivated successfully.`,
      );
    },
    [loadUsers],
  );

  const saveDepartment = useCallback(
    async (id, values) => {
      try {
        const payload = toDepartmentRequest(values);

        if (id) {
          await adminDepartmentsApi.update(id, payload);
        } else {
          await adminDepartmentsApi.create(payload);
        }

        await loadDepartments();

        toast.success(
          id
            ? "Department updated successfully."
            : "Department created successfully.",
        );
      } catch (error) {
        toast.error(error.message);
        throw error;
      }
    },
    [loadDepartments],
  );

  const setDepartmentActive = useCallback(
    async (id, isActive) => {
      try {
        await adminDepartmentsApi.setActive(id, isActive);
        await loadDepartments();

        toast.success(
          isActive ? "Department activated." : "Department deactivated.",
        );
      } catch (error) {
        toast.error(error.message);
        throw error;
      }
    },
    [loadDepartments],
  );

  const deleteDepartment = useCallback(
    async (id) => {
      try {
        await adminDepartmentsApi.remove(id);
        await loadDepartments();

        toast.success("Department deleted.");
      } catch (error) {
        toast.error(error.message);
        throw error;
      }
    },
    [loadDepartments],
  );

  const saveProfile = useCallback((id, values) => {
    if (id) {
      setProfiles((current) =>
        current.map((profile) =>
          profile.id === id ? { ...profile, ...values } : profile,
        ),
      );
      notifyDemo("Permission profile updated in the demo.");
    } else {
      setProfiles((current) => [...current, { id: demoId("prof"), ...values }]);
      notifyDemo(`${values.name} profile created in the demo.`);
    }
  }, []);

  const saveStamp = useCallback((id, values) => {
    const stamped = { ...values, updatedAt: today(), updatedBy: "You (demo)" };
    if (id) {
      setStamps((current) =>
        current.map((stamp) => {
          if (stamp.id !== id) return stamp;
          if (stamp.imageUrl !== values.imageUrl) releaseImage(stamp.imageUrl);
          return { ...stamp, ...stamped };
        }),
      );
      notifyDemo("Stamp updated in the demo.");
    } else {
      setStamps((current) => [
        { id: demoId("st"), createdAt: today(), ...stamped },
        ...current,
      ]);
      notifyDemo(`${values.name} stamp created in the demo.`);
    }
  }, []);

  const updateStampAssignments = useCallback((id, assignedUserIds) => {
    setStamps((current) =>
      current.map((stamp) =>
        stamp.id === id
          ? {
              ...stamp,
              assignedUserIds,
              updatedAt: today(),
              updatedBy: "You (demo)",
            }
          : stamp,
      ),
    );
    notifyDemo("Stamp assignments updated in the demo.");
  }, []);

  const deleteStamp = useCallback((stamp) => {
    releaseImage(stamp.imageUrl);
    setStamps((current) => current.filter((item) => item.id !== stamp.id));
    notifyDemo(`${stamp.name} removed from the demo list.`);
  }, []);

  const saveAgreementRules = useCallback((values) => {
    setAgreementRules(values);
    notifyDemo("Agreement rules updated for this demo session.");
  }, []);

  const { currentUser, loading: currentUserLoading } = useCurrentUser();

  useEffect(() => {
    if (currentUserLoading) return;

    if (!currentUser) {
      setUsers([]);
      setUsersLoading(false);
      return;
    }

    loadUsers();
  }, [currentUser?.userId, currentUserLoading, loadUsers]);

  return useMemo(
    () => ({
      users,
      departments,
      profiles,
      stamps,
      agreementRules,
      addUser,
      updateUser,
      setUserActive,
      saveDepartment,
      saveProfile,
      saveStamp,
      updateStampAssignments,
      deleteStamp,
      saveAgreementRules,
      usersLoading,
      usersError,
      reloadUsers: loadUsers,
      departmentsLoading,
      departmentsError,
      reloadDepartments: loadDepartments,
      setDepartmentActive,
      deleteDepartment,
    }),
    [
      users,
      departments,
      profiles,
      stamps,
      agreementRules,
      addUser,
      updateUser,
      setUserActive,
      saveDepartment,
      saveProfile,
      saveStamp,
      updateStampAssignments,
      deleteStamp,
      saveAgreementRules,
      usersLoading,
      usersError,
      loadUsers,
      departmentsLoading,
      departmentsError,
      loadDepartments,
      setDepartmentActive,
      deleteDepartment,
    ],
  );
}
