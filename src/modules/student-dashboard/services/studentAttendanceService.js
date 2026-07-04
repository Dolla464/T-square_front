import axiosClient from "../../../api/axios";

export const getAttendanceSummary = () =>
  axiosClient.get("/student/attendance/summary");

export const getTodayAttendance = () =>
  axiosClient.get("/student/attendance/today");

export const getAttendanceSchedule = (params = {}) =>
  axiosClient.get("/student/attendance/schedule", { params });

export const getGroupAttendanceHistory = (groupId) =>
  axiosClient.get(`/student/attendance/groups/${groupId}`);

export const getAttendanceQr = (sessionId = null) =>
  axiosClient.get("/student/attendance/qr", {
    params: sessionId ? { session_id: sessionId } : {},
  });
