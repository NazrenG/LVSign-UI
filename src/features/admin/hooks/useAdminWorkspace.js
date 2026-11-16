import { useCallback, useMemo, useState } from "react";
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
  const [users, setUsers] = useState(DEMO_USERS);
  const [departments, setDepartments] = useState(DEMO_DEPARTMENTS);
  const [profiles, setProfiles] = useState(initialProfiles);
  const [stamps, setStamps] = useState(DEMO_STAMPS);
  const [agreementRules, setAgreementRules] = useState(DEFAULT_AGREEMENT_RULES);

  const addUser = useCallback((values) => {
    setUsers((current) => [
      {
        id: demoId("u"),
        ...values,
        email: values.email.trim().toLowerCase(),
        identity: "notLinked",
        addedAt: today(),
      },
      ...current,
    ]);
    notifyDemo(`${values.name} added to the demo user list.`);
  }, []);

  const updateUser = useCallback((id, values) => {
    setUsers((current) =>
      current.map((user) => (user.id === id ? { ...user, ...values } : user)),
    );
    notifyDemo("User updated in the demo.");
  }, []);

  const setUserActive = useCallback((user, active) => {
    setUsers((current) =>
      current.map((item) => (item.id === user.id ? { ...item, active } : item)),
    );
    notifyDemo(
      `${user.name} ${active ? "reactivated" : "deactivated"} in the demo.`,
    );
  }, []);

  const saveDepartment = useCallback((id, values) => {
    if (id) {
      setDepartments((current) =>
        current.map((dep) => (dep.id === id ? { ...dep, ...values } : dep)),
      );
      notifyDemo("Department updated in the demo.");
    } else {
      setDepartments((current) => [
        ...current,
        { id: demoId("dep"), ...values },
      ]);
      notifyDemo(`${values.name} added to the demo departments.`);
    }
  }, []);

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
    ],
  );
}
