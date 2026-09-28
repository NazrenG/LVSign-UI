import { toDate } from "@/utils/formatters";

/**
 * Calculated fields, keyed by data key. Each calculator receives the
 * current form values (by data key) and returns the computed value.
 */

/** Mon–Fri days between two ISO dates, inclusive. */
export function countWorkingDays(start, end) {
  if (!start || !end) return "";
  const from = toDate(start);
  const to = toDate(end);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to)
    return "";

  let count = 0;
  for (const day = new Date(from); day <= to; day.setDate(day.getDate() + 1)) {
    const weekday = day.getDay();
    if (weekday !== 0 && weekday !== 6) count += 1;
  }
  return count;
}

const CALCULATORS = {
  "leave.working_days": (values) =>
    countWorkingDays(values["leave.start_date"], values["leave.end_date"]),
};

export const calculateField = (field, values) =>
  CALCULATORS[field.dataKey]?.(values) ?? "";
