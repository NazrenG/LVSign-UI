
export function toCreateAdminUserRequest(values) {
  return {
    displayName: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    jobTitle: values.jobTitle?.trim() || null,
    departmentId: values.departmentId,
  };
}

export function toUpdateAdminUserRequest(values) {
  return {
    displayName: values.name.trim(),
    jobTitle: values.jobTitle?.trim() || null,
    departmentId: values.departmentId,
  };
}
