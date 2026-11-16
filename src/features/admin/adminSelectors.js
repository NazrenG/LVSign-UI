/** Pure helpers for the Admin UI (filtering, counts, lookups). */

export const byId = (items) =>
  Object.fromEntries(items.map((item) => [item.id, item]));

export function filterUsers(users, { query, departmentId, status }) {
  const needle = query.trim().toLowerCase();
  return users.filter((user) => {
    if (departmentId !== "all" && user.departmentId !== departmentId)
      return false;
    if (status === "active" && !user.active) return false;
    if (status === "inactive" && user.active) return false;
    if (!needle) return true;
    return (
      user.name.toLowerCase().includes(needle) ||
      user.email.toLowerCase().includes(needle)
    );
  });
}

export function countBy(users, key) {
  const counts = {};
  for (const user of users) counts[user[key]] = (counts[user[key]] ?? 0) + 1;
  return counts;
}

export function summarize({ users, departments, profiles, stamps }) {
  const active = users.filter((user) => user.active).length;
  return {
    totalUsers: users.length,
    activeUsers: active,
    inactiveUsers: users.length - active,
    departments: departments.length,
    profiles: profiles.length,
    availableStamps: stamps.filter((stamp) => stamp.active).length,
  };
}

export const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

let counter = 0;
/** Local id for items created in the demo session. */
export const demoId = (prefix) => `${prefix}-demo-${Date.now()}-${++counter}`;
