import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardHeader,
  Checkbox,
  SettingRow,
  Toggle,
} from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { ACCESS_ROLES } from "@/data/templateRoles";

const PERMISSIONS = [
  { key: "use", label: "Can use" },
  { key: "edit", label: "Can edit" },
];

export function AccessPermissionsCard({ template, actions }) {
  const setPermission = (roleId, permission, value) =>
    actions.updateSection("access", {
      [roleId]: { ...template.access[roleId], [permission]: value },
    });

  return (
    <Card className="p-5 sm:p-6">
      <CardHeader
        title="Access permissions"
        description="Role-based. Permissions come from the roles in LV Sign Admin, not from individual people."
        action={
          // New roles are created in LV Sign Admin, then appear here.
          <Button as={Link} to={ROUTES.admin} variant="ghost" icon={Plus}>
            Add role
          </Button>
        }
      />

      <div className="overflow-hidden rounded-sm border border-line">
        <table className="w-full text-left">
          <thead className="bg-canvas text-[13px] text-ink-muted">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Role
              </th>
              {PERMISSIONS.map((permission) => (
                <th
                  key={permission.key}
                  scope="col"
                  className="w-20 px-2 py-2.5 text-center font-medium sm:w-32"
                >
                  {permission.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ACCESS_ROLES.map((role) => (
              <tr key={role.id}>
                <td className="px-4 py-3">
                  <p className="text-[15px] font-medium text-ink">
                    {role.name}
                  </p>
                  <p className="text-[13px] text-ink-muted">
                    {role.description}
                  </p>
                </td>
                {PERMISSIONS.map((permission) => (
                  <td key={permission.key} className="px-2 py-3 text-center">
                    <Checkbox
                      aria-label={`${role.name}: ${permission.label}`}
                      checked={Boolean(
                        template.access[role.id]?.[permission.key],
                      )}
                      onChange={(event) =>
                        setPermission(
                          role.id,
                          permission.key,
                          event.target.checked,
                        )
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 space-y-5">
        <SettingRow
          title="Allow senders to change the signing route"
          description="When off, the route set in step 2 is locked for every document made from this template."
          control={
            <Toggle
              label="Allow senders to change the signing route"
              checked={template.allowRouteChange}
              onChange={(allowRouteChange) =>
                actions.update({ allowRouteChange })
              }
            />
          }
        />
        <SettingRow
          title="Hide from the template list"
          description="People with access can still open it from a direct link."
          control={
            <Toggle
              label="Hide from the template list"
              checked={template.hidden}
              onChange={(hidden) => actions.update({ hidden })}
            />
          }
        />
      </div>
    </Card>
  );
}
