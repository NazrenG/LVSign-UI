import { adminUsersApi } from "./adminUsersApi";

export async function syncUserPrimaryProfile(
  userId,
  selectedProfileId,
  previousProfileId,
) {
  if (selectedProfileId === previousProfileId) {
    return;
  }

  if (selectedProfileId) {
    await adminUsersApi.assignPermissionProfile(userId, selectedProfileId);
  }

  if (previousProfileId) {
    await adminUsersApi.removePermissionProfile(userId, previousProfileId);
  }
}
