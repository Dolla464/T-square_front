import axiosClient from "../../../api/axios";

// ── Read ──────────────────────────────────────────────────────────────────────

/**
 * Fetch paginated sessions for the centre-wide schedule.
 *
 * @param {Object} params
 * @param {string} [params.date]           Filter by effective session date (YYYY-MM-DD)
 * @param {number} [params.instructor_id]  Filter by instructor ID
 * @param {string} [params.status]         Filter by status: upcoming|active|completed|cancelled
 * @param {number} [params.group_id]       Filter by group ID
 * @param {number} [params.per_page]       Items per page (default 15)
 * @param {number} [params.page]           Current page
 */
export const getScheduleSessions = (params = {}) =>
  axiosClient.get("/admin/schedule", { params }).then((res) => res.data);

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Reschedule a session (override date + time).
 *
 * @param {number} sessionId
 * @param {{ date: string, start_time: string, end_time: string }} data
 */
export const rescheduleSession = (sessionId, data) =>
  axiosClient
    .put(`/admin/schedule/${sessionId}`, data)
    .then((res) => res.data);

/**
 * Cancel a session.
 *
 * @param {number} sessionId
 * @param {string|null} reason
 */
export const cancelSession = (sessionId, reason = null) =>
  axiosClient
    .delete(`/admin/schedule/${sessionId}`, { data: { reason } })
    .then((res) => res.data);

// ── Export ────────────────────────────────────────────────────────────────────

/**
 * Download schedule export as PDF or CSV/Excel.
 *
 * The backend returns the file as a base64-encoded JSON payload so that:
 *   - Laravel CORS middleware headers are preserved (no streaming).
 *   - Browser download managers (e.g. IDM) do not intercept the XHR request.
 *
 * @param {Object} filters  Same filter params as getScheduleSessions
 * @param {'pdf'|'excel'} format
 */
export const exportSchedule = async (filters = {}, format = "pdf") => {
  const params = { ...filters, format };

  const response = await axiosClient.get("/admin/schedule/export", { params });

  const { content, filename, mime } = response.data?.data ?? {};

  if (!content) throw new Error("Export response missing content.");

  // Decode base64 → Uint8Array → Blob
  const byteChars   = atob(content);
  const byteNumbers = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteNumbers], { type: mime });

  // Trigger browser download
  const url  = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href  = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// ── Helpers (reuse existing endpoints) ───────────────────────────────────────

/**
 * Get instructors list for the filter dropdown.
 * Re-uses the existing admin instructors selection endpoint.
 */
export const getInstructorsSelection = () =>
  axiosClient.get("/admin/instructors").then((res) => res.data);
