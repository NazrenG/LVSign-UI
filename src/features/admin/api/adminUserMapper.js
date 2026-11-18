/**
 * Converts an AdminUserDto returned by the API
 * into the existing Admin UI user model.
 */
export function mapAdminUser(dto) {
  return {
    id: dto.id,

    // Existing UI properties
    name: dto.displayName ?? "",
    email: dto.email ?? "",
    jobTitle: dto.jobTitle ?? "",
    departmentId: dto.departmentId ?? null,
    departmentName: dto.departmentName ?? null,
    active: Boolean(dto.isActive),
    identity: dto.isMicrosoftLinked ? "linked" : "notLinked",
    addedAt: dto.createdAt ?? null,

    // No single profile is assumed.
    // Real assignments will be integrated in 5F.
    profileId: null,

    // Additional API metadata
    organizationId: dto.organizationId,
    updatedAt: dto.updatedAt ?? null,
    isMicrosoftLinked: Boolean(dto.isMicrosoftLinked),
  };
}

export function mapAdminUsers(data) {
  if (!Array.isArray(data)) {
    throw new Error("Invalid Admin Users API response: expected an array.");
  }

  return data.map(mapAdminUser);
}
