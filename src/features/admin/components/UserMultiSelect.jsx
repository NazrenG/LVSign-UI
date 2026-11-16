import { useId, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Avatar, Checkbox, SearchInput } from "@/components/ui";

/**
 * Searchable multi-select of employees: selected people show as removable
 * chips above a filterable checklist. Inactive users are listed but marked.
 */
export function UserMultiSelect({
  users,
  departmentsById,
  value,
  onChange,
  label,
}) {
  const [query, setQuery] = useState("");
  const listId = useId();
  const selected = useMemo(() => new Set(value), [value]);

  const needle = query.trim().toLowerCase();
  const visible = users.filter(
    (user) =>
      !needle ||
      user.name.toLowerCase().includes(needle) ||
      user.email.toLowerCase().includes(needle),
  );

  const toggle = (id) =>
    onChange(
      selected.has(id) ? value.filter((item) => item !== id) : [...value, id],
    );

  const selectedUsers = users.filter((user) => selected.has(user.id));

  return (
    <fieldset className="space-y-3">
      <legend className="mb-1.5 text-sm font-medium text-ink">{label}</legend>

      {selectedUsers.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Selected users">
          {selectedUsers.map((user) => (
            <li
              key={user.id}
              className="inline-flex items-center gap-1.5 rounded-sm border border-line bg-canvas py-1 pr-1 pl-2.5 text-[13px] text-ink"
            >
              {user.name}
              <button
                type="button"
                onClick={() => toggle(user.id)}
                className="rounded-sm p-0.5 text-ink-muted hover:bg-line hover:text-ink"
                aria-label={`Remove ${user.name}`}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-ink-muted">No users selected yet.</p>
      )}

      <SearchInput
        placeholder="Search employees by name or email"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-controls={listId}
      />

      <ul
        id={listId}
        className="max-h-60 divide-y divide-line overflow-y-auto rounded-md border border-line"
      >
        {visible.length === 0 && (
          <li className="px-4 py-6 text-center text-[14px] text-ink-muted">
            No employees match “{query}”.
          </li>
        )}
        {visible.map((user) => (
          <li key={user.id}>
            <label className="flex cursor-pointer items-center gap-3 px-3.5 py-2.5 hover:bg-canvas">
              <Checkbox
                checked={selected.has(user.id)}
                onChange={() => toggle(user.id)}
                aria-label={user.name}
              />
              <Avatar name={user.name} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium text-ink">
                  {user.name}
                  {!user.active && (
                    <span className="ml-2 text-[12px] font-normal text-ink-subtle">
                      Inactive
                    </span>
                  )}
                </span>
                <span className="block truncate text-[12px] text-ink-muted">
                  {departmentsById[user.departmentId]?.name ?? "No department"}{" "}
                  · {user.email}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
