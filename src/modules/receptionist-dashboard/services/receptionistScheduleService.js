import axiosClient from "../../../api/axios";

// ── Read ──────────────────────────────────────────────────────────────────────

/**
 * Fetch paginated sessions for the centre-wide schedule (read-only).
 *
 * @param {Object} params
 */
export const getScheduleSessions = (params = {}) =>
  axiosClient.get("/receptionist/schedule", { params }).then((res) => res.data);

// ── Export ────────────────────────────────────────────────────────────────────

/**
 * Download schedule export as PDF or CSV/Excel.
 * Base64-encoded response (same pattern as admin export).
 *
 * @param {Object} filters
 * @param {'pdf'|'excel'} format
 */
export const exportSchedule = async (filters = {}, format = "pdf") => {
  const params = { ...filters, format };

  const response = await axiosClient.get("/receptionist/schedule/export", { params });

  const { content, filename, mime } = response.data?.data ?? {};

  if (!content) throw new Error("Export response missing content.");

  const byteChars   = atob(content);
  const byteNumbers = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteNumbers], { type: mime });

  const url  = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href  = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Get instructors list for the filter dropdown.
 */
export const getInstructorsSelection = () =>
  axiosClient.get("/receptionist/instructors").then((res) => res.data);
