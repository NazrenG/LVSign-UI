/*
 * Date formatting matches the design exactly ("22 Sep", "Fri 26 Sep").
 * Names are spelled out instead of using Intl, whose en-GB output
 * differs between browsers ("Sep" vs "Sept").
 */
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const toDate = (value) => (value instanceof Date ? value : new Date(value));
const short = (name) => name.slice(0, 3);
const pad = (number) => String(number).padStart(2, "0");

/** "22 Sep" */
export function formatShortDate(value) {
  const date = toDate(value);
  return `${date.getDate()} ${short(MONTHS[date.getMonth()])}`;
}

/** "Fri 26 Sep" */
export const formatDueDate = (value) =>
  `${short(WEEKDAYS[toDate(value).getDay()])} ${formatShortDate(value)}`;

/** "Wednesday 23 September" */
export function formatLongDate(value) {
  const date = toDate(value);
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** "09:41" */
export function formatTime(value) {
  const date = toDate(value);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "23 Sep, 09:41" */
export const formatDateTime = (value) =>
  `${formatShortDate(value)}, ${formatTime(value)}`;

/** "23 Sep 2026 09:41" */
export const formatFullDateTime = (value) =>
  `${formatShortDate(value)} ${toDate(value).getFullYear()} ${formatTime(value)}`;

/** "September" */
export const formatMonthName = (value) => MONTHS[toDate(value).getMonth()];

/** "Good morning" / "Good afternoon" / "Good evening" */
export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** "Farid Aliyev" -> "Farid" */
export const getFirstName = (fullName) => fullName.split(" ")[0];

/** "Nazrin Guliyeva" -> "NK" */
export const getInitials = (fullName) =>
  fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** pluralize(1, 'document') -> "1 document", pluralize(2, 'document') -> "2 documents" */
export const pluralize = (count, word) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;
