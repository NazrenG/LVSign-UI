import {
  AdminLayout,
  AdminOverview,
  AgreementRulesSection,
  DepartmentsSection,
  ProfilesSection,
  StampsSection,
  UsersSection,
  useAdmin,
} from "@/features/admin";
import { adminUsersApi } from "@/features/admin/api/adminUsersApi";

export { AdminLayout };

/*
 * Thin route screens for the Admin workspace. They render inside
 * <AdminLayout />, which owns the shared demo state (no backend calls).
 */
const users = await adminUsersApi.getUsers();
console.log(users);
export function AdminOverviewPage() {
  return <AdminOverview {...useAdmin()} />;
}

export function AdminUsersPage() {
  return <UsersSection {...useAdmin()} />;
}

export function AdminDepartmentsPage() {
  return <DepartmentsSection {...useAdmin()} />;
}

export function AdminPermissionProfilesPage() {
  return <ProfilesSection {...useAdmin()} />;
}

export function AdminStampsPage() {
  return <StampsSection {...useAdmin()} />;
}

export function AdminAgreementRulesPage() {
  return <AgreementRulesSection {...useAdmin()} />;
}
