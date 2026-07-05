import axiosClient from "../../../api/axios";

export const getAttendanceSummary = () =>
  axiosClient.get("/student/attendance/summary").then((res) => res.data);

export const getTodayAttendance = () =>
  axiosClient.get("/student/attendance/today").then((res) => res.data);

export const getAttendanceSchedule = (params = {}) =>
  axiosClient
    .get("/student/attendance/schedule", { params })
    .then((res) => res.data);

export const getGroupAttendanceHistory = (groupId) =>
  axiosClient
    .get(`/student/attendance/groups/${groupId}`)
    .then((res) => res.data);

export const getAttendanceQr = (sessionId = null) =>
  axiosClient
    .get("/student/attendance/qr", {
      params: sessionId ? { session_id: sessionId } : {},
    })
    .then((res) => res.data);

export const checkInWithSessionQr = (qrCode) =>
  axiosClient
    .post("/student/attendance/check-in", { qr_code: qrCode })
    .then((res) => res.data);
