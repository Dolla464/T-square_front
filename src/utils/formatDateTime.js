/**
 * Format an ISO / timestamp value as localized date + time (no raw ISO string).
 */
export function formatDateTime(value, locale) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const resolvedLocale = locale || undefined;

  return date.toLocaleString(resolvedLocale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
