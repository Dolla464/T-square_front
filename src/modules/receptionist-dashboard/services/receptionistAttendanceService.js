import axiosClient from "../../../api/axios";

// GET /api/receptionist/attendance/today-schedule
export const getTodaySchedule = () =>
  axiosClient
    .get("/receptionist/attendance/today-schedule")
    .then((res) => res.data);

// GET /api/receptionist/attendance/sessions/{sessionId}
export const getSessionDetails = (sessionId) =>
  axiosClient
    .get(`/receptionist/attendance/sessions/${sessionId}`)
    .then((res) => res.data);

// POST /api/receptionist/attendance/mark
export const markAttendance = (sessionId, studentId, status, notes = null) =>
  axiosClient
    .post("/receptionist/attendance/mark", {
      session_id: sessionId,
      student_id: studentId,
      status,
      ...(notes ? { notes } : {}),
    })
    .then((res) => res.data);

// GET /api/receptionist/attendance/sessions/{sessionId}/qr
export const getSessionQr = (sessionId) =>
  axiosClient
    .get(`/receptionist/attendance/sessions/${sessionId}/qr`)
    .then((res) => res.data);

// GET /api/receptionist/attendance/sessions/{sessionId}/records?since={ms}
export const getSessionRecords = (sessionId, since = null) =>
  axiosClient
    .get(`/receptionist/attendance/sessions/${sessionId}/records`, {
      params: since !== null ? { since } : {},
    })
    .then((res) => res.data);
