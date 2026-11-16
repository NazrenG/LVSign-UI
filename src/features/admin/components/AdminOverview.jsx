import { ArrowRight, BadgeCheck, Scale, Stamp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, Badge, Card, CardHeader, IconTile } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { IDENTITY_STATUS } from "../adminConstants";
import { summarize } from "../adminSelectors";

const SHORTCUTS = [
  {
    title: "Manage users",
    description: "Add employees, change departments and deactivate accounts.",
    to: ROUTES.adminUsers,
    icon: Users,
  },
  {
    title: "Manage permissions",
    description: "Review what each permission profile allows.",
    to: ROUTES.adminPermissionProfiles,
    icon: BadgeCheck,
  },
  {
    title: "Manage stamps",
    description: "Upload company stamps and assign them to people.",
    to: ROUTES.adminStamps,
    icon: Stamp,
  },
  {
    title: "Agreement rules",
    description: "Organization defaults for expiry, reminders and signing.",
    to: ROUTES.adminAgreementRules,
    icon: Scale,
  },
];

export function AdminOverview({ users, departments, profiles, stamps }) {
  const summary = summarize({ users, departments, profiles, stamps });
  const stats = [
    { label: "Total users", value: summary.totalUsers },
    { label: "Active users", value: summary.activeUsers },
    { label: "Inactive users", value: summary.inactiveUsers },
    { label: "Departments", value: summary.departments },
    { label: "Permission profiles", value: summary.profiles },
    { label: "Available stamps", value: summary.availableStamps },
  ];
  const attention = users.filter(
    (user) => user.active && user.identity !== "linked",
  );

  return (
    <div className="space-y-8">
      <section aria-label="Summary">
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
          {stats.map(({ label, value }) => (
            <Card key={label} className="flex flex-col-reverse justify-end p-5">
              <dt className="mt-1 text-[14px] text-ink-muted">{label}</dt>
              <dd className="font-serif text-4xl text-ink">{value}</dd>
            </Card>
          ))}
        </dl>
      </section>

      <section aria-labelledby="admin-shortcuts">
        <h2
          id="admin-shortcuts"
          className="mb-3 text-base font-semibold text-ink"
        >
          Shortcuts
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {SHORTCUTS.map(({ title, description, to, icon }) => (
            <li key={to}>
              <Link
                to={to}
                className="group flex h-full items-start gap-4 rounded-md border border-line bg-surface p-5 transition-colors hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <IconTile icon={icon} className="shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[15px] font-medium text-ink">
                    {title}
                    <ArrowRight
                      className="size-4 text-ink-subtle transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                  <span className="mt-1 block text-[13px] text-ink-muted">
                    {description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Card className="p-5 sm:p-6">
        <CardHeader
          title="Microsoft accounts to check"
          description="Active users whose Microsoft account is not linked yet (from demo data)."
          className="mb-3"
        />
        {attention.length === 0 ? (
          <p className="py-4 text-[14px] text-ink-muted">
            Every active user has a linked Microsoft account.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {attention.map((user) => (
              <li key={user.id} className="flex items-center gap-3 py-3">
                <Avatar name={user.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-ink">
                    {user.name}
                  </span>
                  <span className="block truncate text-[13px] text-ink-muted">
                    {user.email}
                  </span>
                </span>
                <Badge tone={IDENTITY_STATUS[user.identity].tone}>
                  {IDENTITY_STATUS[user.identity].label}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
