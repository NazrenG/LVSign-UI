import { Avatar, Button, Sheet } from "@/components/ui";
import { formatDayMonthYear } from "@/utils/formatters";
import { STAMP_SCOPE } from "../../adminConstants";
import { ActiveBadge } from "../StatusBadge";
import { IdentityBadge } from "./UsersTable";

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-[14px] text-ink-muted">{label}</dt>
      <dd className="text-right text-[14px] text-ink">{children}</dd>
    </div>
  );
}

/** Read-only details panel for one user. */
export function UserDetailsSheet({
  user,
  department,
  profile,
  stamps,
  onEdit,
  onToggleActive,
  onClose,
}) {
  if (!user) return null;
  const userStamps = stamps.filter(
    (stamp) =>
      stamp.scope === STAMP_SCOPE.users &&
      stamp.assignedUserIds.includes(user.id),
  );

  return (
    <Sheet isOpen title="User details" onClose={onClose}>
      <div className="rounded-md border border-line bg-surface p-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="lg" />
          <div className="min-w-0">
            <p className="font-medium text-ink">{user.name}</p>
            <p className="truncate text-[13px] text-ink-muted">{user.email}</p>
          </div>
        </div>

        <dl className="mt-3 divide-y divide-line border-t border-line">
          <Row label="Status">
            <ActiveBadge active={user.active} />
          </Row>
          <Row label="Microsoft account">
            <IdentityBadge identity={user.identity} />
          </Row>
          <Row label="Department">{department?.name ?? "—"}</Row>
          <Row label="Permission profile">{profile?.name ?? "—"}</Row>
          <Row label="Added">{formatDayMonthYear(user.addedAt)}</Row>
          <Row label="Assigned stamps">
            {userStamps.length
              ? userStamps.map((stamp) => stamp.name).join(", ")
              : "None"}
          </Row>
        </dl>
      </div>

      <p className="mt-3 text-[12px] text-ink-subtle">
        Microsoft account status is read-only and comes from demo data.
      </p>

      <div className="mt-5 flex flex-col gap-2">
        <Button onClick={() => onEdit(user)}>Edit user</Button>
        <Button
          variant={user.active ? "danger" : "secondary"}
          onClick={() => onToggleActive(user)}
        >
          {user.active ? "Deactivate user" : "Reactivate user"}
        </Button>
      </div>
    </Sheet>
  );
}
