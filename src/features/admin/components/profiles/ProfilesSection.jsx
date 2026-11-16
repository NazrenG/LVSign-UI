import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { PROTOTYPE_PERMISSION_GROUPS } from "../../adminConstants";
import { AdminSectionHeader } from "../AdminSectionHeader";
import { ProfileEditorDialog } from "./ProfileEditorDialog";

function groupSummary(permissions) {
  const set = new Set(permissions);
  return PROTOTYPE_PERMISSION_GROUPS.filter((group) =>
    group.permissions.some(({ key }) => set.has(key)),
  ).map((group) => group.label);
}

export function ProfilesSection({ profiles, users, saveProfile }) {
  const [editing, setEditing] = useState(null); // { profile? } | null
  const countFor = (id) => users.filter((user) => user.profileId === id).length;

  return (
    <>
      <AdminSectionHeader
        title="Permission profiles"
        description="Each user has one profile. Permissions shown are a UI prototype and are not enforced."
        actions={
          <Button icon={Plus} onClick={() => setEditing({})}>
            Create profile
          </Button>
        }
      />

      <ul className="grid gap-3 lg:grid-cols-2">
        {profiles.map((profile) => {
          const groups = groupSummary(profile.permissions);
          const count = countFor(profile.id);
          return (
            <li key={profile.id}>
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-semibold text-ink">
                      {profile.name}
                    </h3>
                    <p className="mt-1 text-[14px] text-ink-muted">
                      {profile.description || "No description."}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] text-ink-muted">
                    <Users className="size-4" strokeWidth={1.5} aria-hidden />
                    {count} {count === 1 ? "user" : "users"}
                  </span>
                </div>
                <p className="mt-4 text-[13px] text-ink-muted">
                  {groups.length ? (
                    <>
                      <span className="text-ink">
                        {profile.permissions.length}
                      </span>{" "}
                      permissions · {groups.join(", ")}
                    </>
                  ) : (
                    "No permissions — can sign documents sent to them."
                  )}
                </p>
                <div className="mt-auto pt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditing({ profile })}
                  >
                    View / edit
                  </Button>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      {editing && (
        <ProfileEditorDialog
          profile={editing.profile}
          profiles={profiles}
          assignedCount={editing.profile ? countFor(editing.profile.id) : 0}
          onSave={saveProfile}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
