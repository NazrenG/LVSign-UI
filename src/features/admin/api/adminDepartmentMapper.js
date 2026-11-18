export function mapAdminDepartment(dto) {
  return {
    id: dto.id,
    name: dto.name,
    code: dto.code ?? "",
    active: dto.isActive,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapAdminDepartments(data) {
  if (!Array.isArray(data)) {
    throw new Error("Invalid departments API response.");
  }

  return data.map(mapAdminDepartment);
}

export function toDepartmentRequest(values) {
  return {
    name: values.name.trim(),
    code: values.code?.trim() || null,
  };
}
