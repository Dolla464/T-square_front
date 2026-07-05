const APP_TIMEZONE = "Africa/Cairo";
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Extract YYYY-MM-DD from an API date value (plain date or Laravel ISO UTC).
 * Avoids slice(0,10) on UTC strings which shifts dates back one day in Cairo.
 */
export function parseApiDateOnly(value) {
  if (!value) return "";

  const str = String(value).trim();
  if (DATE_ONLY_PATTERN.test(str)) return str;

  const date = new Date(str);
  if (Number.isNaN(date.getTime())) return str.slice(0, 10);

  return date.toLocaleDateString("en-CA", { timeZone: APP_TIMEZONE });
}

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
