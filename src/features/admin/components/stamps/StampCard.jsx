import { Building2, Users } from "lucide-react";
import { Avatar, Card, Menu } from "@/components/ui";
import { formatDayMonthYear } from "@/utils/formatters";
import { STAMP_SCOPE } from "../../adminConstants";
import { ActiveBadge } from "../StatusBadge";
import { StampPreview } from "./StampPreview";

export function StampCard({
  stamp,
  usersById,
  onEdit,
  onAssign,
  onToggleActive,
  onDelete,
}) {
  const isCompany = stamp.scope === STAMP_SCOPE.company;
  const assigned = stamp.assignedUserIds
    .map((id) => usersById[id])
    .filter(Boolean);

  const items = [
    { label: "Edit stamp", onSelect: () => onEdit(stamp) },
    ...(isCompany
      ? []
      : [{ label: "Manage assignments", onSelect: () => onAssign(stamp) }]),
    {
      label: stamp.active ? "Deactivate" : "Activate",
      onSelect: () => onToggleActive(stamp),
    },
    { label: "Delete stamp", tone: "danger", onSelect: () => onDelete(stamp) },
  ];

  return (
    <Card className="flex h-full flex-col">
      <StampPreview
        src={stamp.imageUrl}
        alt={`${stamp.name} stamp`}
        className={`m-4 mb-0 h-36 ${stamp.active ? "" : "opacity-50"}`}
      />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-ink">{stamp.name}</h3>
            {stamp.description && (
              <p className="mt-0.5 text-[13px] text-ink-muted">
                {stamp.description}
              </p>
            )}
          </div>
          <Menu label={`Actions for ${stamp.name}`} items={items} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ActiveBadge active={stamp.active} />
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-canvas-muted px-2 py-0.5 text-[13px] text-ink-muted">
            {isCompany ? (
              <Building2 className="size-3.5" strokeWidth={1.75} aria-hidden />
            ) : (
              <Users className="size-3.5" strokeWidth={1.75} aria-hidden />
            )}
            {isCompany ? "Company stamp" : "User-assigned"}
          </span>
        </div>

        <div className="mt-4 border-t border-line pt-3">
          {isCompany ? (
            <p className="text-[13px] text-ink-muted">
              Not assigned to individual users.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => onAssign(stamp)}
              className="flex items-center gap-2 text-left text-[13px] text-ink-muted hover:text-ink"
              aria-label={`Manage assignments for ${stamp.name}`}
            >
              <span className="flex -space-x-2">
                {assigned.slice(0, 4).map((user) => (
                  <Avatar
                    key={user.id}
                    name={user.name}
                    size="sm"
                    className="ring-2 ring-surface"
                  />
                ))}
              </span>
              {assigned.length} assigned{" "}
              {assigned.length === 1 ? "user" : "users"}
            </button>
          )}
          <p className="mt-2 font-mono text-[11px] text-ink-subtle">
            Updated {formatDayMonthYear(stamp.updatedAt)} · {stamp.updatedBy}
          </p>
        </div>
      </div>
    </Card>
  );
}
