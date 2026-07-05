/**
 * Extracts a human-readable error message from an Axios error response.
 *
 * The Laravel backend returns:
 *   { status: "error", message: "<first validation error>", errors: { field: ["msg", ...] } }
 *
 * Priority:
 *   1. response.data.message  — concise first-error string set by bootstrap/app.php
 *   2. response.data.errors   — all field-level messages joined with " • "
 *   3. fallback               — caller-supplied default
 */
export function getApiErrorMessage(err, fallback = "Something went wrong") {
  const data = err?.response?.data;
  if (!data) return fallback;

  if (data.message) return data.message;

  if (data.errors) {
    const messages = Object.values(data.errors).flat().filter(Boolean);
    if (messages.length) return messages.join(" • ");
  }

  return fallback;
}
