import { Avatar, Badge, Menu } from "@/components/ui";
import { IDENTITY_STATUS } from "../../adminConstants";
import { ActiveBadge } from "../StatusBadge";

const COLUMNS = [
  "Employee",
  "Department",
  "Permission profile",
  "Microsoft account",
  "Status",
];

function rowActions(user, { onView, onEdit, onToggleActive }) {
  return [
    { label: "View details", onSelect: () => onView(user) },
    { label: "Edit user", onSelect: () => onEdit(user) },
    user.active
      ? {
          label: "Deactivate",
          tone: "danger",
          onSelect: () => onToggleActive(user),
        }
      : { label: "Reactivate", onSelect: () => onToggleActive(user) },
  ];
}

function IdentityBadge({ identity }) {
  const status = IDENTITY_STATUS[identity] ?? IDENTITY_STATUS.notLinked;
  return <Badge tone={status.tone}>{status.label}</Badge>;
}

/** Users table (md+) and stacked list (mobile). */
export function UsersTable({
  users,
  departmentsById,
  profilesById,
  ...handlers
}) {
  return (
    <>
      <table className="hidden w-full text-left md:table">
        <thead className="border-b border-line text-sm text-ink-muted">
          <tr>
            {COLUMNS.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 font-medium">
                {column}
              </th>
            ))}
            <th scope="col" className="w-14 px-4 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-canvas">
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => handlers.onView(user)}
                  className="flex items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <Avatar name={user.name} size="md" />
                  <span className="min-w-0">
                    <span className="block font-medium text-ink hover:underline">
                      {user.name}
                    </span>
                    <span className="block text-[13px] text-ink-muted">
                      {user.email}
                    </span>
                  </span>
                </button>
              </td>
              <td className="px-4 py-3 text-[15px] text-ink-muted">
                {departmentsById[user.departmentId]?.name ?? "—"}
              </td>
              <td className="px-4 py-3 text-[15px] text-ink-muted">
                {profilesById[user.profileId]?.name ?? "—"}
              </td>
              <td className="px-4 py-3">
                <IdentityBadge identity={user.identity} />
              </td>
              <td className="px-4 py-3">
                <ActiveBadge active={user.active} />
              </td>
              <td className="px-2 py-3 text-right">
                <Menu
                  label={`Actions for ${user.name}`}
                  items={rowActions(user, handlers)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-line md:hidden">
        {users.map((user) => (
          <li key={user.id} className="flex items-start gap-3 px-4 py-4">
            <Avatar name={user.name} size="md" />
            <button
              type="button"
              onClick={() => handlers.onView(user)}
              className="min-w-0 flex-1 text-left"
            >
              <span className="block font-medium text-ink">{user.name}</span>
              <span className="block truncate text-[13px] text-ink-muted">
                {user.email}
              </span>
              <span className="mt-1 block text-[13px] text-ink-muted">
                {departmentsById[user.departmentId]?.name ?? "—"} ·{" "}
                {profilesById[user.profileId]?.name ?? "—"}
              </span>
              <span className="mt-2 flex flex-wrap gap-2">
                <ActiveBadge active={user.active} />
                <IdentityBadge identity={user.identity} />
              </span>
            </button>
            <Menu
              label={`Actions for ${user.name}`}
              items={rowActions(user, handlers)}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

export { IdentityBadge };
