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

export { AdminLayout };

/*
 * Thin route screens for the Admin workspace. They render inside
 * <AdminLayout />, which owns the shared demo state (no backend calls).
 */

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
