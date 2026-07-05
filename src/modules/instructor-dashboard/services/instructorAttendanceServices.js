import axiosClient from "../../../api/axios";

// ----------------------------------------------------------------------------
// GET /api/instructor/attendance/today-schedule
// Returns today's sessions for the authenticated instructor with attendance stats.
// Response: { session_id, group_name, course_title, session_date,
//             start_time, end_time, room, status, qr_code,
//             attendance: { total, present, absent } }[]
// ----------------------------------------------------------------------------
export const getTodaySchedule = () =>
  axiosClient
    .get("/instructor/attendance/today-schedule")
    .then((res) => res.data);

// ----------------------------------------------------------------------------
// GET /api/instructor/attendance/sessions/{sessionId}
// Returns full session info + list of enrolled students with their statuses.
// Response: { session_id, group_name, course_title, start_time, end_time,
//             room, status, attendance, students[] }
// ----------------------------------------------------------------------------
export const getSessionDetails = (sessionId) =>
  axiosClient
    .get(`/instructor/attendance/sessions/${sessionId}`)
    .then((res) => res.data);

// ----------------------------------------------------------------------------
// POST /api/instructor/attendance/mark
// Marks attendance for a single student.
// Body: { session_id, student_id, status: 'present'|'absent'|'late', notes? }
// ----------------------------------------------------------------------------
export const markAttendance = (sessionId, studentId, status, notes = null) =>
  axiosClient
    .post("/instructor/attendance/mark", {
      session_id: sessionId,
      student_id: studentId,
      status,
      ...(notes ? { notes } : {}),
    })
    .then((res) => res.data);

// ----------------------------------------------------------------------------
// GET /api/instructor/attendance/sessions/{sessionId}/qr
// Returns the QR code for an active session.
// Only succeeds when session status === 'active'.
// Response: { qr_code, session_id, expires_at }
// ----------------------------------------------------------------------------
export const getSessionQr = (sessionId) =>
  axiosClient
    .get(`/instructor/attendance/sessions/${sessionId}/qr`)
    .then((res) => res.data);

// ----------------------------------------------------------------------------
// GET /api/instructor/attendance/sessions/{sessionId}/records?since={ms}
// Returns attendance records created after the `since` timestamp (milliseconds).
// Used for polling-based real-time updates. limit: 20, ordered desc by marked_at.
// Response: { record_id, student_id, student_name, session_id, status, marked_at, marked_by }[]
// ----------------------------------------------------------------------------
export const getSessionRecords = (sessionId, since = null) =>
  axiosClient
    .get(`/instructor/attendance/sessions/${sessionId}/records`, {
      params: since !== null ? { since } : {},
    })
    .then((res) => res.data);
